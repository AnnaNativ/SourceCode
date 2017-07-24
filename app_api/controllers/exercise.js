var mongoose = require('mongoose');
var audit = require('./audit');
var assignment = require('./assignments');
var Schema = mongoose.Schema;

var Exercise = mongoose.model('Exercise');
var SubSubject = mongoose.model('SubSubject');
var AssignedExercises = mongoose.model('AssignedExercises');
var BodyPart = mongoose.model('BodyPart');
var Solution = mongoose.model('Solution');
var randGen = require('mongoose-query-random');

module.exports.getExercise = function (req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } else {
    Exercise
      .find()
      .random(1, true, function (err, exercise) {
        res.status(200).json(exercise[0]);
      });
  }

};
getExercisesForSubsubjectAndLevel = function (subsubject, level, callbackFunc1) {

  SubSubject
    .aggregate(
    { $match: { '_id': subsubject } },
    {
      $project: {
        exercises: {
          $filter: {
            input: '$exercises',
            as: 'exer',
            cond: { $eq: ["$$exer.level", level] }
          }
        }
      }
    }
    )
    .exec(function (err, result) {
      console.log('exe for this subsubject and level:' + result[0].exercises.length);
      callbackFunc1(result[0].exercises);
    });
};

module.exports.getSimilarExercise = function (req, res) {

  var subsubject = mongoose.Types.ObjectId(req.query.subsubject);
  var level = Number(req.query.level);
  var user = req.query.userId;
  var exeforLevel = [];
  
  console.log('looking  for the same exe for subsubject ' + subsubject + ' for level ' + level );
  
  PostSeenExe = function (seenExe) {
    console.log(' I am in PostSeenExe callbackFunc with: ' + seenExe.length + ' seen exe and ' +exeforLevel.length +' available exe');
    //removing seenExe from the list of exe
    
    exeforLevel = internalCleanUpExercisesFromSeen(exeforLevel,seenExe);
    console.log('after cleanup left with ' + exeforLevel.length);
    if(exeforLevel.length == 0) // there are no exe left in this level, move to the next level
    {
      level = level+1;
      console.log(' no unseen exe for this level are left, record it and go for a higher level ' + level);
      //record it first
      audit.updateProgressLevel(user,subsubject,level); 
      getExercisesForSubsubjectAndLevel(subsubject, level, PostExesForSubsubjectAndLevel);
    } 
      else
        internalgetRandom(exeforLevel);
    
  };

  PostGetExeForId = function (nextExe) {
    console.log('prepping params for the next exe');
    //adding subsubject and level for the audit
    var response = {};
    response.level = level;
    response.subsubject = subsubject;
    response.exe = nextExe[0];
    //console.log('sending to client exe with level:' + JSON.stringify(response));
    res.status(200).json(response);
  };

  PostExesForSubsubjectAndLevel = function(result){
      console.log('need to filter out exe that have already been seen');
      if(result.length == 0){
         if(level < 10){
          level = level +1;
          console.log("in PostExesForSubsubjectAndLevel.Done with this level. Going to the next level " + level);
          audit.updateProgressLevel(user,subsubject,level);
          getExercisesForSubsubjectAndLevel(subsubject, level, PostExesForSubsubjectAndLevel);
         }
         else{
          console.log('!!!!!!! reached the highest level for this subsubject');
          //mark subsubject as done in Progress

          audit.MarkSubsubjectasDone(user,subsubject);
          //check if this is the original subsubject for this assignment 
          //audit.IsOriginal(user,subsubject,PostIsOriginal);
          //if yes - mark assignment as done
          //else go back to the original subsubject
          //TBD  xxxx LEFT IT HERE

        }
      } else{
       exeforLevel = result;
       var param = {
          'userId': user,
          'subsubjectId': subsubject,
          'level': level
        };
        audit.getSeenExercises(param, PostSeenExe);
      }  
  };
   getExercisesForSubsubjectAndLevel(subsubject, level, PostExesForSubsubjectAndLevel);

  console.log('we have '+ availableExe.length + ' exe for this level');
};

