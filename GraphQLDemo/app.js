import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLScalarType
} from 'graphql';
var types = require('./types.js');

const PORT = 3000;
var app = express();

let count = 0;

var users = {
  'Galen' : {
    name: 'Galen',
    count: 777,
    birthDate: {
      day: 17,
      month: 10,
      year: 1994
    },
  },
  'Mitchell' : {
    name: 'Mitchell',
    count: 0,
    birthDate: {
      day: "Hi",
      month: 7,
      year: 1995
    },
  },
}

var userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    count: { type: GraphQLInt },
    name: { type: GraphQLString },
    birthDate: { type: types.date },
  }
});

/* You can run this query in the GraphIQL explorer with any combination
    of the following fields:

*  {
*      user(name:"Galen") {
*        count,
*        name
*      }
*  }

*/

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      args: {
        name: { type: GraphQLString },
      },
      resolve: function(_, { name }) {
        return users[name];
      }
    }
  }
});

/* You can call this mutation in the GraphIQL explorer with:

*  mutation {
*      updateCount(name:"Mitchell")
*  }

*/

var mutationType = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    updateCount: {
      type: GraphQLInt,
      description: 'Updates the count',
      args:  {
        name: { type: GraphQLString },
      },
      resolve: function(_, { name }) {
        users[name].count +=1;
        return users[name].count;
      }
    },
    updateBirthDate: {
      type: types.date,
      description: 'Updates a users birthdate',
      args: {
        name: { type: GraphQLString },
        newDay: { type: GraphQLInt},
        newMonth: { type: GraphQLInt },
        newYear: { type: GraphQLInt },
      },
      resolve: function(_, { name, newDay, newMonth, newYear }) {
        users[name].birthDate = { day: newDay, month: newMonth, year: newYear }
        return users[name].birthDate
      },
    }
  }
})

let myGraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
})

// A response to a simple root level get request
app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Adds an endpoint for our graphql server
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));

// Sets up a graphiql endpoint to explore and test our graphql server. Calls
//  original graphql endpoint for data.
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// Sets the server to listen at the given port
app.listen(PORT, function () {
  console.log('Example app listening on port 3000!')
})
