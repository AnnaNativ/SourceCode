(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$scope', '$location', 'meanData','$window','audit','exercise', 'assignment', '$sce'];
  function studentCtrl($scope, $location, meanData, $window, audit, exercise, assignment, $sce) {
    //####################################################################################
    //########## Student ###########
    //####################################################################################
    var vm = this;
    vm.currentTab = 'assignments';

    //####################################################################################
    //########## Subjects SubSubjects ###########
    //####################################################################################    
    vm.subjects = {};
    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
      vm.subSubjects = [];
    })
    .error(function(e){
      console.log(e);
    })

    vm.subjectSelected = function() {
      vm.subSubject = undefined;
      meanData.getSubSubjects(vm.subjects[vm.subject]._id)
      .success(function(data){
        vm.subSubjects = data;
      })
      .error(function(e){
        console.log(e);
      })
    }

    //####################################################################################
    //########## Assignments ###########
    //####################################################################################
    vm.myAssignments;
    vm.user = {};
    vm.selectedAssignment = undefined;
    vm.selectedAssignmentIndex = undefined;
    vm.selectedAssignmentDone = false;
    vm.selectedAssignmentFailed = false;

    meanData.getProfile()
      .success(function (data) {
        vm.user = data;

        //save in session
        $window.sessionStorage['userId'] = vm.user._id;
        console.log('In studentCtrl getProfile - Got user profile ' + JSON.stringify(vm.user._id));
        console.log(' $window.sessionStorage["userId"] ' +  $window.sessionStorage['userId']);
        vm.loadAssignments();
      })
      .error(function (e) {
        console.log(e);
      });
    
    vm.newTabSelected = function(newTab) {
      vm.studentScreenMode = newTab;
      if(newTab == 'done' || newTab == 'self' || newTab == 'homework') {
        vm.loadAssignments();
      }
    }  
    
    vm.assignmentsTabSelected = function() {
      vm.currentTab = 'assignments';
      vm.loadAssignments();
    }  

    vm.loadAssignments = function() {
      assignment.myAssignments(vm.user)
        .success(function (data) {
          console.log('got back with ' + data.length + ' assignments to do');
          vm.myAssignments = data;
        })
        .error(function (e) {
          console.log(e);
        });
    }

    vm.assignmentClicked = function($index) {
//      console.log('in assignmentClicked with index:' + $index);
      vm.studentScreenMode = 'assignment';
      vm.selectedAssignment = vm.myAssignments[$index];
      vm.selectedAssignmentIndex = $index;
      vm.selectedAssignmentDone = false;
      vm.selectedAssignmentFailed = false;
      vm.currentTab = 'current assignment';
      vm.exercise = {};
      vm.levelChange = 0;
      vm.getNextExercise();
    }

    vm.addNewAssignment = function() {
      var student = [{"id": vm.user._id}];
      assignment
        .newAssignment({assigner: vm.user._id,
                        assignee: student,
                        subjectId: vm.subjects[vm.subject]._id,
                        subsubjectId: vm.subSubjects[vm.subSubject]._id})
        .error(function(err){
          alert("There was an error : " + err);
        })
        .success(function(data){
          console.log('in student.controller addAssignment.success');
          vm.cancelNewAssignment();
          assignment.myAssignments(vm.user)
            .success(function (data) {
              console.log('got back with ' + data.length + ' assignments to do');
              vm.myAssignments = data;
            })
            .error(function (e) {
              console.log(e);
            });
          });
    }

    vm.cancelNewAssignment = function() {
      vm.subject = undefined;
      vm.subSubject = undefined;
    } 

    vm.formatAssignmentDate = function(dateIn) {
      if(dateIn != undefined) {
        var date = new Date(dateIn);
        var monthNormalized = date.getMonth() + 1;
        return date.getHours() + ':' + date.getMinutes() + '  ' +
               date.getDate()  + '/' + monthNormalized + '/' + date.getFullYear();  
      }
      return '--';
    }

    vm.formatSubmissionDate = function(dateIn) {
      if(dateIn != undefined) {
        var date = new Date(dateIn);
        var monthNormalized = date.getMonth() + 1;
        return date.getDate()  + '/' + monthNormalized + '/' + date.getFullYear();  
      }
      return '--';
    }    //####################################################################################
    //########## Exercise ###########
    //####################################################################################

    vm.exercise = {};
    vm.dependencies = [];
    vm.getNextExercise = function() {
      console.log('In getNextExercise');
      // this is for the case when the user looked at the solution but didn't click the dialog exit button
      if(vm.assistant == 'picture_solution') {
//        console.log('In getNextExercise.if');
        vm.finalSelection = false;
      }
      meanData.getNextExercise(vm.selectedAssignment._id, vm.exercise._id, vm.finalSelection, vm.levelChange, vm.assistant, vm.subSubjectChange)
      .success(function(data){
//        console.log('In getNextExercise.success');
        if(data.status == 'NO_MORE_EXERCISES') {
          vm.selectedAssignmentDone = true;
          vm.selectedAssignment = undefined;
          vm.selectedAssignmentIndex = undefined;
        }
        else if(data.status == 'FAILED_ASSIGNMENT') {
          console.log('In getNextExercise.failed_assignment');
          vm.selectedAssignmentFailed = true;
          vm.selectedAssignment = undefined;
          vm.selectedAssignmentIndex = undefined;
        }
        else {
//          console.log('In getNextExercise.success.else');
          vm.getDependencies(data);
        }
        vm.subSubjectChange = undefined;
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.getDependencies = function(exercise) {
      console.log('In getDependencies');
      meanData.getDependencies(vm.selectedAssignment._id)
      .success(function(data){
        vm.dependencies = data;
        vm.exercise = exercise;
//        console.log('In getDependencies.success with: ' + data);
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.cameBackToOriginalSubSubject = function() {
      if(vm.exercise.properties != undefined) {
//        console.log('In backToOriginalSubSubject');
        return vm.exercise.properties.resumeOriginalAssignment;
      }
    } 
    
    vm.atOriginalSubSubject = function() {
//      console.log('In atOriginalSubSubject.Before');
      if(vm.selectedAssignment != undefined && vm.exercise.properties != undefined) {
        return vm.selectedAssignment.subSubject[0]._id == vm.exercise.properties.subSubjectId;
      }
      return true;
    }

    vm.goBackToOriginalSubSubject = function() {
      vm.finalSelection = false;
      vm.levelChange = -1;
      vm.getNextExercise();
    }

    vm.getPictureForCurrentLevel = function() {
      var path = "http://localhost:3000/images/stage" + vm.exercise.properties.level + ".jpg";
      console.log('In getPictureForCurrentLevel with: ' + path);
      return "http://localhost:3000/images/stage" + vm.exercise.properties.level + ".jpg";
    }
    //####################################################################################
    //########## Solutions ###########
    //####################################################################################
    vm.ALLOW_NEXT_LEVEL_THRESHOLD = 3;
    vm.currentSelection = undefined;
    vm.finalSelection = undefined;
    vm.correctAnswerNextStep = 'moreOfTheSame';
    vm.wrongAnswerNextStep = 'moreOfTheSame';
    vm.name = '';
    vm.sqrtMode = false;
    vm.sqrtValue = '';
    vm.levelChange = 0;
    

//    vm.openSolutionRaw = "ax^4 + bx + c = 0$$ and they are {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.";
//    vm.openSolutionRaw = "(n^2+n)\\over(2n+1)";
//    vm.openSolutionRaw = '';
//    vm.openSolutionRaw = "ax^4 + bx + c = 0";
//    vm.openSolution =  "$$ax^4 + bx + c = 0$$ rr $$x^2$$ rr $$\sqrt{x}$$";
//    vm.openSolution = "$$" + vm.openSolutionRaw + "$$";

    
    Array.prototype.shuffle = function() {
        var input = this; 
        for (var i = input.length-1; i >=0; i--) {
            var randomIndex = Math.floor(Math.random()*(i+1)); 
            var itemAtIndex = input[randomIndex]; 
            input[randomIndex] = input[i]; 
            input[i] = itemAtIndex;
        }
        return input;
    }
    
    $scope.$watch('vm.exercise', function() {
        if(vm.exercise.solutions != undefined) {
          vm.exercise.solutions.shuffle();
        }
    });

    vm.checkAnswer = function () {
      console.log('In checkAnswer');
      vm.finalSelection = undefined;
      // is this an open ended question?
      if(vm.exercise.solutions.length == 1) {
//        console.log('In checkAnswer for open ended question');
        vm.finalSelection = (vm.openSolution == vm.exercise.solutions[0].solution);
      }
      else if(vm.currentSelection != undefined) {
//        console.log('In checkAnswer for closed question');
        vm.finalSelection = vm.exercise.solutions[vm.currentSelection].isCorrect;
      }  
      else {
//        console.log('No answer selected. Will ignore');
      }
      vm.currentSelection = undefined;
    }

    vm.showSolution = function() {
      vm.assistant = 'picture_solution';
      vm.showAssistanceWarning = true;
    }

    vm.preReq = function() {
      vm.assistant = 'pre_req';
    }

    vm.handleRadioClick = function ($index) {
      console.log(vm.exercise.solutions[$index].isCorrect);
      vm.finalSelection = undefined;
      vm.currentSelection = $index;
    };

    vm.nextStepClicked = function() {
      vm.levelChange = 0;
      if(vm.correctAnswerNextStep == 'readyForNextLevel') {
        vm.levelChange = 1;
      }
      else if(vm.wrongAnswerNextStep != 'moreOfTheSame') {
        vm.subSubjectChange = vm.wrongAnswerNextStep;       
      }
      vm.getNextExercise();
      vm.correctAnswerNextStep = 'moreOfTheSame';
      vm.wrongAnswerNextStep = 'moreOfTheSame';

      vm.assistant = undefined;      
      vm.openSolution = undefined;
    }

    vm.updateOpenSolution = function(key) {
      if(vm.sqrtMode) {
        console.log('In sqrt with: ' + key + ' Got: ' + vm.sqrtValue);
        vm.sqrtValue += key;
      }
      else if(key == '\\sqrt{x}') {
        vm.sqrtMode = true;
      }
      else {
        vm.openSolutionRaw += key;
        vm.openSolution = "$$" + vm.openSolutionRaw + "$$";
      }
    }   

    vm.sqrtUpdate = function() {
      vm.openSolutionRaw += '\\sqrt{' + vm.sqrtValue + '}';
      vm.openSolution = "$$" + vm.openSolutionRaw + "$$";
      vm.sqrtMode = false;
      vm.sqrtValue = '';
    }

    vm.clearOpenSolution = function() {
      vm.openSolutionRaw = "";
      vm.openSolution = "";
    }

    vm.allowNextLevel = function() {
      if(vm.exercise.properties != undefined) {
        return (vm.exercise.properties.maxSequencialHits >= vm.ALLOW_NEXT_LEVEL_THRESHOLD);
      }
      return false;
    }
    //####################################################################################
    //########## Assistance ###########
    //####################################################################################    
    vm.assistant = undefined;

    vm.open = function () {
      console.log('opening pop up');
      var modalInstance = $modal.open({
        templateUrl: 'assistance.dialog.html',
      });
    }

    vm.closeAssistance = function() {
      if(vm.assistant == 'picture_solution' && vm.showAssistanceWarning != true) {
        console.log('In closeAssistance.if');
        vm.finalSelection = false;
        vm.levelChange = 0;
        vm.getNextExercise();    
      }
      else if(vm.assistant == 'pre_req' && vm.preReqNextStep != undefined) {
        vm.subSubjectChange = vm.preReqNextStep;
        vm.getNextExercise();
      }
      vm.correctAnswerNextStep = 'moreOfTheSame';
      vm.wrongAnswerNextStep = 'moreOfTheSame';
      vm.openSolution = undefined;
      vm.preReqNextStep = undefined;
    }

    vm.cancelAssistance = function() {
      vm.preReqNextStep = undefined;
    }

    vm.getTutorialVideo = function() {
      meanData.getVideo(vm.selectedAssignment.subSubject[0].tutorial_video)
      .success(function(data){
        vm.assistant = 'tutorial';
        vm.tutorialVideoLink =  $sce.trustAsResourceUrl(data[0].link);
        console.log('In getTutorialVideo.success with: ' + data);
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.getSampleSolutionVideo = function() {
      meanData.getVideo(vm.selectedAssignment.subSubject[0].sample_videos[0])
      .success(function(data){
        vm.assistant = 'sample_solution';
        vm.sampleSolutionVideoLink =  $sce.trustAsResourceUrl(data[0].link);
        console.log('In getSampleSolutionVideo.success with: ' + data);
      })
      .error(function(e){
        console.log(e);
      })
    }

    //####################################################################################
    //########## Status Bar ###########
    //####################################################################################    

    vm.getCurrentLevel = function() {
      if(vm.selectedAssignment != undefined && vm.exercise != undefined && vm.exercise.properties != undefined) {
        return vm.exercise.properties.level;
      }
      return "--";
    }

    vm.getSequencialCorrectAnswers = function() {
      if(vm.selectedAssignment != undefined && vm.exercise != undefined && vm.exercise.properties != undefined) {
        return vm.exercise.properties.currentSequencialHits;
      }
      return "--";      
    }

    vm.getExercisesLeftToSolve = function() {
      if(vm.selectedAssignment != undefined && vm.exercise != undefined && vm.exercise.properties != undefined) {
        return vm.exercise.properties.exercisesLeft;
      }
      return "--";      
    }

    vm.getCurrentGrade = function() {
      if(vm.selectedAssignment != undefined && vm.exercise != undefined && vm.exercise.properties != undefined) {
        return parseInt(100 * vm.exercise.properties.currentGrade);
      }
      return "--";      
    }

    vm.getAssignmentName = function() {
      if(vm.selectedAssignment != undefined) {
        return vm.selectedAssignment.subSubject[0].name;
      }
      return "--";
    }

    vm.flipStr = function(str) {
      console.log('In flipStr with before: ' + str);
      console.log('In flipStr with after: ' + str.replace(/([-0-9]+)/g, "\u202a$1\u202c"));
      return str.replace(/([-0-9]+)/g, "\u202a$1\u202c");
    }
  }
})();