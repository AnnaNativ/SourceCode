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

  return {
      auditExercise:auditExercise
  };
  }
})();