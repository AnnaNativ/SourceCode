var mongoose = require('mongoose');
var exercise = require('./exercise');
var audit = require('./audit');

var assignments = mongoose.model('Assignment');
var progress = mongoose.model('userProgress');

module.exports.getMyAssignments = function (req, res) {
  console.log('!!!!! getting assignments for ' + req.query._id);
  var userId = mongoose.Types.ObjectId(req.query._id);
  assignments
    .aggregate(
    { $match: { assignee: userId } },
    { $lookup: { from: 'subsubjects', localField: 'subSubjectId', foreignField: '_id', as: 'subSubject' } }
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
  console.log('!!!!! getting last location for ' + req.query);

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
    console.log('sending to client exe with level:' + JSON.stringify(response));
    res.status(200).json(response);
  };

  PostSeenExe = function (seenExe) {
    console.log(' I am in PostSeenExe callbackFunc with: ' + seenExe.length);
    //removing seenExe from the list of exe
    if (seenExe.length > 0) {
      var seenExeIndex;
      for (index in seenExe) {
        //find it in exe array and remove it
        seenExeIndex = exeforLevel.indexOf(seenExe[index](_id));
        exeforLevel.splice(seenExeIndex, 1);
        console.log('exe :' + seenExe[index](_id) + ' was already worked on by this user');
      }
    };
    if (exeforLevel.length > 0) {
      //pick a random exe from the filtered list
      var randonIndex = Math.floor((Math.random() * exeforLevel.length));
      console.log('getting the next exe for you ' + exeforLevel[randonIndex]._id);
      exercise.getExerciseForId(exeforLevel[randonIndex].Id, PostGetExeForId);
    } else {
      console.log('There are no exercise assigned to you that have not been worked on.');
    }
  };

  progress
    //.find()
    .aggregate(
    { $match: { 'assignmentId': myAssignmentId } },
    { $sort: { 'createdDate': -1 } },
    { $limit: 1 },
    { $lookup: { from: 'subsubjects', localField: 'subSubjectId', foreignField: '_id', as: 'subSubject' } }
    )
    .exec(function (err, progress) {
      if (err) {
        console.log('Returned from getmyLastLocation with error ' + err);
      }
      else {
        console.log('Returned from getmyLastLocation with  ' + progress);
        lastSubSubject = progress[0].subSubjectId;
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
          'subSubjectId': progress[0].subSubjectId,
          'level': levelNeeded
        };

        audit.getSeenExercises(param, PostSeenExe);
      };

    })
};