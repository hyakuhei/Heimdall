// add this file to .gitignore

// Set your configuration paramaters here
var mongo = {
    serverIP:'127.0.0.1',
    useAuthentication:false,
    username:'no user',
    password:'no password',
    dbName:'fulcrumui'
  }

/**
 * Don't mess with anything below this comment
 */
var mongoURI = '';
if (mongo.useAuthentication){
  mongoURI = 'mongodb://' + mongo.username + ':' + mongo.password + '@' + mongo.serverIP + '/' + mongo.dbName;
}else {
  mongoURI = 'mongodb://' + mongo.serverIP + '/' + mongo.dbName;
}

mongo['uri'] = mongoURI;

module.exports = mongo;
