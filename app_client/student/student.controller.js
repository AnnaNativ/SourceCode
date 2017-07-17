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
    //########## Subjects ###########
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

    meanData.getProfile()
      .success(function (data) {
        vm.user = data;

        //save in session
        $window.sessionStorage['userId'] = vm.user._id;
        console.log('In studentCtrl getProfile - Got user profile ' + JSON.stringify(vm.user._id));
        console.log(' $window.sessionStorage["userId"] ' +  $window.sessionStorage['userId']);
        assignment.myAssignments(vm.user)
          .success(function (data) {
            console.log('got back with ' + data.length + ' assignments to do');
            vm.myAssignments = data;
          })
          .error(function (e) {
            console.log(e);
          });
      })
      .error(function (e) {
        console.log(e);
      });

    vm.assignmentClicked = function($index) {
      console.log('in assignmentClicked with index:' + $index);
      vm.selectedAssignment = vm.myAssignments[$index];
      vm.currentTab = 'current assignment';
      assignment.myLastLocation(vm.selectedAssignment)
        .success(function (data) {
          vm.exercise = data;
          $window.sessionStorage['selectedAssignment'] = vm.selectedAssignment;
        })
        .error(function (e) {
          console.log(e);
        })
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

    //####################################################################################
    //########## Exercise ###########
    //####################################################################################
    vm.exercise = {
      exe:{},
      level:'',
      subsubject:''
    };

   vm.LoadPrereq = function(){
      console.log("let's review prerequisites for this exe");
      vm.LoadSimilarExe(); // TBD, this needs to be changed to the final implementation
   };
   vm.LoadNextExe = function(){
      console.log('update progress with going up a level');
      var param = {};
      param.userId = $window.sessionStorage['userId'];
      param.subsubject = vm.exercise.subsubject;
      param.level = vm.exercise.level;
      param.assignmentId = $window.sessionStorage['selectedAssignment']
      
      audit.saveProgress(param);

      console.log('get next exe for the higher level');
      vm.exercise.level = vm.exercise.level+1;
      vm.LoadSimilarExe();
    };

    vm.LoadSimilarExe = function(){
       var param = {};
      param.userId = $window.sessionStorage['userId'];
      param.subsubject = vm.exercise.subsubject;
      param.level = vm.exercise.level;
     
      var config = {
        params: param,
      };
      console.log('calling similarExercise for level: ' + param.level);  
      exercise.similarExercise(config)
      .success(function (data) {
         console.log('---- Your next similarExercise is - : '+ JSON.stringify(data));
         // $location.path('student').search({param: data});
          if(data.exe == 'undefined'){
            console.log('NO MORE EXERCISES IN THIS LEVEL');
            vm.exercise.exe.body.type = "text";
            vm.exercise.exe.body.content = 'NOTHING TO SHOW';
          }else{
           vm.exercise.exe =data.exe;
          vm.exercise.level = data.level;
          vm.exercise.subsubject = data.subsubject;}
     })
     .error(function (e) {
          console.log(e);
        })
    };
    
    //####################################################################################
    //########## Solutions ###########
    //####################################################################################
    vm.currentSelection = undefined;
    vm.finalSelection = undefined;
    vm.correctAnswerNextStep = 'moreOfTheSame';
    vm.wrongAnswerNextStep = 'moreOfTheSame';
    
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
    
    $scope.$watch('vm.exercise.exe', function() {
        if(vm.exercise.exe.solutions != undefined) {
          vm.exercise.exe.solutions.shuffle();
        }
    });

    vm.checkAnswer = function () {
      vm.finalSelection = undefined;
      if(vm.currentSelection != undefined) {
        vm.finalSelection = (vm.exercise.exe.solutions[vm.currentSelection].isCorrect);
        
        console.log('vm.exercise ' + vm.exercise);
        
        // update audit with the results
        var param = {};
        param.userId = $window.sessionStorage['userId'];
        param.exeId = vm.exercise.exe._id;
        param.subsubject = vm.exercise.subsubject;
        param.level = vm.exercise.level;
        if(vm.finalSelection)
          param.outcome = 'success';
        else
          param.outcome = 'failure';
        console.log('calling auditExercise ' + JSON.stringify(param ));
        audit.auditExercise(param);
      }   
      else {
        console.log('No answer selected. Will ignore');
      }
      vm.currentSelection = undefined;
    }

    vm.handleRadioClick = function ($index) {
      console.log(vm.exercise.exe.solutions[$index].isCorrect);
      vm.finalSelection = undefined;
      vm.currentSelection = $index;
    };

    vm.correctAnswerNextStepClicked = function() {
      if(vm.correctAnswerNextStep == 'moreOfTheSame') {
        console.log('In studentCtrl.correctAnswerNextStep.if')
        vm.LoadSimilarExe();
      }
      else {
        if(vm.correctAnswerNextStep == 'readyForNextLevel') {
          console.log('In studentCtrl.correctAnswerNextStep.else.if')
          vm.LoadNextExe();
        }
        else {
          console.log('In studentCtrl.correctAnswerNextStep.else.else - Error state');          
        }
      }
      vm.correctAnswerNextStep = 'moreOfTheSame';
      vm.assistant = undefined;      
    }

    vm.wrongAnswerNextStepClicked = function() {
      if(vm.wrongAnswerNextStep == 'moreOfTheSame') {
        console.log('In studentCtrl.wrongAnswerNextStep.if')
        vm.LoadSimilarExe();
      }
      else {
        if(vm.wrongAnswerNextStep == 'preReq') {
          console.log('In studentCtrl.wrongAnswerNextStep.else.if')
          vm.LoadPrereq();
        }
        else {
          console.log('In studentCtrl.wrongAnswerNextStep.else.else - Error state');          
        }
      }
      vm.wrongAnswerNextStep = 'moreOfTheSame';
      vm.assistant = undefined;
    }
   
    //####################################################################################
    //########## Assistance ###########
    //####################################################################################    
    vm.assistant = undefined;
    vm.closeAssistance = function() {
      vm.assistant = undefined;
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
  }
})();