(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$scope', '$location', 'meanData','$window','audit','exercise', 'assignment', '$sce'];
  function studentCtrl($scope, $location, meanData, $window, audit, exercise, assignment, $sce) {
    var vm = this;
    console.log('Init studentCtrl');
    vm.currentTab = 'assignments';
    vm.currentSelection = undefined;
    vm.finalSelection = undefined;
    vm.assistent = undefined;
    vm.correctAnswerNextStep = 'moreOfTheSame';
    vm.wrongAnswerNextStep = 'moreOfTheSame';
    vm.exercise = {
      exe:{},
      level:'',
      subsubject:''
    };
    vm.myAssignments;
  
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
//          console.log('Your next exe is: '+ JSON.stringify(data));
          $window.sessionStorage['selectedAssignment'] = vm.selectedAssignment;
//          $location.path('student').search({param: data});
        })
        .error(function (e) {
          console.log(e);
        })
    }

    // check user's answer
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

    vm.closeAssistence = function() {
      vm.assistent = undefined;
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
      vm.assistent = undefined;      
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
      vm.assistent = undefined;
    }

    vm.getTutorialVideo = function() {
      meanData.getVideo(vm.selectedAssignment.subSubject[0].tutorial_video)
      .success(function(data){
        vm.assistent = 'tutorial';
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
        vm.assistent = 'sample_solution';
        vm.sampleSolutionVideoLink =  $sce.trustAsResourceUrl(data[0].link);
        console.log('In getSampleSolutionVideo.success with: ' + data);
      })
      .error(function(e){
        console.log(e);
      })
    }  
  }

})();