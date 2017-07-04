(function () {

  angular
    .module('meanApp')
    .controller('profileCtrl', profileCtrl);

  profileCtrl.$inject = ['$location', 'meanData', 'assignment','$window'];
  function profileCtrl($location, meanData, assignment,$window) {

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

        //save in session
        $window.sessionStorage['userId'] = vm.user._id;
        console.log('Got user profile ' + JSON.stringify(vm.user._id));
        console.log(' $window.sessionStorage["userId"] ' +  $window.sessionStorage['userId']);
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
      //console.log('checking where you left it of in your previous session: ' + JSON.stringify(vm.selectedAssignment));
      assignment.myLastLocation(vm.selectedAssignment)
        .success(function (data) {
          //console.log('Came  back from myLastLocation ' + JSON.stringify(vm.selectedAssignment))
          //var config ={
          //  'exe': data,
          //  'selectedAssignment':vm.selectedAssignment
          //}
          console.log('Your next exe is: '+ JSON.stringify(data));
          $location.path('student').search({param: data});

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