import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import Sequelize from 'sequelize';
var SequelizeStore = require('connect-session-sequelize')(session.Store);

import { SESSION_SECRET } from './keys.js';

const PORT = 3000;
// TODO: Currently this is set up to accept requests from anywhere
// in prod we will probably want to proxy it to /api or set up cors so that only
// our frontend can access this
require('./auth.js');

var app = express();

var corsOptions = {
  origin: 'http://localhost:8080', // eventually change this to our domain
  credentials: true // <-- REQUIRED backend setting
};
app.use(cors(corsOptions));

var sequelize = new Sequelize(
"database",
null,
null, {
    "dialect": "sqlite",
    "storage": "./session.sqlite"
});
// In prod we will want sessions to persist
sequelize.sync({ force: true });

var sessionOpts = {
  saveUninitialized: true, // saved new sessions
  resave: true, // do not automatically write to the session store
  secret: SESSION_SECRET,
  store: new SequelizeStore({
    db: sequelize
  }),
  cookie : { httpOnly: true, maxAge: 86400000 } // configure when sessions expires
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser(SESSION_SECRET))
app.use(session(sessionOpts))

app.use(passport.initialize())
app.use(passport.session())

app.use('/graphql', bodyParser.json(), graphqlExpress(request => {
  const id = request.user? request.user.id: request.user;
  return ({
    schema: schema ,
    context: { userId: id },
  });
}));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    response.send('Hello World!')
  }
)

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: 'http://localhost:8080/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('http://localhost:8080/');
    });

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
