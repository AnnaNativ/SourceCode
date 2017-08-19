var passport = require('passport');
var mongoose = require('mongoose');
var HashMap = require('hashmap');
var Cache = require('../cache/Students');
var User = mongoose.model('User');
var School = mongoose.model('School');
var DBAssignments = mongoose.model('Assignment');
var DBUserProgress = mongoose.model('userProgress');
var DBUserAudit = mongoose.model('UserAudit');

var student = undefined;
var assignments = undefined;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  sendRespose = function(user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
  }
  console.log("In authentication register with: " + user);
  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.role = req.body.role;

  if(user.role === "teacher") {
    user.school = new mongoose.mongo.ObjectId(req.body.school);
  }
  if(user.role === "student") {
    user.teacher = new mongoose.mongo.ObjectId(req.body.teacher);
  }

  user.setPassword(req.body.password);

  user.save(function(err) {
    if(user.role === "student") {
      loadStudentActivity(user, sendRespose);
    }
    else {
      sendRespose(user);
    }
  });

};

module.exports.login = function(req, res) {
  sendRespose = function(user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
  }

  passport.authenticate('local', function(err, user, info){
    var token;
    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user) {
      if(user.role == 'student') {
        loadStudentActivity(user, sendRespose);
      }
      else {
        sendRespose(user);
      }
    } 
    else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};

module.exports.logout = function(req, res) {

};


loadStudentActivity = function(user, sendRespose) {
  student = new Cache.Student(user._id);
  loadAssignments(user, sendRespose);
}

loadAssignments = function(user, sendRespose) {
    DBAssignments
    .aggregate({ $match: { assignee: user._id }})
    .exec(function (err, data) {
        if (err) {
            console.log('Returned from aggregate with error ' + err);
        }
        else {
            for(var i=0; i<data.length; i++) {
              student.addAssignment(new Cache.Assignment(data[i]));
            }
            loadUserProgress(user, sendRespose);
        }
    })        
}

loadUserProgress = function(user, sendRespose) {
    DBUserProgress
    .aggregate({ $match: { userId: user._id }},
               { $sort: { 'createdDate': 1 }})
    .exec(function (err, data) {
        if (err) {
            console.log('Returned from aggregate with error ' + err);
        }
        else {
            for(var i=0; i<data.length; i++) {
              assignment = student.getAssignment(data[i].assignmentId);
              if(assignment != undefined) {
                assignment.addUserProgress(data[i]);
                console.log(assignment);
              }
              else {
                console.log('In authentication.loadUserProgress - Assignment not found for : ' + data[i].assignmentId.toString());                
              }
            }
            loadDoneExercises(user, sendRespose);
        }
    })        
}  

loadDoneExercises = function(user, sendRespose) {
    DBUserAudit
    .aggregate({ $match: { userId: user._id }})
    .exec(function (err, data) {
        if (err) {
            console.log('Returned from aggregate with error ' + err);
        }
        else {
            var exercise;
            for(var i=0; i<data.length; i++) {
              exercise = data[i].exerciseId;
              if(exercise != undefined) {
                student.addDoneExercise(exercise);
                if(data[i].outcome == 'success') {
                  assignment.updateSuccsessfulExercise(data[i].level);
                }
                else if(data[i].outcome == 'failure') {
                  assignment.updateUnsuccsessfulExercise(data[i].level);
                }
              }
            }
            console.log(student.doneExercises);
            Cache.students.add(student);
            sendRespose(user);
        }
    })        
}  