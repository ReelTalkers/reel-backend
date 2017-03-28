import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import schema from './data/schema.js';
import rp from 'request-promise';
import passport from 'passport';
import session from 'express-session';

import { User } from './data/connectors';
import {FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} from './keys.js';

let FacebookStrategy = require('passport-facebook').Strategy;

const PORT = 3000;

var app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql', }));

app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

// This get endpoint is used for testing purposes
app.get('/',
  function(req, response){
    response.send('Hello World!')
  }
)

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    const id = profile.id;
    const userData = {
      fullName: profile.displayName,
      dateJoined: new Date(),
      email: profile.emails[0].value,
      smallPhoto: profile.photos[0].value,
      completedWalkthrough: false,
    };
    // where: A hash of search attributes.
    // defaults: Default values to use if building a new instance
    return User.findOrCreate({where: {fbID: id}, defaults: userData})
                .spread( (instance, created) => done(null, instance));
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  const err = "User Find Error";
  let where = {
    id: id,
  }
  return User.find({ where }).then(user => done(err, user))
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: 'http://localhost:8080/',
                                      failureRedirect: 'http://localhost:8080/login' }));

app.listen(PORT, () => console.log('Now browse to localhost:3000/graphiql'));
