(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', '$routeParams', 'meanData','$window','audit','exercise'];
  function studentCtrl($location, $routeParams, meanData,$window,audit,exercise) {
    var vm = this;
    vm.currentSelection = false;
    vm.finalSelection = null;
    vm.subjectVideoOn = false;
    vm.solutionVideoOn = false;
    vm.exercise = {
      exe:{},
      level:'',
      subsubject:''
    };
    
    vm.exercise.exe =$routeParams.param.exe;
    vm.exercise.level = $routeParams.param.level;
    vm.exercise.subsubject = $routeParams.param.subsubject;
    

    //vm.exercise = $routeParams.config.exe;
    //vm.selectedAssignment = $routeParams.config.selectedAssignment;


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