(function () {

  angular
    .module('meanApp')
    .service('assignment', assignment);

  assignment.$inject = ['$http'];
  function assignment ($http) {
  
    var myAssignments = function(user){
      // console.log('in myAssignments with userid ' + user._id);
      
      var congif = {
        params:user
      };
       return $http.get('/api/myAssignments', congif);
    };

    var myLastLocation = function(assignment){
       // console.log('in myLastLocation for assignment ' + JSON.stringify(assignment));
        var congif = {
          params:assignment
        };
        return $http.get('/api/myLastLocation', congif);
        
    };
    
    var newAssignment = function(assignment) {
      console.log("In assignment.newAssignment with: " + assignment);
      return $http.post('/api/assignment', assignment);
    };

  return {
      myAssignments: myAssignments,
      myLastLocation: myLastLocation,
      newAssignment: newAssignment
  };
  }
})();