import passport from 'passport';
import { User } from './data/connectors';
let FacebookStrategy = require('passport-facebook').Strategy;

import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from './keys.js';

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://reeltalk.student.cwru.edu:3000/auth/facebook/callback",
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
      lastGroup: []
    };
    console.log("Trying to create user");
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
  // At some point we may want to support returning error from user.find
  // User.find({where: { id }}).then(user => done(null, user));
  // for now lets just return the id since we dont need anything else for graphql context
  const user = {
    id: id,
  }
  done(null, user);
});
