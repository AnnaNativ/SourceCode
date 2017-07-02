var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var subjectSchema = new mongoose.Schema({
  name: String,
  schoolGrade: String,
  level: String,
  subSubjects:[
      {Id:{type: Schema.Types.ObjectId, ref:'SubSubject'}}
  ]
});

module.exports = mongoose.model('Subject', subjectSchema);
