(function () {

  angular
    .module('meanApp')
    .service('audit', audit);

  audit.$inject = ['$http'];
  function audit ($http) {
  
    var auditExercise = function(param){
       
       return $http.post('/api/auditExercise', param).success(function(data){
           console.log('Back from auditExercise with '+ data);
       })
    };

    saveProgress
    var saveProgress = function(param){
       
       return $http.post('/api/saveProgress', param).success(function(data){
           console.log('Back from saveProgress with '+ data);
       })
    };

  return {
      auditExercise:auditExercise,
      saveProgress:saveProgress
  };
  }
})();