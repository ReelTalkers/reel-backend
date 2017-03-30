import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';
import passport from 'passport';
import session from 'express-session';
var SQLiteStore = require('connect-sqlite3')(session);
import cors from 'cors';

import { SESSION_SECRET } from './keys.js';

const PORT = 3000;
// TODO: Currently this is set up to accept requests from anywhere
// in prod we will probably want to proxy it to /api or set up cors so that only
// our frontend can access this
require('./auth.js');

var app = express();

var corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true // <-- REQUIRED backend setting
};
app.use(cors(corsOptions));

var sessionOpts = {
  saveUninitialized: true, // saved new sessions
  resave: true, // do not automatically write to the session store
  secret: SESSION_SECRET,
  store: new SQLiteStore,
  cookie : { httpOnly: true, maxAge: 2419200000 } // configure when sessions expires
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser(SESSION_SECRET))
app.use(session(sessionOpts))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  console.log("All requests");
  console.log(req.user.id);
  next();
});

app.use('/graphql', bodyParser.json(), graphqlExpress(request => {
  console.log('/graphql');
  return ({
    schema: schema ,
    context: { user: request.user.id },
  });
}));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    console.log('/');
    response.send('<a href="/auth/facebook">Hello World!</a>')
  }
)

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: 'http://localhost:8080/login' }),
    function(req, res) {
      console.log('/auth/facebook/callback');
      // Successful authentication, redirect home.
      res.redirect('http://localhost:8080/');
    });

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
