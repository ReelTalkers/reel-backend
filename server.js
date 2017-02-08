import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';

const PORT = 3000;

var app = express();

var movieOptions = {
    uri: 'http://api-public.guidebox.com/v2/movies',
    qs: {
        api_key: 'a93c4bd3b872b34ef4a7c912af43e7eac553c0b6' // -> uri + '?api_key=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    rp(movieOptions)
      .then((res) => {
        response.send(res.results)
      })
      .catch((res => {
        response.send("Error")
      }))
  }
)

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