module.exports.getRandom = function(exeforLevel){
  internalgetRandom(exeforLevel);
}

internalgetRandom = function(exeforLevel){
  if (exeforLevel.length > 0) {
        //pick a random exe from the filtered list
        var randonIndex = Math.floor((Math.random() * exeforLevel.length));
        console.log('getting the next exe for you ' + exeforLevel[randonIndex].Id);
        getExerciseForId(exeforLevel[randonIndex].Id, PostGetExeForId);
  } else {
        console.log('There are no exercise assigned to you that have not been worked on.');
        PostGetExeForId(exeforLevel);
  }
};

module.exports.getExercises = function (req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } 
  else {
    var subSubject = new mongoose.mongo.ObjectId(req.query.subSubject);
    var level = parseInt(req.query.level);
    SubSubject
      .aggregate(
      { $match: { '_id': subSubject } },
      {
        $project: {
          exercises: {
            $filter: {
              input: '$exercises',
              as: 'exer',
              cond: { $eq: ["$$exer.level", level] }
            }
          }
        }
      }
      )
      .exec(function (err, result) {
        console.log('exe for this subsubject and level:' + result[0].exercises.length);
        res.status(200).json(result[0].exercises);
      });
  }
}

getExerciseForId = function (exeId, PostGetExeForIdFunc) {
  Exercise
    .find({ '_id': exeId })
    .exec(function (err, nextExercises) {
      console.log('I got the next exercise for you ' + JSON.stringify(nextExercises[0].body));
      PostGetExeForIdFunc(nextExercises);
    })
};

internalCleanUpExercisesFromSeen = function(exeforLevel,seenExe){
  
  lookForExeId = function(exe,IdToRemove){
      exeToCompare = exe.Id.toHexString();
      console.log('comparing ' + exeToCompare + ' to '+ IdToRemove);
      return(exeToCompare == IdToRemove);
  };
  if (seenExe.length > 0) {
        var seenExeIndex;
        for (index in seenExe) {
          //find it in exe array and remove it
          var exeToRemove = seenExe[index].exerciseId.toHexString();
          seenExeIndex = exeforLevel.findIndex(exe => exe.Id.toHexString() == exeToRemove);
          if(seenExeIndex != -1){
            exeforLevel.splice(seenExeIndex, 1);
            console.log('exe :' + seenExe[index].exerciseId + ' was already worked on by this user');
          }else
            console.log('exe :' + seenExe[index].exerciseId + ' was never seen by this user');
        }
      };
      return exeforLevel;
};

module.exports.CleanUpExercisesFromSeen = function (exeforLevel,seenExe) {
   return internalCleanUpExercisesFromSeen(exeforLevel,seenExe);
};

module.exports.newExercise = function (req, res) {
  console.log("in exercise.js newExercise with: " + req.body);

  var exercise = new Exercise();
  exercise._id = new mongoose.mongo.ObjectId();
  exercise.level = req.body.level;
  // create the exercise body from its parts
  req.body.body.forEach(function (bodyPart) {
    // is this a solution Picture?
    if(bodyPart.type == 'solutionPicture') {
      exercise.solutionPicture = bodyPart.content;
    }
    // if not then it is a body part
    else {
      var part = new BodyPart();
      part.type = bodyPart.type;
      part.content = bodyPart.content;
      exercise.body.push(part);
    }
  });
  // create all the solutions from all solution parts
  req.body.solutions.forEach(function (solution) {
    var sol = new Solution();
    sol.solution = solution.solution;
    sol.isCorrect = solution.isCorrect;
    exercise.solutions.push(sol);
  });
  // save the exercise
  exercise.save(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      var newExercise = new AssignedExercises();
      newExercise.Id = exercise._id;
      newExercise.level = exercise.level;
      // update the subSubject with the new exercise
      SubSubject
        .update({ "_id": req.body.subSubject }, { $push: { exercises: newExercise } })
        .exec(function (err, subSubject) {
          console.log('subSubject is updated!!!!')
          res.status(200).json(subSubject);
        });
    }
  });
};

