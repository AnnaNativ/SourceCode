(function () {

  angular
    .module('meanApp')
    .controller('navigationCtrl', navigationCtrl);

  navigationCtrl.$inject = ['$location','authentication', 'meanData'];
  function navigationCtrl($location, authentication, meanData) {
    var vm = this;

    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentUser = authentication.currentUser();

    meanData.getProfile()
    .success(function (data) {
      vm.role = data.role;
    })
  }

})();