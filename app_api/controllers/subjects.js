var mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var SubSubject = mongoose.model('SubSubject');
var Video = mongoose.model('Video');

module.exports.getSubjects = function(req, res) {
/*  
  var video = new Video({
    name: 'test video2',
    link: 'test link2'
  });

  var videos = [];
  videos.push(video);

  var subSubject = new SubSubject({
    name: 'sub subject2',
    videos: videos
  });    

  var subSubjects = [];
  subSubjects.push(subSubject);

  var subject = new Subject({
    name: 'test subject2',
    subSubjects: subSubjects
  });
  console.log(subject);

  subject.save(function (err) {
    res.status(200);
    res.json({
      "subject": "saved"
    });
  });
*/
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    Subject
      .find()
      .exec(function(err, subjects) {
        res.status(200).json(subjects);
      });
  }

};
