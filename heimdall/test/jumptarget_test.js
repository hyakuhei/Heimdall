const assert = require('assert');
const JT = require('../models/jumptarget');

// Describe tests
describe('Testing mongo updating records', () => {
  var test_IP = "127.0.0.1";

  it('Test creating a jump target and saving to the DB', (done)=>{
      var jt = new JT({ip:test_IP});
      jt.save().then(()=>{
        assert(jt.isNew === false);
        done();
      });
  });

  it('Test deleting a jump target using promises', (done)=>{
    JT.create({ip:test_IP}).then(()=>{ // If saving isn't working, there's a test somewhere else for that
      JT.findOneAndRemove({ip:test_IP}).then(()=>{
        JT.findOne({ip:test_IP}).then((result)=>{
          assert(result === null);
        });
        done();
      });
    });
  });
});
