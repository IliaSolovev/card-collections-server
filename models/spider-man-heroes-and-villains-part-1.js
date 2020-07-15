const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpiderManHeroesAndVillainsPart1 = new Schema({
  name: String,
  imageUrl: String,
  type: String,
  kind: String,
  need: Number,
  have: Number,
  number: Number,
});

module.exports = mongoose.model('spider-man-heroes-and-villains-part-1', SpiderManHeroesAndVillainsPart1);
