var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videoSchema = new mongoose.Schema({
  name: String,
  link: String
});

var subSubjectSchema = new mongoose.Schema({
  name: String
 // videos:[
  //    {type: Schema.Types.ObjectId, ref: 'Video'}
 // ]
},{collection: 'subSubjects' });

mongoose.model('Video', videoSchema);
mongoose.model('subSubjects', subSubjectSchema);
