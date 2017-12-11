const assert = require('assert');
const User = require('../models/user');

// Describe tests
describe('Testing mongo updating records', () => {
  // DB gets dropped with each test so we need to create the test user
  var user;

  beforeEach((done)=>{
    User.create({displayName:'test-user-updating', age:1}, (err,instance)=>{
      if (err) {
        console.err('BARF');
        done();
      }else{
        user = instance;
        done();
      }
    });
  });

  it('Test NEWTEST findOneandUpdate - finding name and updating it to wibblesplat', (done)=>{
    User.findOneAndUpdate({displayName:'test-user-updating'}, {displayName:'wibblesplat'}, {new:true}, (err, doc)=>{
      assert(doc.displayName === 'wibblesplat');
      done();
    });
  });
});
