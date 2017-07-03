(function () {

  angular
    .module('meanApp')
    .controller('profileCtrl', profileCtrl);

  profileCtrl.$inject = ['$location', 'meanData', 'assignment'];
  function profileCtrl($location, meanData, assignment) {

    var vm = this;

    vm.user = {};
    vm.myAssignments;
    vm.selectedAssignment;
    vm.myProgress;
    vm.isInOriginalSubject = true;

    vm.isTeacher = function () {
      return (vm.user.role == "teacher");
    }
    vm.isStudent = function () {
      return (vm.user.role == "student");
    }

    meanData.getProfile()
      .success(function (data) {
        vm.user = data;
        //console.log('Got user profile ' + JSON.stringify(data));
        console.log('about to call for assignment for user ' + vm.user.name);
        assignment.myAssignments(vm.user)
          .success(function (data) {
            console.log('got back with ' + data.length + ' assignments');
            vm.myAssignments = data;
          })
          .error(function (e) {
            console.log(e);
          });

      })
      .error(function (e) {
        console.log(e);
      });

    vm.lastLocation = function () {
      console.log('checking where you left it of in your previous session: ' + vm.selectedAssignment);
      assignment.myLastLocation(vm.selectedAssignment)
        .success(function (data) {
          $location.path('profile');

        })
        .error(function (e) {
          console.log(e);
        })
  };

  vm.myInitialSubSubject = function () {
    console.log('Going to load an exercise from the initial subject');
  };


}

})();