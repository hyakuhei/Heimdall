const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JumpBoxSchema = new Schema({
  id: String,
  containerID: String,
  ip: String,
  port: Number,
  targetIP: String,
  startTime: Date,
  ttyData: String
});

// Create schema and model for user
const UserSchema = new Schema ({
  displayName: String,
  provider: String,
  providerID: String,
  email: String,
  profileImageURI: String,
  pubkey: String,
  complete: {
    type: Boolean,
    required: [true],
    default: false
  },
  jumpBoxes: [JumpBoxSchema]
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
