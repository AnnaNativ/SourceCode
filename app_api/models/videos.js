var mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
  type: String,
  name: String,
  link: String,
  views:{type: Number, default: 0},
  likes:{type: Number, default: 0},
  dislikes:{type: Number, default: 0},
});

module.exports = mongoose.model('Video', videoSchema);