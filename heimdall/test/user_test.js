const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/user');

// describe
describe('Nesting JumpBoxes within Users', function(){

  beforeEach((done)=>{
    mongoose.connection.collections.users.drop(()=>{
      done();
    });
  });

  if('Creates an empty user', (done)=>{
    var user = new User({
      displayName:"empty",
      provider:"local",
      providerID:"local",
      email:"rob@rob.rob"
    });

    user.save().then(()=>{
      assert(user.isNew===false);
      done();
    });
  });

  it('Create an empty user with two jump boxes', (done)=>{
    var user = new User({
      displayName:"empty",
      provider:"local",
      providerID:"local",
      email:"rob@rob.rob",
      jumpBoxes: [{containerID:'1'},{containerID:'2'}]
    });

    user.save().then(()=>{
      User.findOne({displayName:"empty"}).then((record)=>{
        assert(record.jumpBoxes.length === 2);
        done();
      });
    });
  });
});
