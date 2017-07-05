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
    
    var similarExercise = function(params) {
      console.log("In exercise.service similarExercise with: " + JSON.stringify(params));
      return $http.get('/api/similarExercise', params).success(function(data){
        console.log('!!!!!loading new exe '+ data);
      });
    };
    

    return {
      newExercise : newExercise,
      similarExercise:similarExercise
    };
  }


})();