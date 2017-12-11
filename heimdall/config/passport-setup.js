const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const keys = require('./keys');
const dbSetup = require('../util/db-setup');
const User = require('../models/user')

passport.serializeUser((user,done)=>{
  done(null,user._id); // This is what we want to jam into a cookie
});

passport.deserializeUser((id,done)=>{
  User.findById(id).then((user)=>{
    done(null,user);
  });
});

passport.use(
  new GoogleStrategy({
    clientID:keys.google.client_id,
    clientSecret:keys.google.client_secret,
    callbackURL:"/auth/google/redirect"
  }, (accessToken, refreshToken, profile, done ) => {
    // passport callback function
    // access token - we use this to access google and do things as the user (if permissions are granted)
    // refresh token - used to refresh the access token
    // profile information - data about the user
    // done - async end trigger thingy.

    // Check if user already exists
    User.findOne({providerID:profile.id}).then((currentUser)=>{
      //need to do some record completion stuff? 2nd stage signup // challenge for email?
      if(currentUser){
        console.log("user is, ", currentUser);
        done(null, currentUser); //TODO: Think about error handling
      } else {
        User.create({
          displayName:profile.displayName,
          provider: "Google",
          providerID: profile.id,
          profileImageURI: "/assets/profile.png",
          email: "not-set",
          complete: false,
        }).then((newUser)=>{
          console.log('new user created: ' + newUser);
          done(null, newUser); //Done moves us on to the passport serializeUser which we've defined above
        });
      } // end IF/ELSE
    });
  }));
