const mongoose = require('mongoose');
const config = require('../config/db-creds');

console.log("TESTS MONGO CONNECTION BEING USED. IT WILL MASH DATA");

var mongoDB = config.uri + '-test';
console.log("Using test DB " + mongoDB);

mongoose.Promise = global.Promise; // use the default ES6 promise

before((done)=>{
  mongoose.connect(mongoDB, {useMongoClient:true});
  mongoose.connection.once('open', () => {
    console.log('Opened db connection');
    done();
  }).on('error', (error) => {
    console.log('Connection error:'+error);
  });
});

// Drop the users collection before each test
beforeEach((done)=>{
  // Drop the collection
  mongoose.connection.collections.users.drop(()=>{
    done();
  });

});
