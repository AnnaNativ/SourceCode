(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', 'meanData'];
  function studentCtrl($location, meanData) {
    var vm = this;
    vm.currentSelection = false;
    vm.finalSelection = null;
    vm.subjectVideoOn = false;
    vm.solutionVideoOn = false;

    vm.exercise = {};


    vm.random = function() {
      return Math.round(Math.random() * vm.exercise.solutions.length);
    };

    meanData.getExercise()
      .success(function (data) {
        console.log("In student.controller getExercise with: " + data);
        vm.exercise = data;
      })
      .error(function (e) {
        console.log(e);
      });

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