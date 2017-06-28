var mongoose = require('mongoose');

var subjectSchema = new mongoose.Schema({
  name: String,
  schoolGrade: String,
  level: String,
  subSubjects:[
      {type: Schema.Types.ObjectId, ref: 'SubSubject'}
  ]
});

module.exports = mongoose.model('Subject', subjectSchema);
