var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assignedExercises = new mongoose.Schema({
  Id: {type: Schema.Types.ObjectId, ref: 'Exercise'},
  groupId: {type: Schema.Types.ObjectId, ref: 'Exercise'},
  level: {type: Number, min: 0, max: 9 }
},{ _id : false });

var subSubjectSchema = new mongoose.Schema({
  name: String,
  tutorial_video: {type: Schema.Types.ObjectId, ref: 'Video'},
  sample_videos:[
    {type: Schema.Types.ObjectId, ref: 'Video'}
  ],
  exercises: [assignedExercises],
  dependencies: [
    {type: Schema.Types.ObjectId, ref: 'SubSubject'}
  ],
  subjectId: {type: Schema.Types.ObjectId, ref: 'Subject'}
});

mongoose.model('AssignedExercises', assignedExercises);
mongoose.model('SubSubject', subSubjectSchema);

// db.subSubjects.insert({name: 'מטריצות', tutorial_video: ObjectId("5953eaab17d6593059040fba"), sample_videos:[ObjectId("5953eacf17d6593059040fbb"), ObjectId("5953eb9c17d6593059040fbd")] , exercises: ObjectId("59535c0fade9b344d0c78f94"), subjectId: ObjectId("594a8809ce1bb84058c9380c")})
