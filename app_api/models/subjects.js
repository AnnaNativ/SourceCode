var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subjectSchema = new mongoose.Schema({
  name: String,
  schoolGrade: String,
  level: String,
  subSubjects:[
      {type: Schema.Types.ObjectId, ref:'SubSubject'}
  ]
});

module.exports = mongoose.model('Subject', subjectSchema);

// db.subjects.insert({name: 'אלגברה ליניארית', schoolGrade: 'כיתה ח', level: '5', subSubjects:[ObjectId("5953ecb317d6593059040fbe")]})