import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString
} from 'graphql';

const PORT = 3000;
var app = express();

let count = 0;

var users = {
  'Galen' : {
    name: 'Galen',
    count: 777,
  },
  'Mitchell' : {
    name: 'Mitchell',
    count: 0,
  },
}

var userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    count: { GraphQLInt },
    name: { GraphQLString }
  }
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      args: {
        name: { GraphQLString }
      },
      resolve: function(_, {name}) {
        return users[name];
      }
    }
  }
});

/* You can run this query in the GraphIQL explorer with any combination
    of the following fields:

*  {
*      count
*      author
*  }

*/
let myGraphQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      count: {
        type: GraphQLInt,
        resolve: function() {
          return count;
        }
      },
      author: {
        type: GraphQLString,
        resolve: function() {
          return "Mitchell Baller"
        }
      }
    }
  }),
  /* You can call this mutation in the GraphIQL explorer with:

  *  mutation {
  *      updateCount
  *  }

  */
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      args:  {
        name: { GraphQLString },
      },
      updateCount: {
        type: GraphQLInt,
        description: 'Updates the count',
        resolve: function(_, { name }) {
          users[name].count +=1;
          return users[name].count;
        }
      }
    }
  })
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
