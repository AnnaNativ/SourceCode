var mongoose = require('mongoose');

var Audit = mongoose.model('UserAudit');
var Progress = mongoose.model('userProgress');


module.exports.auditExercise = function (req, res) {
 
  console.log('saving audit for finished exe');
  var auditRecord = new Audit();
  auditRecord.type = 'exercise';
  auditRecord.userId = req.body.userId;
  auditRecord.level = req.body.level;
  auditRecord.subsubjectId = req.body.subsubject;
  auditRecord.exerciseId = req.body.exeId;
  auditRecord.outcome = req.body.outcome;

  auditRecord.save(function (err) {
      console.log('came back from progressRecord.save with ' + JSON.stringify(auditRecord));
      res.status(200).json(auditRecord);
  })

};


module.exports.saveProgress = function (req, res) {
  //console.log('saving user progress ' + req.body);
  var userProgress = new UserProgress();
  
  userProgress.type = 'exercise';
  userProgress.userId = req.body.userId;
  userProgress.level = req.body.level;
  userProgress.subsubjectId = req.body.subsubject;
  userProgress.exerciseId = req.body.exeId;
  userProgress.outcome = req.body.outcome;

  userProgress.save(function (err) {
    //console.log('came back from auditRecord.save with ' + JSON.stringify(auditRecord));
      res.status(200).json(userProgress);
  })

};
module.exports.updateProgressLevel = function(userId,subsubject,level){
  
  Progress.update({'userId':userId,'subsubjectId':subsubject},{$set: {'level':level}},function(err, result){
    if (err)
      console.log('Failed to update the progress with the next level ' + err);
  });
}

module.exports.MarkSubsubjectasDone = function(userId,subsubject){
  
  Progress.update({'userId':userId,'subsubjectId':subsubject},{$set: {'isDone':true}},function(err, result){
    if (err)
      console.log('Failed to update the progress with the next level ' + err);
  });
}

module.exports.IsOriginal = function(user,subsubject,PostIsOriginalCallback){
  
  Progress.find({'userId':userId,'subsubjectId':subsubject},{$set: {'isDone':true}},function(err, result){
    if (err)
      console.log('Failed to check for the initial subsubject ' + err);
  });
}



module.exports.getSeenExercises = function(param,callbackFunc){
   //console.log('******* getting a list of exe for a specific user/subsubject/level '+ JSON.stringify(param.userId) +'/'+ JSON.stringify(param.subsubjectId)+'/'+ param.level);
   var userId = mongoose.Types.ObjectId(param.userId);
   var subsubjectId = mongoose.Types.ObjectId(param.subsubjectId);
   //console.log('userId '+ userId + ' subsubjectId '+ subsubjectId+ ' level '+ param.level);
   Audit
      .aggregate(
        {$match:{'userId':userId,'subsubjectId':subsubjectId,'level':param.level}})
      .exec(function(err, data) {
        if(err){
          console.log('Returned from aggregate with error '+ err);
        }
        else{
          // console.log('userId '+ userId + ' subsubjectId '+ subsubjectId+ ' level '+ param.level);
          console.log('came back from audit with '+data.length +' exercises that need to be excluded');
          callbackFunc(data);

        }  
      }); 
  };
