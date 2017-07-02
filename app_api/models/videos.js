var mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
  type: {type: String, enum: ['tutorial', 'sample solution', 'exercise solution']},
  name: String,
  link: String,
  views:{type: Number, default: 0},
  likes:{type: Number, default: 0},
  dislikes:{type: Number, default: 0},
});

mongoose.model('Video', videoSchema);

//db.videos.insert({type: 'sample solution', name: 'משוואות דיפרנציליות', link: 'https://www.youtube.com/embed/znPCD7tUKX0'})
