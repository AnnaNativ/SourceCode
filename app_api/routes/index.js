var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

// Requires multiparty 
multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlExercise = require('../controllers/exercise');
var ctrlSubjects = require('../controllers/subjects');
var ctrlUploads = require('../controllers/uploads');
var ctrlAssignment = require('../controllers/assignments');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.get('/studentsOfTeacher', auth, ctrlProfile.getStudentsOfTeacher);
router.get('/teachersList', ctrlProfile.getTeachersList);
router.get('/schoolsList', ctrlProfile.getSchoolsList);

// exercises
router.get('/exercise', auth, ctrlExercise.getExercise);
router.get('/exercises', auth, ctrlExercise.getExercises);
// subjects
router.get('/subjects', auth, ctrlSubjects.getSubjects);
router.get('/subSubjects', auth, ctrlSubjects.getSubSubjects);
router.get('/videos', auth, ctrlSubjects.getVideos);


// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/logout', ctrlAuth.logout);

router.post('/exercise', ctrlExercise.newExercise);
router.post('/subject', ctrlSubjects.newSubject);
router.post('/subSubject', ctrlSubjects.newSubSubject);
// pictures upload
router.post('/upload', multipartyMiddleware, ctrlUploads.uploadPic);

//assignment
router.get('/myAssignments', ctrlAssignment.getMyAssignments);
router.get('/myLastLocation', ctrlAssignment.getMyLastLocation);


module.exports = router;
