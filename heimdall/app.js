const express = require('express');
const cookieSession = require('cookie-session');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
const uuid = require('uuid');
const crypto = require('crypto');
const Docker = require('dockerode');

const authRoutes = require('./routes/auth-routes');
const passportSetup = require('./config/passport-setup');
const dbSetup = require('./util/db-setup');
const keys = require('./config/keys');
const User = require('./models/user');

const app = express();
var docker = new Docker();
// set up view engine
app.set('view engine', 'ejs');

// middleware to serve static stuff like images
app.use('/assets', express.static('assets'));
app.use(cookieSession({
  maxAge:1*60*60*1000, //1 hour
  keys:[keys.session.sessionSecret]
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(expressValidator());

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// redirect non-logged-in users to a marchitecture page requesting they log in
// redirect logged-in but *NOT COMPLETE* users to the completeSignup page
app.use((req, res, next)=>{
  if(req.user){
    console.log('Request for', req.originalUrl, 'User is logged in');
    if(req.user.complete){
      console.log("====> User is complete and should have normal access");
      next();
    }else{ //User is authenticated but profile is incomplete
      if(req.originalUrl.startsWith('/completesignup')) { // The form post comes through as '/completesignup?'
        console.log("Request for:", req.originalUrl, "allowed to continue");
        next();
      }else{
        console.log("User Auth, User incomplete: Requested url:", req.originalUrl);
        console.log("====> redirecting user to /completesignup");
        res.redirect('/completesignup');
      }
    }
  }else{
    console.log("Request for", req.originalUrl, "User is not logged in. They can view our /nosession page or the /auth routes")
    if(req.originalUrl === '/nosession'){
      next();
    } else if (req.originalUrl.startsWith('/auth')){
      next();
    } else {
      console.log("====>redirecting user to /nosession");
      res.redirect('/nosession');
    }
  }
});

// set up auth routes
app.use('/auth', authRoutes);

// route for non-logged-in users (always redirected here from the redirect middleware)
app.get('/nosession', (req, res) => {
  res.render('nosession');
});

// route for logged-in (OAUTH) to post data (from above get request)
app.post('/completesignup', (req, res, next) => {
  // check is email
  req.checkBody('email', 'email address required').isEmail();

  // Trim and escape
  req.sanitize('email').escape();
  req.sanitize('email').trim();

  var errors = req.validationErrors();
  if (errors){
    console.log("Errors in signup data", errors);
    console.log("====> redirecting back to /completesignup");
    res.render('completesignup', {user:req.user, errors:errors});
  }
  //Although we're using the id from the request, it's been decrypted using our local magic, so there's no way for the user to edit that and change things for others in the DB
  User.findById(req.user._id)
  .then((dbUser)=>{
    console.log("retreived user from DB");
    dbUser.email = req.body.email;
    dbUser.complete = true; //TODO: Make some email validation/waitstate happen
    dbUser.profileImageURI = "https://gravatar.com/avatar/" + crypto.createHash('md5').update(req.body.email).digest("hex");
    dbUser.save()
    .then(()=>{
      res.redirect('/'); //User fully authenticated and complete
    })
    .catch((error)=>{
      console.log("Error saving user completeness data");
      res.render('error');
    });
  })
  .catch(()=>{
    console.log("ERROR FETCHING user from DB");
    res.render('error');
  });
});

// route for logged-in (OAUTH) but incomplete (we need other info) users
app.get('/completesignup', (req, res) => {
  res.render('completesignup', {user:req.user, errors:null});
});

app.post('/launch', (req, res)=>{
  console.log("Request to launch a jumpbox to connect to:", req.body.target);
  //Launch a container
  //Retreive the container's public key
  //Sign / create a certificate
  //Push certificate back into container
  //Launch SSHD
  //Update jumpboxes db
  res.send("..... launching");
});

app.post('/config', (req,res,next)=>{
  //stuff
  req.checkBody('pubkey', 'pubkey required').notEmpty();
  req.sanitize('pubkey').trim();
  //TODO: Validate pubkey is really a pubkey _NOT_ a private key
  var errors = req.validationErrors();
  if (errors){
    console.log("Errors in pubkey data", errors);
    console.log("Req body:", req.body);
    console.log("====> redirecting back to /config");
    res.redirect('/config');
  }

  User.findById(req.user._id)
  .then((dbUser)=>{
    dbUser.pubkey = req.body.pubkey;
    dbUser.save()
    .then(()=>{
      res.redirect('/config');
    })
    .catch((error)=>{
      console.log("Error saving pubkey", error);
      res.render('error');
    });
  })
  .catch((error)=>{
    console.log("Some error in /config DB stuff");
  });

  res.redirect('/config');
});

app.get('/config', (req,res)=> {
  res.render('config', {user:req.user});
});



// home route
app.get('/',(req, res) => {
  res.render('index', {user:req.user});
});

app.get('/jumpboxes', (req, res) => {
  //For routing to get here, user must be logged in.
  var opts={
    filters: {
      "label": [
        `heimdall.type=jumpbox`,`heimdall.user=${req.user}`
      ]
    }
  };
  docker.listContainers(opts, (err,containers)=>{
    if (err) {
      res.send("Docker broke"); //TODO: Proper error handling
    }
    console.log("Found", containers.length, "containers")
    res.render('jumpboxes', {user:req.user, containers:containers});
  });
});

// Create a docker container jumphost for the provided target
app.post('/launch', (req, res, next) => {

});

app.listen(3000, () => {
  console.log("app now listening on port 3000");
  var nom = uuid.v4();
  console.log("starting self test");
  User.create({
    displayName:nom,
    provider:"selftest",
    email:"noemail",
    complete: true,
    jumpBoxes:[{containerID:"aaaaaaaa"}, {containerID:"bbbbbbbb"}]
  }, (err,instance)=>{
    if (err){
      console.log("! Error creating user "+ nom);
      console.error(err);
    }else{
      console.log("* Created user " + nom);
    }
    User.findOne({_id:instance._id}, (err,result)=>{
      if (!err) console.log("* Retreived user " + nom);
      User.findOneAndRemove({displayName:nom}, (err)=>{
        if (!err) {
          console.log("* Deleted user " + nom);
          console.log("Self Test Complete");
        }
      });
    });
  });
});
