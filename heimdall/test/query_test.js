const assert = require('assert');
const User = require('../models/user');

// Describe tests
describe('Testing mongo database functions for retreiving records', () => {
  // our test_connections nukes the DB each time a test is run, so we have to populate it
  var user;
  var username = "test-user-queries";
  beforeEach((done)=>{
    user = new User({ displayName: username, age: 1});
    user.save().then(()=>{
      done();
    });
  });

  it('Finds one by name', (done) => {
    User.findOne({displayName:username}).then((result) => {
        assert(result.displayName === username);
        done();
    });
  });

  it('Finds one by _id', (done) => {
    User.findOne({_id:user._id}).then((result)=>{
      assert(result._id.toString() === user._id.toString());
      done();
    });
  });

  it('Finds all records by name', (done) => {
    User.create({displayName:username}, (err, instance)=>{
      User.find({displayName:user.displayName}).then((results)=>{
        assert(results.length === 2);
        done();
      });
    });
  });
});
