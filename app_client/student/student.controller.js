(function () {

  angular
    .module('meanApp')
    .controller('studentCtrl', studentCtrl);

  studentCtrl.$inject = ['$location', 'meanData'];
  function studentCtrl($location, meanData) {
    var vm = this;
    vm.currentSelection = false;
    vm.finalSelection = null;

    vm.exercise = {};


    vm.random = function() {
      return Math.round(Math.random() * vm.exercise.solutions.length);
    };

    meanData.getExercise()
      .success(function (data) {
        console.log("In student.controller getExercise with: " + data);
        vm.exercise = data;
        vm.exercise.solutions = vm.exercise.badSolutions;
        vm.exercise.solutions.splice(vm.random(), 0, vm.exercise.goodSolutions[0]);
      })
      .error(function (e) {
        console.log(e);
      });

    // check user's answer
    vm.checkAnswer = function () {
      console.log("in CheckAnswer with: " + vm.currentSelection);
      vm.finalSelection = (vm.currentSelection == vm.exercise.goodSolutions[0].solution);
    }

    vm.handleRadioClick = function (obj) {
      console.log(obj.solution);
      vm.finalSelection = null;
      vm.currentSelection = obj.solution;
    };
  }

})();