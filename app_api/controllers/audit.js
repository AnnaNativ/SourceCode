var mongoose = require('mongoose');

var audit = mongoose.model('UserAudit');


module.exports.getSeenExercises = function(param,exe,callbackFunc)
{
   console.log('getting a list of exe for a specific user/subsubject/level '+ JSON.stringify(param.userid) +'/'+ JSON.stringify(param.subject)+'/'+ param.level);
   
   var userId = mongoose.Types.ObjectId(param.userid);
   audit
      .aggregate(
        {$match:{'userId':param.userid,'subsubjectId':param.subject,'level':param.level}})
      .exec(function(err, data) {
        if(err){
          console.log('Returned from aggregate with error '+ err);
        }
        else{
         
          console.log('came back with '+data.length +' exercises that need to be excluded');
          callbackFunc(exe,data);

        }  
      }); 
  };
