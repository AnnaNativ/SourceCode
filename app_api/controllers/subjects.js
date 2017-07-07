var mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var SubSubject = mongoose.model('SubSubject');
var Video = mongoose.model('Video');

module.exports.getSubjects = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    Subject
      .find()
      .exec(function(err, subjects) {
        res.status(200).json(subjects);
      });
  }
};

module.exports.getSubSubjects = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var subject = new mongoose.mongo.ObjectId(req.query.subject);
    SubSubject
      .find({'subjectId': subject})
      .exec(function(err, subSubjects) {
        res.status(200).json(subSubjects);
      });
  }
};

module.exports.getVideos = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var videos = [];
    for(var i=0; i<req.query.videos.length; i++) {
      videos.push(new mongoose.mongo.ObjectId(req.query.videos[i]));
    }
    Video
      .find({'_id': { $in: videos}})
      .exec(function(err, videos) {
        res.status(200).json(videos);
      });
  }
};

module.exports.newSubject = function(req, res) {
  console.log('in subject.controller newSubject');
  var subject = new Subject();
  subject.name = req.body.name;
  subject.schoolGrade = req.body.schoolGrade;
  subject.level = req.body.level;
  subject.subSubjects = [];

  subject.save(function (err) {
      res.status(200).json(subject);
  });
}

module.exports.newSubSubject = function(req, res) {
  console.log('in subject.controller newSubSubject');
  var sampleVideos = new Video();
  var tutorialVideo = new Video();
  
  var createSubSubjectsCB = function() {
    var subSubject = new SubSubject();
    subSubject._id = new mongoose.mongo.ObjectId();
    subSubject.name = req.body.name;
    subSubject.tutorial_video = tutorialVideo._id;
    subSubject.sample_videos = [sampleVideos._id];

    subSubject.exercises = [];
    subSubject.subjectId = new mongoose.mongo.ObjectId(req.body.subjectId);
    subSubject.save(function (err) {
      if(err) {
        console.log(err);
      }
      else {
        //update the subject object with the new subsubjectId
        console.log('createdSubsubject: ' + subSubject);
        Subject
        .update({"_id": subSubject.subjectId},{$push:{subSubjects: subSubject._id}})
        .exec(function(err, subjects) {
          console.log('subject is updated!!!!')
          res.status(200).json(subSubject);
        });
      }
    });
  }

  var createSampleVideosCB = function(createSubSubjectsCB) {
    sampleVideos._Id = new mongoose.mongo.ObjectId();
    sampleVideos.type = 'sample solution'
    sampleVideos.name = req.body.name;
    sampleVideos.link = req.body.sampleVideos;
    sampleVideos.save(function(err){
      if(err) {
        console.log(err);
      }
      else {
        createSubSubjectsCB();
      }  
    });
  }

  var createTutorialVideo = function(createSampleVideosCB) {
    tutorialVideo._Id = new mongoose.mongo.ObjectId();
    tutorialVideo.type = 'tutorial';
    tutorialVideo.name = req.body.name;
    tutorialVideo.link = req.body.tutorialVideo;
    tutorialVideo.save(function(err){
      if(err) {
        console.log(err);
      }
      else {
        createSampleVideosCB(createSubSubjectsCB);
      }  
    });
  } 
  createTutorialVideo(createSampleVideosCB);
}

