var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var bodyPartSchema = new Schema({
  type: {type: String},
  content: String
});

var solutionSchema = new Schema({
  solution: String,
  isCorrect: Boolean
});

var exerciseSchema = new Schema({
  level: { type: Number, min: 0, max: 9 },
  body: [bodyPartSchema],
  solutions: [solutionSchema],
  tries: {type: Number, default: 0},
  successes: {type: Number, default: 0},
  failures: {type: Number, default: 0},
  gaveups: {type: Number, default: 0},
  publishDate: {type: Date, default: Date.now}
});

mongoose.model('BodyPart', bodyPartSchema);
mongoose.model('Solution', solutionSchema);
mongoose.model('Exercise', exerciseSchema);
