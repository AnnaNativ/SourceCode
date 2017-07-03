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

    var getVideos = function(videos) {
      console.log('In data.service getVideos');

      var config = {
        params: {videos: videos},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/videos', config);
    }

    var getSubSubjects = function(subject) {
      console.log('In data.service getSubSubjects');

      var config = {
        params: {subject: subject},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/subSubjects', config);
    }

    var getExercises = function(subSubject) {
      console.log('In data.service getExercises with subSubject: ' + subSubject);

      var config = {
        params: {subSubject: subSubject},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/exercises', config);
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
    
    var getSchoolsList = function() {
      console.log('In data.service getSchoolsList');
      return $http.get('/api/schoolsList', {});
    }
    
    return {
      getProfile : getProfile,
      getExercise: getExercise,
      getSubjects: getSubjects,
      getSubSubjects: getSubSubjects,
      getVideos: getVideos,
      getExercises: getExercises,
      getStudentsOfTeacher: getStudentsOfTeacher,
      getTeachersList: getTeachersList,
      getSchoolsList: getSchoolsList
    };
  }

})();