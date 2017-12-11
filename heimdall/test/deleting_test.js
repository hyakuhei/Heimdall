const assert = require('assert');
const User = require('../models/user');

// Describe tests
describe('Testing mongo removing records', () => {
  var user;

  beforeEach((done)=>{
    User.create({displayName:'test-user-deleting'}, (err,instance)=>{
      user=instance;
      done();
    });
  });

  it('Deletes one record', (done)=>{
    User.findOneAndRemove({displayNname:'test-user-deleting'}).then(()=>{
      User.findOne({displayName:'test-user-deleting'}).then((result)=>{
        assert(result == null); //Can't find the record. Record was deleted
      });
      done();
    });
  });
});
