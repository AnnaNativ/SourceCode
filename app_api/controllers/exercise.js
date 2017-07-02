var mongoose = require('mongoose');
var Exercise = mongoose.model('Exercise');
var SubSubject = mongoose.model('SubSubject');
var AssignedExercises = mongoose.model('AssignedExercises');
var BodyPart = mongoose.model('BodyPart');
var Solution = mongoose.model('Solution');
var randGen = require('mongoose-query-random');

module.exports.getExercise = function (req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    Exercise
      .find()
      .random(1, true, function (err, exercise) {
        res.status(200).json(exercise[0]);
      });
  }

};

module.exports.getExercises = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    var subSubject = new mongoose.mongo.ObjectId(req.query.subSubject);
    SubSubject
      .find({'_id' : subSubject})
      .exec(function(err, exercises) {
        res.status(200).json(exercises);
      });
  }  

}

module.exports.getExerciseForId = function(exeId,PostGetExeForId){
  Exercise
  .find({'_id':exeId})
  .exec(function(err, nextExercises) {
    console.log('I got the next exercise for you ' + nextExercises.body);
    PostGetExeForId(nextExercises);
  })
};
module.exports.newExercise = function (req, res) {
  console.log("in exercise.js newExercise with: " + req.body);

  var exercise = new Exercise();
  exercise._id = new mongoose.mongo.ObjectId();
  exercise.level = req.body.level;
  // create the exercise body from its parts
  req.body.body.forEach(function(bodyPart) {
    var part = new BodyPart();
    part.type = bodyPart.type;
    part.content = bodyPart.content;
    exercise.body.push(part);
  });
  // create all the solutions from all solution parts
  req.body.solutions.forEach(function(solution) {
    var sol = new Solution();
    sol.solution = solution.solution;
    sol.isCorrect = solution.isCorrect;
    exercise.solutions.push(sol);
  });
  // save the exercise
  exercise.save(function (err){
      if(err) {
        console.log(err);
      }
      else {
        var newExercise = new AssignedExercises();
        newExercise.Id = exercise._id;
        newExercise.level = exercise.level;
        // update the subSubject with the new exercise
        SubSubject
        .update({"_id": req.body.subSubject},{$push:{exercises: newExercise}})
        .exec(function(err, subSubject) {
          console.log('subSubject is updated!!!!')
          res.status(200).json(subSubject);
        });
      }
  });
};

