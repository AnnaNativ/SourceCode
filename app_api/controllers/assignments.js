var mongoose = require('mongoose');
var exercise = require('./exercise');
var audit = require('./audit');
var Cache = require('../cache/Students');
var Authentication = require('./authentication');

var Assignment = mongoose.model('Assignment');
var Progress = mongoose.model('userProgress');
var Audit = mongoose.model('UserAudit');
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
    
    activeStudent = Cache.students.get(assignment.assignee);
    assignment.studentLevel = activeStudent.getLevel();
    
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
      updateCache();   
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

      function updateCache(userProgress) {
        activeStudent = Cache.students.get(assignment.assignee);
        if(activeStudent) {
          newAssignment = new Cache.Assignment(assignment);
          newAssignment.addUserProgress(progress);
          newAssignment.setLevel(activeStudent.getLevel());       
          activeStudent.addAssignment(newAssignment);
        }
      }

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

module.exports.deleteAssignment = function (req, res) {
  console.log('!!!!! deleting assignments for ' + req.query.assignment);
  Audit.remove({userId: req.query.assignee, subsubjectId: req.query.subsubjectId}, function(err) {
    if (err) {
        console.log('Returned from deleteAssignment Audit collection with error ' + err);
    }
    else {
      Progress.remove({assignmentId: req.query._id, subsubjectId: req.query.subsubjectId}, function(err) {
        if (err) {
            console.log('Returned from deleteAssignment UserProgress collection with error ' + err);
        }
        else {
          Assignment.remove({_id: req.query._id}, function(err) {
            if (err) {
                console.log('Returned from deleteAssignment UserProgress collection with error ' + err);
            }
            else {
              Authentication.reloadStudentActivity(req.query.assignee);
              res.status(200).json('assignment removed successfully');              
            }
          });        
        }
      });        
    }
  });
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