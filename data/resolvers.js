import { GraphQLScalarType } from 'graphql';
import { User, Person, Media, Review, Cast, Crew } from './connectors';
import {
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';
import rp from "request-promise";
import { GUIDEBOX_KEY } from '../keys.js';
var fs = require('fs');

var guideboxkey = GUIDEBOX_KEY

var parsePhoneNumber = function(value) {
  return value
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
    search_users(_, { username }) {
      return User.findAll({
        where: {
          username:  {
            $like: ('%'+username+'%')
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
    search_media(_, { title }) {
      return Media.findAll({
        where: {
          title: {
            $like: ('%'+title+'%'),
          }
        }
      })
    },
    recommendations(_, { userId }) {
      var requestOptions = {
          uri: 'http://localhost:5000/recommendations',
          method: 'POST',
          body: { num_recs: 10 },
          json: true // Automatically parses the JSON string in the response
      };
      var id = userId
      let where = { id };
      return User.find({ where })
        .then(user => {
          requestOptions.body.user = user.id;
          return user.getReviews();
        })
        .then(reviews => {
          reviews = reviews.map((review) => { return { imdb: review.id, rating: review.score } });
          requestOptions.body.ratings = reviews;
          return rp(requestOptions);
        })
        .then(ids => {
          media = ids.map((id) => { id: imdb });
          return media;
        });
    },
    logged_in(_, args, context) {
      return typeof context.userId !== 'undefined';
    },
  },
  Media: {
    reviews(obj, args, context) {
      return obj.getReviews();
    },
    cast(obj, args, context) {
      return obj.getCasts({
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
      }).then(updateOrCreate(args, context));
    },
    createUser(_, args) {
      // default dateJoined must be in resolver because it must be run every time
      args.dateJoined = new Date();
      return User
        .findOrCreate({where: args, defaults: {}})
        .spread( (instance, value) => instance);
    }
  },
  GraphQLURL: GraphQLURL,
  GraphQLDateTime: GraphQLDateTime,
  GraphQLLimitedString: GraphQLLimitedString,
  GraphQLPassword: GraphQLPassword,
};

export default resolveFunctions;
