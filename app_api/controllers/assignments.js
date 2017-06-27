var mongoose = require('mongoose');
var exercise = require('exercise');

var assignments = mongoose.model('Assignment');
var progress = mongoose.model('userProgress');

module.exports.getMyAssignments = function(req, res)
{
   console.log('!!!!! getting assignments for ' + req.query._id);
   var userId = mongoose.Types.ObjectId(req.query._id);
   assignments
      .aggregate(
        {$match:{assignee:userId}},
        {$lookup:{from:'subSubjects',localField:'subSubjectId',foreignField:'_id',as:'subSubject'}}
      )
      .exec(function(err, data) {
        if(err){
          console.log('Returned from aggregate with error '+ err);
        }
        else{
          res.status(200).json(data);
          console.log('came back with '+data.length +' assignments');
        }  
      }); 


  };

  
  module.exports.getMyLastLocation = function(req, res)
  {
    console.log('!!!!! getting last location for ' + req.query);
    
    var myAssignmentId = mongoose.Types.ObjectId(req.query._id);
    var lastSubSubject;
    var lastLevel;

    progress
    //.find()
      .aggregate(
       {$match:{'assignmentId':myAssignmentId}},
       {$sort:{'createdDate': -1}},
       { $limit: 1 },
       {$lookup:{from:'subSubjects',localField:'subSubjectId',foreignField:'_id', as:'subSubject'}}
       )
      .exec(function(err, progress) {
        if(err){
          console.log('Returned from getmyLastLocation with error '+ err);
        }
        else{
          res.status(200).json(progress);
          lastSubSubject = progress[0].subSubjectId;
          lastLevel = progress[0].level;

          //get exercise for the subsubject and level that was last done within this assignment
          
        }  
      }); 


    };