var mongoose = require('mongoose');
var audit = require('./audit');
var assignment = require('./assignments');
var Cache = require('../cache/Students');
var Schema = mongoose.Schema;

var Exercise = mongoose.model('Exercise');
var SubSubject = mongoose.model('SubSubject');
var AssignedExercises = mongoose.model('AssignedExercises');
var BodyPart = mongoose.model('BodyPart');
var Solution = mongoose.model('Solution');
var randGen = require('mongoose-query-random');
var Audit = mongoose.model('UserAudit');
var UserProgress = mongoose.model('userProgress');
var Assignment = mongoose.model('Assignment');

var MAX_EXERCISE_LEVEL = 6;

module.exports.getExercise = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } 
  else {
    var exerciseId = mongoose.Types.ObjectId(req.query.exerciseId);
    Exercise
      .find({'_id': exerciseId})
      .exec(function(err, exercise) {
        res.status(200).json(exercise);
      });
  }
};


/**
 * In this function we will get the next exercise for the user based on his current status and history. The flow is as follows:
 * 
 * 1. First we will pupulate our objects from the Cache.
 * 2. If this request comes after the user solved an exercise, then audit this exercise
 * 2.1. Add a record to the Audit table for this exercise
 * 2.1.1 Update the updatedDate of the assignment
 * 2.2 If this is the first exercise then it means that the assignment just started and we need to change its status to 'inprogress'
 * 2.3. Add this exercise to the cache and mark it as done.
 * 2.4. before getting a new exercise we need to adjust the status based on student request
 * 2.4.1 Adjust the status based on student request
 * 2.4.2 The user requested a change in sub subjec (choose on of the dependencies), so update the sub subject and add user progress record
 * 2.4.3 There is no change in sub subject or level, so just get the next exercise
 * 2.4.4 The user requested to skip a level, so update the level and add the user progress record
 * 2.4.5 The user requested to go back to the original sub subject, so update the sub subject and last level there and add the user progress record
 * 2.5 Call update exercise statistics function
 * 2.6 Update exercise statistics based on the exercise outcome. Don't wait for callback, assume success
 * 3. If this request is the first one after the user logged in then there is no current excersie, so go ahead and get an exercise
 * 4. Get the next exercise for a defined sub subject and level
 * 5. Call back to the main flow with all the exercises for that subsubject and level
 * 6. Choose one exercise for the result set. Filter out the ones that the user already saw and choose the first one that he didnt see yet
 * 6.1 If this is a group exercise (base or part) then use a group flow
 * 6.2 If this is a base group exercise then update the cache and continue
 * 6.3 This is a "step" exercise of the current groupId, so return this exercise
 * 6.4 This is a "step" exercise of a differnt groupId, so just skip it
 * 6.5 this is a regular execise in the middle of a group exercise process. ignore it for now.
 * 6.6 this is a regular execise, so just return it
 * 7. If we found an exercise lets get some more details and send it to the student
 * 7.1 This is a regular exercise, just send it to the student
 * 7.1.1 An exercise was found, so just return it. The flow is now done.
 * 7.2 This is a group exercise, so send the next step to the student
 * 7.2.1 Get the base exercise first
 * 7.2.2 Return the group exercise to the student
 * 7.3 This is a group exercise flow and we have no exercise to return, so mark the group as done and loop again over the available exercises
 * 7.4 Add the base exercise to the cache and mark it as done.
 * 7.5 We are done with the group exercise, so run the whole process again to see if we have more exercises for this level
 * 8. If no exercise was found for this level go to the next level and repeat the process.
 * 8.1 Add a record to the user progress collection, update the chace and recursively get an exercise from the new level
 * 9. We are done with all levels for the assignment state
 * 9.1 If we are in the original sub subject then update the assignment status and send a message back to the student. 
 */ 
