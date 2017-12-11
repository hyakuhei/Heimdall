const router = require('express').Router();
const passport = require('passport');
// These hang on the end of a /auth base route

//auth login
router.get('/login', (req, res) => {
  res.render('login');
});

//auth Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

//auth with google
router.get('/google', passport.authenticate('google', {
  scope:['profile']
}));

// callback route for google to redirect to
// Passport is middleware that will happen before the redirect lands
// Passport will go to google and use the code they gave with the redirect to get info (profile)
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  //res.send('you reached the callback URI');
  res.redirect('/'); //Authenticated
});

module.exports = router;
