(function() {
  
  angular
    .module('meanApp')
    .controller('videosCtrl', videosCtrl);

  videosCtrl.$inject = ['$location', 'meanData'];
  
  function videosCtrl($location, meanData) {
    var vm = this;
    
    vm.subjects = {};
    vm.subSubjects = {};
    
    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
    })
    .error(function(e){
      console.log(e);
    })

    vm.subjectSelected = function() {
      vm.subSubject = undefined;
    }

    vm.subSubjectSelected = function() {
    }
  }

})();