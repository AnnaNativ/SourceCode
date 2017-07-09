(function () {

  angular
    .module('meanApp')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', 'meanData'];
  function registerCtrl($location, authentication, meanData) {
    console.log('Register controller is running!!!');
    var vm = this;
    vm.formValid = true;
    
    vm.credentials = {
      name : "",
      email : "",
      password : "",
      verifyPassword : "",
      role: "",
      school: "",
      teacher: undefined
    };

    vm.selectedTeacher = "";
    vm.schools = [];
    
    meanData.getTeachersList()
    .success(function(data){
      vm.teachers = data;
    })
    .error(function(e){
      console.log(e);
    })

    meanData.getSchoolsList()
    .success(function(data){
      vm.schools = data;
    })
    .error(function(e){
      console.log(e);
    })

    vm.selectedSchool = "";

    vm.isTeacher = function() {
      return vm.credentials.role == "teacher";
    }

    vm.isStudent = function() {
      return vm.credentials.role == "student";
    }
    
    vm.submit = function (isValid) {
      console.log('Submitting registration');
      if (!isValid) {
        vm.formValid = false;
      }
      else {
        if(vm.credentials.role == 'teacher') {
          vm.credentials.school = vm.schools[vm.school]._id;
        }
        if(vm.credentials.role == 'student') {
          vm.credentials.teacher = vm.teachers[vm.teacher]._id;
        }
        authentication
          .register(vm.credentials)
          .error(function(err){
            alert(err);
          })
          .then(function(){
            $location.path('profile');
          });
      }
    };
  }

})();