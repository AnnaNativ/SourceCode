var mongoose = require('mongoose');
var exercise = require('./exercise');
var audit = require('./audit');

var Assignment = mongoose.model('Assignment');
var Progress = mongoose.model('userProgress');
var assignments = mongoose.model('Assignment');
var progress = mongoose.model('userProgress');

module.exports.newAssignment = function (req, res) {
  var itemsProcessed = 0;
  var assignments = [];
  req.body.assignee.forEach(function(student) {    
    assignment = new Assignment();
    assignment._id = new mongoose.mongo.ObjectId();
    assignment.assigner = mongoose.Types.ObjectId(req.body.assigner);
    assignment.assignee = mongoose.Types.ObjectId(student.id);
    assignment.subjectId = mongoose.Types.ObjectId(req.body.subjectId);
    assignment.subsubjectId = mongoose.Types.ObjectId(req.body.subsubjectId);
    assignments.push(assignment);
    // save the assignment
    assignment.save(function (err) {
      itemsProcessed++;
      if (err) {
        console.log(err);
      }
      else {
        if(itemsProcessed == (req.body.assignee.length)) {
          createUserProgressRecord();
        }
      }
    });
  });

  // create a user progress entry in the userProgress collection
  createUserProgressRecord = function() {
    var itemsProcessed = 0;
    assignments.forEach(function(assignment) {    
      progress = new Progress();
      progress.userId = assignment.assignee;
      progress.subsubjectId = assignment.subsubjectId;
      progress.assignmentId = assignment._id;
      // save the user progress record
      progress.save(function (err) {
        itemsProcessed++;
        if (err) {
          console.log(err);
        }
        else {
          if(itemsProcessed == (assignments.length)) {
            res.status(200).json('success');
          }
        }
       });
    });
  }
}

module.exports.getAssignmentsOfTeacher = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var teacher = mongoose.Types.ObjectId(req.payload._id);
    console.log('teacher ID is ' + teacher);
    assignments
      .aggregate(
      { $match: { assigner: teacher } },
      { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
      { $lookup: { from: 'subsubjects', localField: 'subsubjectId', foreignField: '_id', as: 'subSubject' } },
      { $lookup: { from: 'users', localField: 'assignee', foreignField: '_id', as: 'student' } },
      { $project: {status:1, "subSubject._id" : 1, "subject.name" : 1, "subSubject.name" : 1, "student.name": 1}},
      { $group : { _id : {subSubject: "$subSubject.name", subject: "$subject.name"}, assignments: { $push: {status: "$status", student: "$student.name"} } } }
      )
      .exec(function (err, data) {
        if (err) {
          console.log('Returned from aggregate with error ' + err);
        }
        else {
          res.status(200).json(data);
          console.log('came back with ' + data.length + ' assignments for teacher');
        }
      });
  }
}

module.exports.getMyAssignments = function (req, res) {
  console.log('!!!!! getting assignments for ' + req.query._id);
  var userId = mongoose.Types.ObjectId(req.query._id);
  assignments
    .aggregate(
    { $match: { assignee: userId } },
    { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
    { $lookup: { from: 'subsubjects', localField: 'subsubjectId', foreignField: '_id', as: 'subSubject' } },
    { $lookup: { from: 'users', localField: 'assigner', foreignField: '_id', as: 'assigner' } }
    )
    .exec(function (err, data) {
      if (err) {
        console.log('Returned from aggregate with error ' + err);
      }
      else {
        res.status(200).json(data);
        console.log('came back with ' + data.length + ' assignments');
      }
    })
};

module.exports.getMyLastLocation = function (req, res) {
  console.log('!!!!! getting last location for ' + req.query._id);

  var myAssignmentId = mongoose.Types.ObjectId(req.query._id);
  var lastSubSubject;
  var lastLevel;
  var exeforLevel = new Array;

  PostGetExeForId = function (nextExe) {
    console.log('I have the exe I need.');
    //adding subsubject and level for the audit
    var response = {};
    response.level = lastLevel;
    response.subsubject = lastSubSubject;
    response.exe = nextExe[0];
    //console.log('sending to client exe with level:' + JSON.stringify(response));
    res.status(200).json(response);
  };

  PostSeenExe = function (seenExe) {
    console.log(' I am in PostSeenExe callbackFunc with: ' + seenExe.length);
    //removing seenExe from the list of exe
    exeforLevel = exercise.CleanUpExercisesFromSeen(exeforLevel,seenExe);
    
    exercise.getRandom(exeforLevel);
  };

  progress
    //.find()
    .aggregate(
    { $match: { 'assignmentId': myAssignmentId } },
    { $sort: { 'createdDate': -1 } },
    { $limit: 1 },
    { $lookup: { from: 'subsubjects', localField: 'subsubjectId', foreignField: '_id', as: 'subSubject' } }
    )
    .exec(function (err, progress) {
      if (err) {
        console.log('Returned from getmyLastLocation with error ' + err);
      }
      else {
        console.log('Returned from getmyLastLocation with  ' + progress);
        lastSubSubject = progress[0].subsubjectId;
        lastLevel = progress[0].level;
        var exeInSubSubject = progress[0].subSubject[0].exercises;
        var levelNeeded = progress[0].level;
      
        //filter out exe from a different level
        console.log('looking for exe for level:' + levelNeeded);

        for (exe in exeInSubSubject) {
          if (exeInSubSubject[exe].level == levelNeeded) {
            console.log('adding potential exe with id: ' + exeInSubSubject[exe].Id);
            exeforLevel.push(exeInSubSubject[exe]);
          }
          else {
            console.log('exe is for a different level: ' + exeInSubSubject[exe].level);
          }

        }

        if(exeforLevel.length == 0){
          console.log('There  are no exercise in this subsubject for the required level');
           res.status(200).json(exeforLevel);
          
        }
        //filter our all exe that user has already worked on(both success and failure)
        var param = {
          'userId': progress[0].userId,
          'subsubjectId': progress[0].subsubjectId,
          'level': levelNeeded
        };
        audit.getSeenExercises(param, PostSeenExe);
      };

    })
};