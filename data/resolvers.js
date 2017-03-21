import { GraphQLScalarType } from 'graphql';
import { User, Person, Media } from './connectors';
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
    user(_, { userName }) {
      let where = { userName};
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
            $like: ('%'+title+'%')
          }
        }
      })
    },
  },
  Mutation: {
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
