import { GraphQLScalarType } from 'graphql';
import { User, Person, Media, Review } from './connectors';
import {
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';

var parsePhoneNumber = function(value) {
  return value
}

const resolveFunctions = {
  Query: {
    user(_, { id }) {
      let where = { id };
      return User.find({ where });
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
      return User.create(args);
    }
  },
  GraphQLURL: GraphQLURL,
  GraphQLDateTime: GraphQLDateTime,
  GraphQLLimitedString: GraphQLLimitedString,
  GraphQLPassword: GraphQLPassword,
};

export default resolveFunctions;
