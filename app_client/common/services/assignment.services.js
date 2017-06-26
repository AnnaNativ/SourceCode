(function () {

  angular
    .module('meanApp')
    .service('assignment', assignment);

  assignment.$inject = ['$http'];
  function assignment ($http) {
  
    var myAssignments = function(user){
       console.log('in myAssignments with userid ' + user._id);
      //ToDo need to implement something more secure
       return $http.get('/api/myAssignments', user._id)
      .success(function(data){
        console.log('back from myAssignments');
        return data;
      }); 
    };
    return {
      myAssignments:myAssignments
    };
  }
})();