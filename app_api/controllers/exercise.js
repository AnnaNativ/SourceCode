var mongoose = require('mongoose');
var Exercise = mongoose.model('Exercise');
var randGen = require('mongoose-query-random');
var shuffle = require('shuffle-array');

module.exports.getExercise = function (req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    Exercise
      .find()
        .random(1, true, function (err, exercise) {
        console.log(exercise[0].badSolutions);
        shuffle(exercise[0].badSolutions);
        console.log(exercise[0].badSolutions);
        res.status(200).json(exercise[0]);
      });
  }

};

module.exports.getExercisesForSubjectAndSubSubject = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    var subject = new mongoose.mongo.ObjectId(req.query.subject);
    var subSubject = new mongoose.mongo.ObjectId(req.query.subSubject);
    Exercise
      .find({'subject' : subject, 'subSubject': subSubject})
      .exec(function(err, exercises) {
        res.status(200).json(exercises);
      });
  }  

}
//TODO this is just a git test
module.exports.getExercisesFoSubSubjectandLevel = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    var subject = new mongoose.mongo.ObjectId(req.query.subject);
    var subSubject = new mongoose.mongo.ObjectId(req.query.subSubject);
    Exercise
      .find({'subject' : subject, 'subSubject': subSubject})
      .exec(function(err, exercises) {
        res.status(200).json(exercises);
      });
  }  

}

module.exports.newExercise = function (req, res) {

  // if(!req.body.name || !req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }
  console.log("in exercise.js newExercise with: " + req.body);

  var exercise = new Exercise();
  exercise.exercise = req.body.exercise;
  exercise.subject = req.body.subject;
  exercise.subSubject = req.body.subSubject;
  exercise.goodSolutions = req.body.solutions.slice(0, 1);
  exercise.badSolutions = req.body.solutions.slice(1);

  exercise.save(function (err) {
    res.status(200);
    res.json({
      "exercise": "saved"
    });
  });
};

