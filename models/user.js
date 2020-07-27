const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    login: String,
    password: String,
    email: String,
    confirmed: Boolean,
    avatarUrl: String
});

module.exports = mongoose.model('users', userSchema);
