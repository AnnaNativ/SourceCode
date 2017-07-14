(function () {

  angular
  .module('meanApp')
  .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$location', 'authentication', 'meanData'];
  function loginCtrl($location, authentication, meanData) {
    console.log('Login controller is running!!!');
    var vm = this;
    vm.formValid = true;
    vm.passwordValid = true;

    vm.credentials = {
      email : "",
      password : ""
    };

    vm.submit = function(isValid) {
      if (!isValid) {
        vm.formValid = false;
      }
      else {
        authentication
          .login(vm.credentials)
          .error(function(err){
            vm.formValid = true;
            vm.passwordValid = false;
          })
          .then(function(){
            meanData.getProfile()
              .success(function (data) {
                if(data.role == "student") {
                  console.log('in submit if');
                  $location.path('/student').search({tab: 'assignments'});
                }
                else {
                  console.log('in submit else');
                  $location.path('/teacher').search({tab: 'assignments'});   
                }
              })
              .error(function (e) {
                console.log(e);
              });
          });
      };
    }
  }

})();