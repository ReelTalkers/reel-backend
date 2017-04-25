import { GraphQLScalarType } from 'graphql';
import { User, Person, Media, Review, Cast, Crew } from './connectors';
import {
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';
import rp from "request-promise";
import Q from 'q';
import { GUIDEBOX_KEY } from '../keys.js';
var fs = require('fs');

var guideboxkey = GUIDEBOX_KEY

var parsePhoneNumber = function(value) {
  return value
}

// These two methods create function closures for use in recommendations query
var createDoesNotInclude = function(list) {
  return function(obj) {
    return !list.includes(obj);
  }
}

var filterGenres = function(genres) {
  var filterFunction = createDoesNotInclude(genres);

  return function(genresResponse) {
    Object.keys(genresResponse)
      .filter(filterFunction)
      .forEach(function (genre) {
        delete genresResponse[genre];
      })
    return genresResponse;
  }
}

var orderByGenres = function(requestedGenres) {
  return function(genre) {
    return requestedGenres.findIndex(genre.name);
  }
}

var sortGenres = function(requestedGenres) {
  var sortFunction = orderByGenres(requestedGenres);
  return function(genreList) {
    genreList.sort(sortFunction);
    return genreList;
  }
}

const resolveFunctions = {
  Query: {
    user(_, { id, userName }) {
      let where = {}
      if(id==null) {
        where = { userName };
      } else {
        where = { id };
      }
      return User.find({ where });
    },
    current_user(_, args, context) {
      // if the user is not logged in
      if (!context.userId) {
        return null
      } else {
        let id = context.userId.toString();
        let where = { id };
        return User.find({ where });
      }
    },
    users() {
      return User.findAll();
    },
    search_users(_, { fullName, quantity }) {
      return User.findAll({
        limit: quantity,
        where: {
          fullName:  {
            $iLike: ('%'+fullName+'%')
          }
        }
      })
    },
    people() {
      return Person.findAll();
    },
    crew() {
      return Crew.findAll();
    },
    cast() {
      return Cast.findAll();
    },
    all_media(_, { limit, offset }) {
      return Media.findAll({
        limit: limit,
        offset: offset
      })
    },
    media(_, { id }) {
      return Media.findById(id);
    },
    search_media(_, { title, quantity }) {
      return Media.findAll({
        limit: quantity,
        where: {
          title: {
            $iLike: ('%'+title+'%'),
          }
        }
      })
    },
    recommendations(_, { userIds, genres, minYear, quantity }, context) {
      var requestOptions = {
          uri: 'http://localhost:5000/recommendations',
          method: 'POST',
          body: { quantity: quantity, min_year: minYear, method: "least_misery" },
          json: true // Automatically parses the JSON string in the response
      };

      var users = [];
      // For testing without front-end
      if(context.userId)
        userIds.push(context.userId);

      for(var id in userIds) {
        var userPromise = User.findById(userIds[id]).then(u => {
          return Q.all([u.getReviews(), u.id]);
        })
        .then(u => {
          var reviews = u[0].map((review) => { return { imdb: review.mediaId, rating: review.score } });
          var user = {
            ratings: reviews,
            user: u[1],
            is_cached: false
          };
          return user;
        })
        users.push(userPromise);
      }

      users = Q.all(users);
      return users.then((users) => {
          requestOptions.body.users = users;
          return rp(requestOptions);
        }).then(filterGenres(genres)) // Makes call to closure function at the top of this file
        .then(genresResponse => {
          var genres = []
          Object.keys(genresResponse).forEach(function(key,index) {
            var genreMedia = genresResponse[key].map((id) => {
              return Media.findById(id);
            });
            genreMedia = Q.all(genreMedia);
            genres.push({ name: key, media: genreMedia });
          });
          genres = Q.all(genres);
          return genres;
        }).then(sortGenres(genres));
    },
    logged_in(_, args, context) {
      return typeof context.userId !== 'undefined';
    },
  },
  Media: {
    reviews(obj, args, context) {
      return obj.getReviews();
    },
    review(obj, args, context) {
      return Review.findOne({
       where: {
         mediaId: obj.id,
         userId: context.userId
       }
     });
    },
    cast(obj, args, context) {
      return obj.getCasts({
        limit: args.limit,
        order: [['order', 'ASC']]
      });
    },
    credits(obj, args, context) {
      return obj.getCrews({
        limit: args.limit
      });
    },
    directors(obj, args, context) {
      return obj.getCrews({
        where: {
          job: "Director"
        }
      })
    },
    writers(obj, args, context) {
      return obj.getCrews({
        where: {
          department: "Writing"
        }
      })
    },
    similar_media(obj, args, context) {
      var requestOptions = {
          uri: 'http://localhost:5000/similar_movies',
          method: 'POST',
          body: { quantity: args.quantity, movies: [obj.id] },
          json: true // Automatically parses the JSON string in the response
      };

      return rp(requestOptions)
        .then((response) => {
          return response.map((id) => Media.findById(id));
        })
    },
    sources(obj, args, context) {
      var requestOptions = {
          uri: 'http://api-public.guidebox.com/v2/search?type=movie&field=title&query=' + obj.title,
          qs: {
              api_key: guideboxkey // -> uri + '?api_key=xxxxx%20xxxxx'
          },
          headers: {
              'User-Agent': 'Request-Promise'
          },
          json: true // Automatically parses the JSON string in the response
      };

      var findId = function(results) {
        return results.results[0].id;
      }

      var requestMovie = function(requestOptions) {
        return function(id) {
          requestOptions.uri = 'http://api-public.guidebox.com/v2/movies/' + id;
          return rp(requestOptions);
        }
      }

      var parseSources = function(results) {
        // Do we want to implement the following?
        // free_web_sources
        // tv_everywhere_web_sources
        var sources = [];
        results.subscription_web_sources.forEach((source) => {
          sources.push({name:source.display_name, link: source.link, type:"Subscription", price:0.0 })
        });
        results.purchase_web_sources.forEach((source) => {
          source.formats.forEach((format) => {
            sources.push({ name: source.display_name, link: source.link, type:format.type, price:format.price })
          })
        });

        return sources;
      }

      return rp(requestOptions)
        .then(findId)
        .then(requestMovie(requestOptions))
        .then(parseSources)
    },
  },
  Review: {
    media(obj, args, context) {
      return Media.findById(obj.mediaId);
    },
    user(obj, args, context) {
      return User.findById(obj.userId)
    },
  },
  User: {
    reviews(obj, args, context) {
      return obj.getReviews();
    },
    groupMembers(obj, args, context) {
      return obj.getGroupMembers();
    }
  },
  Person: {
    roles(obj, args, context) {
      // Sequelize auto-naming ftw
      return obj.getCasts();
    },
    credits(obj, args, context) {
      return obj.getCrews();
    }
  },
  Crew: {
    media(obj, args, context) {
      return Media.findById(obj.mediaId);
    },
    person(obj, args, context) {
      return Person.findById(obj.personId);
    },
  },
  Cast: {
    media(obj, args, context) {
      return Media.findById(obj.mediaId);
    },
    person(obj, args, context) {
      return Person.findById(obj.personId);
    },
  },
  Mutation: {
    reviewMedia(_, args, context) {
      var updateOrCreate = function(args, context) {
        return function(currentReview) {
          if(currentReview) {
            return currentReview.update({ score: args.score });
          } else {
            return Review.create({ mediaId: args.mediaId, score: args.score, userId: context.userId});
          }
        }
      }
      return Review.findOne({
        where: {
          mediaId: args.mediaId,
          userId: context.userId
        }
      }).then(updateOrCreate(args, context))
      .then( () => Media.findById(args.mediaId));
    },
    createUser(_, args) {
      // default dateJoined must be in resolver because it must be run every time
      args.dateJoined = new Date();
      return User
        .findOrCreate({where: args, defaults: {}})
        .spread( (instance, value) => instance);
    },
    addUserToGroup(_, { id }, context) {
      var addUser = function(id) {
        return function(user) {
          return User.findById(id)
            .then((newUser) => user.addGroupMember(newUser))
            .then(() => user.getGroupMembers());
        }
      }
      return User.findById(context.userId)
        .then(addUser(id));
    },
    removeUserFromGroup(_, { id }, context) {
      var removeUser = function(id) {
        return function(user) {
          return User.findById(id)
            .then((userToRemove) => user.removeGroupMember(userToRemove))
            .then(() => user.getGroupMembers());
        }
      }
      return User.findById(context.userId)
        .then(removeUser(id));
    }
  },
  GraphQLURL: GraphQLURL,
  GraphQLDateTime: GraphQLDateTime,
  GraphQLLimitedString: GraphQLLimitedString,
  GraphQLPassword: GraphQLPassword,
};

export default resolveFunctions;
