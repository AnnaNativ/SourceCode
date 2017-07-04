(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', '$routeParams', 'meanData','$window','audit'];
  function studentCtrl($location, $routeParams, meanData,$window,audit) {
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
      
      console.log('vm.exercise.level ' + vm.exercise.level);
       
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

    vm.LoadNextExe = function(){
      console.log('Loading next exe.');
    }

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