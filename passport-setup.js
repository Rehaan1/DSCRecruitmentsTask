const passport = require("passport");

const googleStrategy = require('passport-google-oauth2').Strategy;  //strategy to use in passport for google

passport.serializeUser(function(user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback

    */
    done(null, user);
  });

passport.deserializeUser(function(user, done) {
    /*
    Instead of user this function usually recives the id
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    done(null, user);
});



passport.use(new googleStrategy({
   clientID:process.env.GOOGLE_CLIENT_ID, //configuring passport to use strategy
   clientSecret:process.env.GOOGLE_CLIENT_SECRET,
   callbackURL:process.env.GOOGLE_CALLBACK_URL,
   passReqToCallback:true
 }, function(request, accessToken, refreshToken,profile,done) //callback function once authenticated
{
    console.log(profile);
    return done(null,profile);
} ));
