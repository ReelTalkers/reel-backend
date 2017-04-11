import { GraphQLScalarType } from 'graphql';
import { User, Person, Media, Review } from './connectors';
import {
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';
import rp from "request-promise";
import Q from 'q';

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
      if (!context.user_id) {
        return null
      } else {
        let id = context.user_id.toString();
        let where = { id };
        return User.find({ where });
      }
    },
    users() {
      return User.findAll();
    },
    people() {
      return Person.findAll();
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
    recommendations(_, { userIds, genres, quantity }) {
      var requestOptions = {
          uri: 'http://localhost:5000/recommendations',
          method: 'POST',
          body: { quantity: quantity, method: "least_misery" },
          json: true // Automatically parses the JSON string in the response
      };

      var users = [];
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

      var filterGenres = function(genre) {
        return !genres.includes(genre);
      }

      users = Q.all(users);
      return users.then((users) => {
          requestOptions.body.users = users;
          return rp(requestOptions);
        }).then(genresResponse => {
          Object.keys(genresResponse).filter(filterGenres)
            .forEach(function (genre) {
              delete genresResponse[genre];
            })
            .map(function (genre) {
              return { name: genre }
            });
          return genresResponse;
          //var genres = genresResponse.map((genre) => { return Media.findById(id) });
          //return Q.all(genres);
        });
    },
    logged_in(_, args, context) {
      return typeof context.user_id !== 'undefined';
    },
  },
  Media: {
    reviews(obj, args, context) {
      return obj.getReviews();
    }
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
    }
  },
  Mutation: {
    createReview(_, args) {
      return Review.create(args);
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
