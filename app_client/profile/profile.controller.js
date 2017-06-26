(function() {
  
  angular
    .module('meanApp')
    .controller('profileCtrl', profileCtrl);

  profileCtrl.$inject = ['$location', 'meanData','assignment'];
  function profileCtrl($location, meanData,assignment) {
    //profileCtrl.$inject = ['$location', 'meanData'];
    //function profileCtrl($location, meanData) {
    var vm = this;

    vm.user = {};
    
    vm.isTeacher = function() {
      return (vm.user.role == "teacher");
    }
    vm.isStudent = function() {
      return (vm.user.role == "student");
    }

    vm.getMyAssignments = function(){
        assignment.myAssignments(vm.user)
        .success(function(assignments){
          console.log('Returned with Assignments: '+ assignments)
    })
    .error(function(e){
      console.log(e);
    })
    };

    meanData.getProfile()
      .success(function(data) {
        vm.user = data;
       // console.log('Got user profile ' + JSON.stringify(data));
      })
      .error(function (e) {
        console.log(e);
      });
  }

})();