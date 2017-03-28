import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';

import { SESSION_SECRET } from './keys.js';
require('./auth.js');

const PORT = 3000;
// TODO: Currently this is set up to accept requests from anywhere
// in prod we will probably want to proxy it to /api or set up cors so that only
// our frontend can access this
var app = express().use('*', cors());

app.use('/graphql', bodyParser.json(), graphqlExpress(req => ({
  schema: schema ,
  context: { user: req.user },
})));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

app.use(session({ secret: SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    response.send('Hello World!')
  }
)

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: 'http://localhost:8080/',
                                      failureRedirect: 'http://localhost:8080/login' }));

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