module.exports.getNextExercise = function (req, res) {
  var student;
  var assignment;
  var currentExerciseLevel;
  var subSubject;
  var levelChange;
  var subSubjectChange;
  var shouldGoBackToOriginalAssignment = false;
  // 2.6 Update exercise statistics based on the exercise outcome. Don't wait for callback, assume success
  var updateExerciseStatistics = function() {
    var exerciseId = mongoose.Types.ObjectId(req.query.currentExerciseId);
    if(req.query.assistant == 'picture_solution') {
      Exercise.update({_id: exerciseId}, { $inc: { gaveups: 1 } }, { upsert: true }, function (err) {
        if (err) {
          console.log('update failed');
        }
      })
    }
    else if(req.query.currentExerciseOutcome == 'true') {
      Exercise.update({_id: exerciseId}, { $inc: { successes: 1 } }, { upsert: true }, function (err) {
        if (err) {
          console.log('update failed');
        }
      })
    }
    else if(req.query.currentExerciseOutcome == 'false') {
      Exercise.update({_id: exerciseId}, { $inc: { failures: 1 } }, { upsert: true }, function (err) {
        if (err) {
          console.log('update failed');
        }
      })
    }
  }
  // 2.4.1 Adjust the status based on student request
  var adjustStatus = function() {
    // 2.4.2 The user requested a change in sub subject (choose one of the dependencies), so update the sub subject and add user progress record
    if(subSubjectChange != undefined) {
      subSubject = mongoose.Types.ObjectId(subSubjectChange);
      currentExerciseLevel = 0;
      addUserProgressRecord();
    }
    // 2.4.3 There is no change in sub subject or level, so just get the next exercise
    else if(levelChange == 0) {
      getExercisesForSubsubjectAndLevel(subSubject, currentExerciseLevel, chooseOneExercise);
    }
    // 2.4.4 The user requested to skip a level, so update the level and add the user progress record
    else if(levelChange == 1) {
      currentExerciseLevel++;
      assignment.resetMaxSequencialHits();
      addUserProgressRecord();
    }
    // 2.4.5 The user requested to go back to the original sub subject, so update the sub subject and last level there and add the user progress record
    else if(levelChange == -1) {
      assignment.resetMaxSequencialHits();
      subSubject = assignment.getOriginalSubSubjectId();
      currentExerciseLevel = assignment.getOriginalSubSubjectLastLevel();
      shouldGoBackToOriginalAssignment = true;
      addUserProgressRecord();
    }
    else {
      console.log('Error - unknown levelChange value: ' + levelChange);
    }
  }

  // 8.1 - Add a record to the user progress collection, update the chace and recursively get an exercise from the new level 
  var addUserProgressRecord = function() {
    var userProgress = new UserProgress();
  
    userProgress.userId = req.payload._id;
    userProgress.level = currentExerciseLevel;
    userProgress.subsubjectId = subSubject;
    userProgress.assignmentId = assignment.getId();

    userProgress.save(function (err) {
      assignment.addUserProgress(userProgress);
      getExercisesForSubsubjectAndLevel(subSubject, currentExerciseLevel, chooseOneExercise);
    })
  }

  // 2.1. Add a record to the Audit table for this exercise
  var auditExercise = function () {
    var updateAssignmentStatus = function() {
      console.log('came back from progressRecord.save with ' + JSON.stringify(auditRecord));
      // 2.1.1 Update the updatedDate of the assignment
      var currDate = new Date();
      assignment.updateDateStatus(currDate);
      Assignment.
      update({_id: assignment.getId()}, {$set: {'updatedDate': currDate}}, 
        function(err, result) {
          if (err) {
            console.log('Failed to update the assignment with the new updated date ' + err);
          }                
        });
      // 2.2 If this is the first exercise then it means that the assignment just started and we need to change its status to 'inprogress'
      if(assignment.isNew()) {
        assignment.setInProgress();
        Assignment.
        update({_id: assignment.getId()}, {$set: {'status': 'inprogress'}}, 
          function(err, result) {
            if (err) {
              console.log('Failed to update the assignment with the new status ' + err);
            }                
          });
      }
    }
    var auditRecord = new Audit();
    auditRecord.type = 'exercise';
    auditRecord.userId = req.payload._id;
    auditRecord.level = currentExerciseLevel;
    auditRecord.subsubjectId = subSubject;
    auditRecord.exerciseId = req.query.currentExerciseId;
    if(req.query.currentExerciseOutcome == 'true') {
      auditRecord.outcome = 'success';
      assignment.incrementSequencialHits();
    }
    else {
      auditRecord.outcome = 'failure';
      assignment.resetSequencialHits();
    }
    auditRecord.save(function (err) {
      if (err) {
        console.log(err);
      }
      else {
        updateAssignmentStatus();
        // 2.3. Add this exercise to the cache and mark it as done.
        student.addDoneExercise(req.query.currentExerciseId);          
        // 2.4. before getting a new exercise we need to adjust the status based on student request
        adjustStatus();
      }
    })
    // 2.5 Call update exercise statistics function
    updateExerciseStatistics();
  };
  // 6. Choose one exercise for the result set. Filter out the ones that the user already saw and choose the first one that he didnt see yet
  var chooseOneExercise = function(exercises, subSubjectName) {
    assignment.setGroupId(null);
    assignment.setGroupBody([]);
    assignment.setNextExercise(null);
    
    // 7.1 This is a regular exercise, just send it to the student
    var returnRegularExercise = function(isFromGroup) {
      Exercise
        .find({'_id': mongoose.Types.ObjectId(assignment.getNextExercise().Id)})
        .exec(function(err, exercise) {
          // 7.1.1 An exercise was found, so just return it. The flow is now done.
          if(exercise.length > 0) {
            if(isFromGroup) {
              exercise[0].body = assignment.getGroupBody().concat(exercise[0].body);
            }
            exercise[0].properties = {
                          subSubjectName: subSubjectName, 
                          subSubjectId: subSubject,
                          level: currentExerciseLevel,
                          maxSequencialHits: assignment.getMaxSequencialHits(),
                          resumeOriginalAssignment: false
            };
            if(shouldGoBackToOriginalAssignment == true) {
              shouldGoBackToOriginalAssignment = false;
              exercise[0].properties.resumeOriginalAssignment = true;
            }
            res.status(200).json(exercise[0]);
            return;
          }
          else {
            console.log('Error - cant find exercise by ID');
            res.status(200).json(null);
            return;
          }            
        });
    }

    // 7.2 This is a group exercise, so send the next step to the student
    var returnGroupBaseExercise = function() {
      Exercise
        // 7.2.1 Get the base exercise first
        .find({'_id': mongoose.Types.ObjectId(assignment.getGroupId())})
        .exec(function(err, exercise) {
          if(exercise.length > 0) {
            assignment.setGroupBody(exercise[0].body);
            // 7.2.2 Return the group exercise to the student
            returnRegularExercise(true);
          }
          else {
            console.log('Error - cant find exercise by ID');
            res.status(200).json(null);
            return;
          }            
      });        
    }
    
    for(var i=0; i<exercises.length; i++) {
      if(!student.isExerciseDone(exercises[i].Id)) {
        // 6.1 If this is a group exercise (base or step) then use a group flow
        if(exercises[i].groupId != undefined) { 
          // 6.2 If this is a base group exercise then update the cache and continue
          if(exercises[i].groupId.toString() == exercises[i].Id.toString()) {
              assignment.setGroupId(exercises[i].groupId);
              continue;
          }
          // 6.3 This is a "step" exercise of the current groupId, so return this exercise
          else if(exercises[i].groupId.toString() == assignment.getGroupId().toString()) {
            assignment.setNextExercise(exercises[i]);
            break;
          }
          // 6.4 This is a "step" exercise of a differnt groupId, so just skip it
          else if(exercises[i].groupId.toString() != assignment.getGroupId().toString()) {
            continue;
          }
        }
        // 6.5 this is a regular execise in the middle of a group exercise process. ignore it for now.
        else if(assignment.getGroupId() != null) {
            continue;
        }
        // 6.6 this is a regular execise, so just return it
        else {
          assignment.setNextExercise(exercises[i]);
          break;
        }
      }
    }
    // 7. If we found an exercise lets get some more details and send it to the student
    if(assignment.getNextExercise() != null) {
      // 7.1 This is a regular exercise, just send it to the student
      if(assignment.getGroupId() == null) {
        returnRegularExercise(false);
      }
      // 7.2 This is a group exercise, so send the next step to the student
      else {
        returnGroupBaseExercise();
      }
    }
    // 7.3 This is a group exercise flow and we have no exercise to return, so mark the group as done and loop again over the available exercises
    else if(assignment.getGroupId() != null) {
      // 7.4 Add the base exercise to the cache and mark it as done.
      student.addDoneExercise(assignment.getGroupId());
      // 7.5 We are done with the group exercise, so run the whole process again to see if we have more exercises for this level
      chooseOneExercise(exercises, subSubjectName);
    }
    // 8. If no exercise was found for this level go to the next level and repeat the process.
    else {
      if(currentExerciseLevel <= MAX_EXERCISE_LEVEL) {
        currentExerciseLevel++;
        assignment.resetMaxSequencialHits();
        addUserProgressRecord();
      }
      // 9. We are done with all levels for the assignment state
      else {
        // 9.1 If we are in the original sub subject then update the assignment status and send a message back to the student.
        if(assignment.inOriginalSubSubject()) {  
          Assignment.
            update({_id: assignment.getId()}, {$set: {'status': 'done'}}, 
              function(err, result) {
                if (err) {
                  console.log('Failed to update the assignment with the new status ' + err);
                }
                res.status(200).json({status: 'NoMoreExercises'});
                return;
              });
        }
        // If this is not the original sub subject then we need to go back to the same level there
        else {
          assignment.resetMaxSequencialHits();
          subSubject = assignment.getOriginalSubSubjectId();
          currentExerciseLevel = assignment.getOriginalSubSubjectLastLevel();
          shouldGoBackToOriginalAssignment = true;
          addUserProgressRecord();
        }
      }
    }
  }
  
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private exercise"
    });
  } 
  // 1. First we will pupulate our objects from the Cache.
  else {
    student = Cache.students.get(req.payload._id);
    assignment = student.getAssignment(req.query.assignmentId);
    currentExerciseLevel = assignment.getCurrentExerciseLevel();
    subSubject = assignment.getCurrentSubSubjectId();
    levelChange = req.query.levelChange;
    subSubjectChange = req.query.subSubjectChange;

    // 2. If this request comes after the user solved an exercise, then audit this exercise
    if(req.query.currentExerciseId != undefined) {
      auditExercise();
    }
    // 3. If this request is the first one after the user logged in then there is no current excersie, so go ahead and get an exercise 
    else {
      getExercisesForSubsubjectAndLevel(subSubject, currentExerciseLevel, chooseOneExercise);
    }    
  }

};
// 4. Get the next exercise for a defined sub subject and level
getExercisesForSubsubjectAndLevel = function (subsubject, level, callBackFunction) {
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
        },
        name:1
      }
    }
    )
    .exec(function (err, result) {
      if(result.length == 0) {
        callBackFunction([]);
      }
      else {
        console.log('exe for this subsubject and level:' + result[0].exercises.length);
        // 5. Call back to the main flow with all the exercises for that subsubject and level
        callBackFunction(result[0].exercises, result[0].name);
      }
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
  // if this is a base in a multi step exercise then update the groupId
  if(req.body.solutions.length == 0) {
    exercise.groupId = exercise._id;
  }
  // this is not a base group exercise, so create all the solutions from all solution parts
  else {
    req.body.solutions.forEach(function (solution) {
      var sol = new Solution();
      sol.solution = solution.solution;
      sol.isCorrect = solution.isCorrect;
      exercise.solutions.push(sol);
    });
  }
  // if this is a step in a multi step exercise then update the groupId 
  if(req.body.groupId != undefined) {
    exercise.groupId = req.body.groupId;
  }
  // save the exercise
  exercise.save(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      var newExercise = new AssignedExercises();
      newExercise.Id = exercise._id;
      newExercise.level = exercise.level;
      // if this is a multi step exercise then update the groupId
      if(exercise.groupId != undefined) {
        newExercise.groupId = exercise.groupId;
      }
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

module.exports.removeExercise = function (req, res) {
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
