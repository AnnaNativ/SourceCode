(function () {

  angular
    .module('meanApp')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication', 'meanData'];
  function registerCtrl($location, authentication, meanData) {
    console.log('Register controller is running!!!');
    var vm = this;

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
    vm.schools = ["Gutman","eldad"];
    
    meanData.getTeachersList()
    .success(function(data){
      vm.teachers = data;
    })
    .error(function(e){
      console.log(e);
    })

    vm.selectedSchool = "";

    vm.teacherSelected = function() {
      console.log("In teacherSelected with: " + vm.selectedTeacher);
      vm.credentials.teacher = vm.selectedTeacher._id;
    }

    vm.isTeacher = function() {
      return vm.credentials.role == "teacher";
    }

    vm.isStudent = function() {
      return vm.credentials.role == "student";
    }
    
    vm.onSubmit = function () {
      console.log('Submitting registration');
      authentication
        .register(vm.credentials)
        .error(function(err){
          alert(err);
        })
        .then(function(){
          $location.path('profile');
        });
    };

  }

})();