(function () {

  angular
    .module('meanApp')
    .service('exercise', exercise);

  exercise.$inject = ['$http', '$window'];
  function exercise ($http, $window) {
   
    var saveExercise = function (data) {
      console.log("In exercise.service saveExercise with: " + data);
    };

    var newExercise = function(exercise) {
      console.log("In exercise.service newExercise with: " + exercise);
      return $http.post('/api/exercise', exercise).success(function(data){
        saveExercise(data);
      });
    };

    return {
      newExercise : newExercise
    };
  }


})();