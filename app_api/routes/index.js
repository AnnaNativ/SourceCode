var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlExercise = require('../controllers/exercise');
var ctrlSubjects = require('../controllers/subjects');
var ctrlAssignment = require('../controllers/assignments');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.get('/studentsOfTeacher', auth, ctrlProfile.getStudentsOfTeacher);
router.get('/teachersList', ctrlProfile.getTeachersList);

// exercises
router.get('/exercise', auth, ctrlExercise.getExercise);
router.get('/exercisesForSubjectAndSubSubject', auth, ctrlExercise.getExercisesForSubjectAndSubSubject);
// subjects
router.get('/subjects', auth, ctrlSubjects.getSubjects);

//assignment
router.get('/myAssignments',userId, ctrlAssignment.getMyAssignments);


// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/logout', ctrlAuth.logout);

router.post('/exercise', ctrlExercise.newExercise);

module.exports = router;
