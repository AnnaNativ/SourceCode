var mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var SubSubject = mongoose.model('SubSubject');
var Video = mongoose.model('Video');
var Assignment = mongoose.model('Assignment');
var Cache = require('../cache/Students');

var dependencies = [];
var dependenciesWithSubject = [];

module.exports.getDependencies = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var student = Cache.students.get(req.payload._id);
    var assignment = student.getAssignment(req.query.assignmentId);
    var subSubject = assignment.getCurrentSubSubjectId();
    dependencies = [];
    dependenciesWithSubject = [];

    SubSubject
      .find({_id: new mongoose.mongo.ObjectId(subSubject)})
      .exec(function(err, subSubject) {
        if(subSubject[0].dependencies.length == 0) {
          res.status(200).json(dependenciesWithSubject);
          return;
        }
        else {
          subSubject[0].dependencies.forEach(function(dependency) {
            SubSubject
              .find({_id: dependency})
              .exec(function(err, dependentSubSubject) {
                dependencies.push({id: dependentSubSubject[0]._id, 
                                   name: dependentSubSubject[0].name, 
                                   subject: dependentSubSubject[0].subjectId, 
                                   exercises: dependentSubSubject[0].exercises});
                if(dependencies.length == subSubject[0].dependencies.length) {
                  dependencies.forEach(function(dependencyObj) {
                    Subject
                    .find({_id: dependencyObj.subject})
                    .exec(function(err, subject) {
                      dependenciesWithSubject.push({id: dependencyObj.id, name: 
                                                    dependencyObj.name, subject: 
                                                    subject[0].name, 
                                                    hasExercises: student.hasMoreExercisesForDependency(dependencyObj.exercises)});
                      if(subSubject[0].dependencies.length == dependenciesWithSubject.length) {
                          res.status(200).json(dependenciesWithSubject);
                          return;
                      }
                    });
                  })
                }
              });
          })
        }
      });
  }
};

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

module.exports.getSubject = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var subject = new mongoose.mongo.ObjectId(req.query.subject);
    Subject
      .find({'_id': subject})
      .exec(function(err, subject) {
        res.status(200).json(subject);
      });      
  }
};

module.exports.getSubSubject = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var subSubject = new mongoose.mongo.ObjectId(req.query.subSubject);
    SubSubject
      .find({'_id': subSubject})
      .exec(function(err, subSubject) {
        res.status(200).json(subSubject);
      });      
  }
};

module.exports.removeSubject = function(req, res) {
  var removeThisSubject = function(subjectId) {
    Subject.remove({_id: subjectId}, function(err) {
        if (!err) {
          res.status(200).json({'res': 'subject_removed'});
        }
        else {
            res.status(401).json({'res': 'no_subject_removed'});         
        }
    });              
  }

  var checkForSubSubjects = function(subjectId) {
    Subject
      .find({'_id': subjectId})
      .exec(function(err, subject) {
        if(subject.length > 0) {
            if(subject[0].subSubjects.length > 0) {
              res.status(200).json({'res': 'subject_has_subSubjects'});
            }
            else {
              removeThisSubject(subjectId);
            }
        }
        else {
          res.status(200).json({'res': 'no_subject_found'});
        }
      });      
  }
  checkForSubSubjects(new mongoose.mongo.ObjectId(req.body._id));
}

module.exports.removeSubSubject = function(req, res) {

  var doRemoveSubsubject = function(subSubjectId) {
    SubSubject.remove({_id: subSubjectId}, function(err) {
        if (!err) {
          res.status(200).json({'res': 'subsubject_removed'});
        }
        else {
           res.status(401).json({'res': 'no_subsubject_removed'});         
        }
    });              
  }

  var removeFromSubject = function(subSubjectId, subjectId) {
    Subject
      .update(
              {'_id': subjectId}, 
              {$pull: {subSubjects: subSubjectId}})
      .exec(function (err, data) {
        console.log('subject is updated!!!!')
        if(!err) {
          doRemoveSubsubject(subSubjectId);
        }
        else {
          res.status(200).json({'res': 'no_subject_found'});          
        }
      });

  }

  var checkForDependencies = function(subSubjectId, subjectId) {
    SubSubject
      .find()
      .exec(function(err, subSubject) {
        var dependents = [];
        if(subSubject.length > 0) {
          for(var i=0; i<subSubject.length; i++) {
              console.log('subSubject is:' + JSON.stringify(subSubjectId));
              console.log(JSON.stringify('dependencies are' + subSubject[i].dependencies));
              if(JSON.stringify(subSubject[i].dependencies).includes(JSON.stringify(subSubjectId))) {
                dependents.push(subSubject[i].name);
              }
          }
          if(dependents.length > 0) {
            res.status(200).json({'res': 'subsubject_has_dependents', 'dependents': dependents});        
          }
          else {
            removeFromSubject(subSubjectId, subjectId);        
          }
        }
        else {
          res.status(200).json({'res': 'no_subsubject_found'});
        }
      });      
  }

  var checkForAssignments = function(subSubjectId, subjectId) {
    Assignment
      .find({'subsubjectId': subSubjectId})
      .exec(function(err, assignment) {
        if(assignment.length > 0) {
            res.status(200).json({'res': 'subsubject_has_assignments'});
        }
        else {
          checkForDependencies(subSubjectId, subjectId);
        }
      });      
  }

  var checkForExercises = function(subSubjectId) {
    SubSubject
      .find({'_id': subSubjectId})
      .exec(function(err, subSubject) {
        if(subSubject.length > 0) {
            if(subSubject[0].exercises.length > 0) {
              res.status(200).json({'res': 'subsubject_has_exercises'});
            }
            else {
              checkForAssignments(subSubjectId, subSubject[0].subjectId);
            }
        }
        else {
          res.status(200).json({'res': 'no_subsubject_found'});
        }
      });      
  }
  checkForExercises(new mongoose.mongo.ObjectId(req.body._id));
};

