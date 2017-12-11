const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JumpTargetSchema = new Schema({
  ip: String
  //something to associate clients who have access
});

const JumpTarget = mongoose.model('jumptarget', JumpTargetSchema);
module.exports = JumpTarget;
