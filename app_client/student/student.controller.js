(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', '$routeParams', 'meanData'];
  function studentCtrl($location, $routeParams, meanData) {
    var vm = this;
    vm.currentSelection = false;
    vm.finalSelection = null;
    vm.subjectVideoOn = false;
    vm.solutionVideoOn = false;

    vm.exercise = $routeParams.param[0];


    vm.random = function() {
      return Math.round(Math.random() * vm.exercise.solutions.length);
    };

    // check user's answer
    vm.checkAnswer = function () {
      console.log("in CheckAnswer with: " + vm.currentSelection);
      vm.finalSelection = (vm.exercise.solutions[vm.currentSelection].isCorrect);
    }

    vm.closeVideos = function() {
      vm.subjectVideoOn = false;
      vm.solutionVideoOn = false;
    }

    vm.handleRadioClick = function ($index) {
      console.log(vm.exercise.solutions[$index].isCorrect);
      vm.finalSelection = null;
      vm.currentSelection = $index;
    };
  }

})();