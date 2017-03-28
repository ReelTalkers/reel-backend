import passport from 'passport';
import { User } from './data/connectors';
let FacebookStrategy = require('passport-facebook').Strategy;

import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from './keys.js';

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
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
