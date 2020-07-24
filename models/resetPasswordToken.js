const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetPassword = new Schema({
  userId: String,
  token: String
});

module.exports = mongoose.model('reset-password-tokens', ResetPassword);
