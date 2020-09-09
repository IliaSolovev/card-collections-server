const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionsSchema = new Schema({
  name: String,
  imageUrl: String,
  cardCollectionName: String,
  cardsCount: Number,
  release: Number,
});

module.exports = mongoose.model('collections', collectionsSchema);
