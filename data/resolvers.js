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
          body: { quantity: 10 },
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
          reviews = reviews.map((review) => { return { imdb: review.mediaId, rating: review.score } });
          requestOptions.body.ratings = reviews;
          return rp(requestOptions);
        })
        .then(ids => {
          var media = ids.map((id) => { return Media.findById(id) });
          return Q.all(media);
        });
    },
    group_recommendations(_, { userIds }) {
      var requestOptions = {
          uri: 'http://localhost:5000/group_recommendations',
          method: 'POST',
          body: { quantity: 10, group: "Default" },
          json: true // Automatically parses the JSON string in the response
      };

      var users = [];
      for(var id in userIds) {
        var user = {};
        var userPromise = User.findById(userIds[id]).then(u => {
          return Q.all([u.getReviews(), u.id]);
        })
        .then(u => {
          var reviews = u[0].map((review) => { return { imdb: review.mediaId, rating: review.score } });
          user.ratings = reviews;
          user.user = u[1];
          return user;
        })
        users.push(userPromise);
      }

      users = Q.all(users);
      return users.then((users) => {
        requestOptions.body.users = users;
        return rp(requestOptions);
      }).then(ids => {
        var media = ids.map((id) => { return Media.findById(id) });
        return Q.all(media);
      });
    }
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
