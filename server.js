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
var databasekey = fs.readFileSync('database.key','utf8')
// Cut out the new line at the end of the file read for the db key
databasekey = databasekey.slice(0,-1)

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

const sessions = new Sequelize(
  'reelsessions',
  'reelservice',
  databasekey,
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
  }
);
// In prod we will want sessions to persist
sessions.sync({ force: true });

var sessionOpts = {
  saveUninitialized: true, // saved new sessions
  resave: true, // do not automatically write to the session store
  secret: SESSION_SECRET,
  store: new SequelizeStore({
    db: sessions
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
    context: { user_id: id },
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
