var mongoose = require('mongoose');
var User = mongoose.model('User');
var School = mongoose.model('School');

module.exports.profileRead = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }
};

module.exports.getStudentsOfTeacher = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .find({'teacher': req.payload.teacher})
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }
};

module.exports.getTeachersList = function(req, res) {
  User
    .find({"role" : "teacher"})
    .exec(function(err, user) {
      res.status(200).json(user);
    });
};

module.exports.getSchoolsList = function(req, res) {
  School
    .find({})
    .exec(function(err, schools) {
      res.status(200).json(schools);
    });
};
// this is a comment