module.exports.getSubSubjects = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    if(req.query.subject != undefined) {
      var subject = new mongoose.mongo.ObjectId(req.query.subject);
      SubSubject
        .find({'subjectId': subject})
        .exec(function(err, subSubjects) {
          res.status(200).json(subSubjects);
        });
    }
    else {
      SubSubject
        .find()
        .exec(function(err, subSubjects) {
          res.status(200).json(subSubjects);
        });      
    }
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

module.exports.getVideo = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var video = new mongoose.mongo.ObjectId(req.query.video);
    Video
      .find({'_id': video})
      .exec(function(err, data) {
        res.status(200).json(data);
      });
  }
};

module.exports.newSubject = function(req, res) {
  console.log('in subject.controller newSubject');

  var updateSubject = function() {
    var id = new mongoose.mongo.ObjectId(req.body.editing);
    Subject.update({'_id':id},
      {$set: {'name': req.body.name, 'schoolGrade': req.body.schoolGrade, 'level': req.body.level}},
      function(err, result){
        if (err) {
            console.log('Failed to update the Subject with new info ' + err);
        }
        else {
              res.status(200).json('subject updated successfully');
        }
    });
  }
  
  if(req.body.editing != undefined) {
    updateSubject();
  }
  else {
    var subject = new Subject();
    subject.name = req.body.name;
    subject.schoolGrade = req.body.schoolGrade;
    subject.level = req.body.level;
    subject.subSubjects = [];

    subject.save(function (err) {
        res.status(200).json(subject);
    });
  }
}

module.exports.newSubSubject = function(req, res) {
  console.log('in subject.controller newSubSubject');
  var sampleVideos = undefined;
  var tutorialVideo = undefined;
  
  var updateSubSubject = function() {
    var id = new mongoose.mongo.ObjectId(req.body.editing);
    var dependencies = [];
    for(var i=0; i<req.body.dependencies.length; i++) {
      var dependency = new mongoose.mongo.ObjectId(req.body.dependencies[i].id);
      dependencies.push(dependency);
    }
    SubSubject.update({'_id':id},
      {$set: {'name': req.body.name, 
              'tutorial_video': tutorialVideo != undefined ? tutorialVideo._id : undefined, 
              'sample_videos': sampleVideos != undefined ? [sampleVideos._id] : [], 
              'dependencies': dependencies}},
      function(err, result){
        if (err) {
            console.log('Failed to update the SubSubject with new info ' + err);
        }
        else {
              res.status(200).json('subSubject updated successfully');
        }
    });
  }
  
  var createSubSubjectsCB = function() {
    var subSubject = new SubSubject();
    if(req.body.editing != undefined) {
      updateSubSubject();
    }
    else {
      subSubject._id = new mongoose.mongo.ObjectId();
      subSubject.name = req.body.name;
      subSubject.tutorial_video = tutorialVideo != undefined ? tutorialVideo._id : undefined;
      subSubject.sample_videos = sampleVideos != undefined ? [sampleVideos._id] : undefined;

      subSubject.exercises = [];
      subSubject.dependencies = [];
      for(var i=0; i<req.body.dependencies.length; i++) {
        var dependency = new mongoose.mongo.ObjectId(req.body.dependencies[i].id);
        subSubject.dependencies.push(dependency);
      }
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
  }

  var createSampleVideosCB = function(createSubSubjectsCB) {
    if(req.body.sampleVideos == undefined || req.body.sampleVideos.length == 0) {
      createSubSubjectsCB();
    }
    else {
      sampleVideos = new Video();
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
  }

  var createTutorialVideo = function(createSampleVideosCB) {
    if(req.body.tutorialVideo == undefined || req.body.tutorialVideo.length == 0) {
      createSampleVideosCB(createSubSubjectsCB);
    }
    else {
      tutorialVideo = new Video();
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
  } 
  createTutorialVideo(createSampleVideosCB);
}

