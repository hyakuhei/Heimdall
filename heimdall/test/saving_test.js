const assert = require('assert');
const User = require('../models/user');

// Describe tests
describe('Testing mongo database functions', () => {
  var user = new User({
    displayName:'test-user-alpha',
    age:33
  });

  it('Test creating/saving a new user', (done) => {
    user.save().then(()=>{
      assert(user.isNew === false); //true = created and not saved. false = created and saved
      done();
    });
  });

  it('Test inline creation and saving of user', (done) => {
    User.create({displayName:'test-user-beta', age:99}, (err, instance)=>{
      if(err) assert(false);
      done();
    });
  });
});
