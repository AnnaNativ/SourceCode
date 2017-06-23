(function() {

  angular
    .module('meanApp')
    .service('meanData', meanData);

  meanData.$inject = ['$http', 'authentication'];
  function meanData ($http, authentication) {

    var getProfile = function() {
      return $http.get('/api/profile', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }
      });
    };

    var getExercise = function() {
      return $http.get('/api/exercise', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }
      });
    };

    var getSubjects = function() {
      console.log('In data.service getSubjects');
      return $http.get('/api/subjects', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }        
      });
    }

    var getExercisesForSubjectAndSubSubject = function(subject, subSubject) {
      console.log('In data.service getExercisesForSubjectAndSubSubject with subject: ' + subject + ' and sub subject: ' + subSubject);
      var data = {
          subject: subject,
          subSubject: subSubject
      };

      var config = {
        params: data,
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/exercisesForSubjectAndSubSubject', config);
    }

    var getStudentsOfTeacher = function() {
      console.log('In data.service getStudentsOfTeacher');
      return $http.get('/api/studentsOfTeacher', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }        
      });
    }
    var getTeachersList = function() {
      console.log('In data.service getTeachersList');
      return $http.get('/api/teachersList', {});
    }
    
    return {
      getProfile : getProfile,
      getExercise: getExercise,
      getSubjects: getSubjects,
      getExercisesForSubjectAndSubSubject: getExercisesForSubjectAndSubSubject,
      getStudentsOfTeacher: getStudentsOfTeacher,
      getTeachersList: getTeachersList
    };
  }

})();