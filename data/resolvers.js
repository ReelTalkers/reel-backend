import { GraphQLScalarType } from 'graphql';
import { User, Person, Media } from './connectors';
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
    movies() {
      return Movie.findAll();
    },
    search(_, { query }) {
      return Movie.search(query);
    }
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

var movieOptions = {
    uri: 'http://api-public.guidebox.com/v2/',
    qs: {
        api_key: 'a93c4bd3b872b34ef4a7c912af43e7eac553c0b6' // -> uri + '?api_key=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

const Movie = {
  findAll() {
    movieOptions.uri += "movies"
    return rp(movieOptions)
      .then((res) => {
        return res.results;
      });
  },
  search(query) {
    movieOptions.uri += "search?type=movie&field=title&query=" + query
    return rp(movieOptions)
      .then((res) => {
        return res.results;
      });
  }
}


export default resolveFunctions;
