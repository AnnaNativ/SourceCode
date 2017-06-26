var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var exerciseSchema = new mongoose.Schema({
  body: [{type:String,content:String}],
  answers: [{solution: String,isCorrect:Boolean}],
  //subSubject: {type: Schema.Types.ObjectId, ref: 'SubSubject'}
});

mongoose.model('Exercise', exerciseSchema);
