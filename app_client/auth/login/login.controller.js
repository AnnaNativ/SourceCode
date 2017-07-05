(function () {

  angular
  .module('meanApp')
  .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$location', 'authentication'];
  function loginCtrl($location, authentication) {
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
            $location.path('profile');
          });
      };
    }
  }

})();