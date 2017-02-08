import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';

const PORT = 3000;

var app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    response.send("Hello World!")
  }
)

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
