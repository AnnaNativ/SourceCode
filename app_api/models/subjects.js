var mongoose = require('mongoose');



var videoSchema = new mongoose.Schema({
  name: String,
  link: String
});

var subSubjectSchema = new mongoose.Schema({
  name: String,
  videos: [videoSchema]
});

var subjectSchema = new mongoose.Schema({
  name: String,
  subSubjects: [subSubjectSchema]
});

mongoose.model('Video', videoSchema);
mongoose.model('SubSubject', subSubjectSchema);
mongoose.model('Subject', subjectSchema);

