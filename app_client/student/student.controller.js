(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', '$routeParams', 'meanData','$window','audit','exercise', 'assignment'];
  function studentCtrl($location, $routeParams, meanData, $window, audit, exercise, assignment) {
    var vm = this;
    console.log('Init studentCtrl');
    vm.currentTab = 'assignments';
    vm.currentSelection = false;
    vm.finalSelection = null;
    vm.subjectVideoOn = false;
    vm.solutionVideoOn = false;
    vm.exercise = {
      exe:{},
      level:'',
      subsubject:''
    };
    vm.myAssignments;
  
//    vm.exercise.exe =$routeParams.param.exe;
//    vm.exercise.level = $routeParams.param.level;
//    vm.exercise.subsubject = $routeParams.param.subsubject;
    

    //vm.exercise = $routeParams.config.exe;
    //vm.selectedAssignment = $routeParams.config.selectedAssignment;

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
//          $window.sessionStorage['selectedAssignment'] = vm.selectedAssignment;
//          $location.path('student').search({param: data});
        })
        .error(function (e) {
          console.log(e);
        })
    }

    vm.random = function() {
      return Math.round(Math.random() * vm.exercise.solutions.length);
    };

    // check user's answer
    vm.checkAnswer = function () {
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
    
    
   vm.LoadPrereq = function(){
      console.log("let's review prerequisites for this exe");
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

    vm.closeVideos = function() {
      vm.subjectVideoOn = false;
      vm.solutionVideoOn = false;
    }

    vm.handleRadioClick = function ($index) {
      console.log(vm.exercise.exe.solutions[$index].isCorrect);
      vm.finalSelection = null;
      vm.currentSelection = $index;
    };
  }

})();