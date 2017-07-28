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

    var getNextExercise = function(assignmentId, currentExerciseId, currentExerciseOutcome, levelChange) {
      var config = {
        params: {assignmentId: assignmentId, 
                 currentExerciseId: currentExerciseId, 
                 currentExerciseOutcome: currentExerciseOutcome,
                 levelChange: levelChange},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };
      return $http.get('/api/nextExercise', config);
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
      console.log('In data.service getVideos with: ' + videos);

      var config = {
        params: {videos: videos},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/videos', config);
    }

    var getVideo = function(video) {
      console.log('In data.service getVideo with: ' + video);

      var config = {
        params: {video: video},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/video', config);
    }

    var getSubSubjects = function(subject) {
      console.log('In data.service getSubSubjects');

      var config = {
        params: {subject: subject},
        headers : {Authorization: 'Bearer '+ authentication.getToken()}
      };

      return $http.get('/api/subSubjects', config);
    }

    var getExercises = function(subSubject, level) {
      console.log('In data.service getExercises with subSubject: ' + subSubject + ' and level: ' + level);

      var config = {
        params: {subSubject: subSubject, level: level},
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

    var getAssignmentsOfTeacher = function() {
      console.log('In data.service getAssignmentsOfTeacher');
      return $http.get('/api/assignmentsOfTeacher', {
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
      getNextExercise: getNextExercise,
      getSubjects: getSubjects,
      getSubSubjects: getSubSubjects,
      getVideo: getVideo,
      getVideos: getVideos,
      getExercises: getExercises,
      getStudentsOfTeacher: getStudentsOfTeacher,
      getAssignmentsOfTeacher: getAssignmentsOfTeacher,
      getTeachersList: getTeachersList,
      getSchoolsList: getSchoolsList
    };
  }

})();