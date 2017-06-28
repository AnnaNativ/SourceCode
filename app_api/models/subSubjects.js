var mongoose = require('mongoose');

var subSubjectSchema = new mongoose.Schema({
  name: String,
  videos: [videoSchema]
});

module.exports = mongoose.model('SubSubject', subSubjectSchema);
