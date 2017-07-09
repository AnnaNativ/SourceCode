var mongoose = require('mongoose');

var Audit = mongoose.model('UserAudit');
var Progress = mongoose.model('userProgress');


module.exports.auditExercise = function (req, res) {
  //console.log('saving audit for finished exe ' + req.body);
  var progressRecord = new Progress();
  
  progressRecord.userId = req.body.userId;
  progressRecord.level = req.body.level;
  progressRecord.subsubjectId = req.body.subsubject;
  progressRecord.assignmentId = req.body.exeId;

  progressRecord.save(function (err) {
      console.log('came back from progressRecord.save with ' + JSON.stringify(progressRecord));
      res.status(200).json(progressRecord);
  })

};


module.exports.saveProgress = function (req, res) {
  //console.log('saving user progress ' + req.body);
  var userProgress = new UserProgress();
  
  auditRecord.type = 'exercise';
  auditRecord.userId = req.body.userId;
  auditRecord.level = req.body.level;
  auditRecord.subsubjectId = req.body.subsubject;
  auditRecord.exerciseId = req.body.exeId;
  auditRecord.outcome = req.body.outcome;

  auditRecord.save(function (err) {
    //console.log('came back from auditRecord.save with ' + JSON.stringify(auditRecord));
      res.status(200).json(auditRecord);
  })

};

module.exports.getSeenExercises = function(param,callbackFunc)
{
   console.log('******* getting a list of exe for a specific user/subsubject/level '+ JSON.stringify(param.userId) +'/'+ JSON.stringify(param.subsubjectId)+'/'+ param.level);
   var userId = mongoose.Types.ObjectId(param.userId);
   var subsubjectId = mongoose.Types.ObjectId(param.subsubjectId);
   console.log('userId '+ userId + ' subsubjectId '+ subsubjectId+ ' level '+ param.level);
   Audit
      .aggregate(
        {$match:{'userId':userId,'subsubjectId':subsubjectId,'level':param.level}})
      .exec(function(err, data) {
        if(err){
          console.log('Returned from aggregate with error '+ err);
        }
        else{
          console.log('userId '+ userId + ' subsubjectId '+ subsubjectId+ ' level '+ param.level);
          console.log('came back from audit with '+data.length +' exercises that need to be excluded');
          callbackFunc(data);

        }  
      }); 
  };
