(function () {

  angular
  .module('meanApp')
  .controller('logoutCtrl', logoutCtrl);

  logoutCtrl.$inject = ['$location', 'authentication'];
  function logoutCtrl($location, authentication) {
    console.log('Logout controller is running!!!');
    var vm = this;
    authentication.logout();
  }

})();