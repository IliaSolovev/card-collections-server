const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const confirmTokenSchema = new Schema({
  userId: String,
  token: String
});

module.exports = mongoose.model("confirm-tokens", confirmTokenSchema);
