(function() {
  
  angular
    .module('meanApp')
    .controller('teacherCtrl', teacherCtrl);

  teacherCtrl.$inject = ['$location', 'exercise', 'meanData'];
  function teacherCtrl($location, exercise, meanData) {
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

    vm.newExercise = {
      solutions : [{solution: ""}, {solution: ""}, {solution: ""}, {solution: ""}, {solution: ""}],
      exercise : "",
      subject: "",
      subSubject: ""
    };

    vm.onSubmit = function () {
      vm.newExercise.subject = vm.subjects[vm.subject]._id;
      vm.newExercise.subSubject = vm.subjects[vm.subject].subSubjects[vm.subSubject]._id;
      console.log('Submitting new exercise with: ' + vm.newExercise._id);
      exercise
        .newExercise(vm.newExercise)
        .error(function(err){
          alert("There was an error : " + err);
        })
        .then(function(){
          $location.path('profile');
        });
    };
  }
})();