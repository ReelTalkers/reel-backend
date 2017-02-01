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
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      updateCount: {
        type: GraphQLInt,
        description: 'Updates the count',
        resolve: function() {
          count +=1;
          return count;
        }
      }
    }
  })
})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.listen(PORT, function () {
  console.log('Example app listening on port 3000!')
})
