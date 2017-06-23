var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var exerciseSchema = new mongoose.Schema({
  exercise: String,
  goodSolutions: [{solution: String}],
  badSolutions: [{solution: String}],
  subject: {type: Schema.Types.ObjectId, ref: 'Subject'},
  subSubject: {type: Schema.Types.ObjectId, ref: 'SubSubject'}
});

mongoose.model('Exercise', exerciseSchema);
