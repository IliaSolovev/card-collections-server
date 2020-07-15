const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionsSchema = new Schema({
  nameString: String,
  imageUrl: String,
  cardsCount: Number,
  release: Number,
});

module.exports = mongoose.model('collections', collectionsSchema);
