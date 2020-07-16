const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshToken = new Schema({
  userId: String,
  token: String
});

module.exports = mongoose.model('refresh-tokens', RefreshToken);
