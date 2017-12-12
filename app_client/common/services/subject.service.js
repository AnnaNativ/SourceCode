(function () {

  angular
    .module('meanApp')
    .service('subject', subject);

  subject.$inject = ['$http', '$window'];
  function subject($http, $window) {  

    var newSubject = function(subject) {
      console.log("In subject.service newSubject with: " + subject);
      return $http.post('/api/subject', subject);
    };

    var newSubSubject = function(subSubject) {
      console.log("In subject.service newSubSubject with: " + subSubject);
      return $http.post('/api/subSubject', subSubject);
    };

    var removeSubSubject = function(subSubject) {
      console.log("In subject.service removeSubSubject with: " + subSubject);
      return $http.post('/api/removeSubSubject', subSubject);
    };

    return {
      newSubject: newSubject,
      newSubSubject: newSubSubject,
      removeSubSubject: removeSubSubject
    };
  }


})();