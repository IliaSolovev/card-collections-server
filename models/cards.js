const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cards = new Schema({
  name: String,
  imageUrl: String,
  rarity: String,
  role: String,
  need: Number,
  have: Number,
  number: Number,
});

module.exports = {
  "spider-man-heroes-and-villains-part-1":  mongoose.model('spider-man-heroes-and-villains-part-1', cards),
  "spider-man-heroes-and-villains-part-2":  mongoose.model('spider-man-heroes-and-villains-part-2', cards),
  "spider-man-heroes-and-villains-part-3":  mongoose.model('spider-man-heroes-and-villains-part-3', cards),
  "teenage-mutant-ninja-turtles-fighting-fours":  mongoose.model('teenage-mutant-ninja-turtles-fighting-fours', cards),
  "teenage-mutant-ninja-turtles-shadow-warriors":  mongoose.model('teenage-mutant-ninja-turtles-shadow-warriors', cards),
};
