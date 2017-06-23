(function() {
  
  angular
    .module('meanApp')
    .controller('subjectsCtrl', subjectsCtrl);

  subjectsCtrl.$inject = ['$location', 'meanData'];
  
  function subjectsCtrl($location, meanData) {
    var vm = this;
    
    vm.students = {};
    vm.subjects = {};
    vm.subSubjects = {};
    vm.exercises = {};
    
    meanData.getStudentsOfTeacher()
    .success(function(data){
      vm.students = data;
    })
    .error(function(e){
      console.log(e);
    })

    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
    })
    .error(function(e){
      console.log(e);
    })

    vm.studentSelected = function() {
      vm.subject = undefined;
      vm.subSubject = undefined;
      vm.exercise = undefined;
    }

    vm.subjectSelected = function() {
      vm.subSubject = undefined;
      vm.exercise = undefined;
    }

    vm.subSubjectSelected = function() {
      vm.exercise = undefined;
      console.log('In SubjectSelected');
      if(vm.subject >= 0 && vm.subSubject >= 0) {
        meanData.getExercisesForSubjectAndSubSubject(vm.subjects[vm.subject]._id, 
                                                    vm.subjects[vm.subject].subSubjects[vm.subSubject]._id)
        .success(function(data){
          vm.exercises = data;
        })
        .error(function(e){
          console.log(e);
        })
      } 
    }
  }

})();