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
      console.log("In exercise.service newExercise with: " + exercise.subSubject);
      return $http.post('/api/exercise', exercise).success(function(data){
        saveExercise(data);
      });
    };
    
    var removeExercise = function(exercise) {
      console.log("In exercise.service removeExercise with: " + exercise);
      return $http.post('/api/removeExercise', exercise);
    };
    

    return {
      newExercise : newExercise,
      removeExercise: removeExercise
    };
  }


})();