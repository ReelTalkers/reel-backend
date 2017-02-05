import { GraphQLScalarType } from 'graphql';
import { User, Person } from './connectors';
import {
  GraphQLEmail,
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword
} from 'graphql-custom-types';

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
    }
  },
  Mutation: {
    createUser(_, args) {
      return User.create(args);
    }
  },
  GraphQLEmail: GraphQLEmail,
  GraphQLURL: GraphQLURL,
  GraphQLDateTime: GraphQLDateTime,
  GraphQLLimitedString: GraphQLLimitedString,
  GraphQLPassword: GraphQLPassword,
};

export default resolveFunctions;
