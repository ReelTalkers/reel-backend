import { GraphQLScalarType } from 'graphql';
import { User, Person, Media, Review } from './connectors';
import {
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';
import rp from "request-promise";

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
    all_media() {
      return Media.findAll()
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
