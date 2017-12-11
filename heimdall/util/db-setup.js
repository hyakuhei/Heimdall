const mongoose = require('mongoose');
const dbconfig = require('../config/db-creds');

mongoose.Promise = global.Promise; // use the default ES6 promise

/**
mongoose.connection.once('open', () => {
  console.log('Opened db connection');
}).on('error', (error) => {
  console.log('Connection error:'+error);
});
**/

mongoose.connection.onOpen(()=>{
  console.log('onOpen fired');
});

mongoose.connection.onClose(()=>{
  console.log('onClose fired');
});

mongoose.connect(dbconfig.uri, {useMongoClient:true}).then(
  () => { /** Readdy to use, promise resolves to undefined **/ },
  err => {"Error connecting to: " + dbconfig.uri + " :: " + err}
);
