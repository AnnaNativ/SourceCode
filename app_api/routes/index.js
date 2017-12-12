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
var ctrlAudit = require('../controllers/audit');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.get('/studentsOfTeacher', auth, ctrlProfile.getStudentsOfTeacher);
router.get('/teachersList', ctrlProfile.getTeachersList);
router.get('/schoolsList', ctrlProfile.getSchoolsList);

// exercises
router.get('/nextExercise', auth, ctrlExercise.getNextExercise);
router.get('/exercise', auth, ctrlExercise.getExercise);
router.get('/exercises', auth, ctrlExercise.getExercises);
router.post('/removeExercise', ctrlExercise.removeExercise);

// subjects
router.get('/subjects', auth, ctrlSubjects.getSubjects);
router.get('/subSubjects', auth, ctrlSubjects.getSubSubjects);
router.get('/subSubject', auth, ctrlSubjects.getSubSubject);
router.get('/dependencies', auth, ctrlSubjects.getDependencies);
router.get('/videos', auth, ctrlSubjects.getVideos);
router.get('/video', auth, ctrlSubjects.getVideo);


// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/logout', ctrlAuth.logout);

router.post('/exercise', ctrlExercise.newExercise);
router.post('/subject', ctrlSubjects.newSubject);
router.post('/subSubject', ctrlSubjects.newSubSubject);
router.post('/removeSubSubject', ctrlSubjects.removeSubSubject);

// pictures upload
router.post('/upload', multipartyMiddleware, ctrlUploads.uploadPic);

//assignment
router.get('/myAssignments', ctrlAssignment.getMyAssignments);
router.get('/deleteAssignment', ctrlAssignment.deleteAssignment);
router.get('/assignmentsOfTeacher', auth, ctrlAssignment.getAssignmentsOfTeacher);
router.post('/assignment', ctrlAssignment.newAssignment);

//audit
router.post('/auditExercise', ctrlAudit.auditExercise);
router.post('/saveProgress', ctrlAudit.saveProgress);




module.exports = router;
