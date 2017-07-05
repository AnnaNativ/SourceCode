(function() {
  
  angular
    .module('meanApp')
    .controller('teacherCtrl', teacherCtrl);

  teacherCtrl.$inject = ['$location', 'exercise', 'meanData', 'Upload', '$timeout'];
  function teacherCtrl($location, exercise, meanData, Upload, $timeout) {
    var vm = this;
    vm.formValid = true;
    vm.showAnswers = false;
    vm.subjects = {};
    vm.subSubjects = {};
    vm.levels = ['1 קל', '2', '3 בינוני', '4', '5 מתקדם', 'לא יודע'];
    vm.defaultLevel = 2;
    vm.exerciseSaved = false;

    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
      vm.subSubjects = [];
    })
    .error(function(e){
      console.log(e);
    })

    vm.newExercise = {
      level: undefined,
      body:[],
      solutions : [{solution: "", isCorrect: true}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}],
      subject: "",
      subSubject: ""
    };

    vm.addTextArea = function(){
      vm.exerciseSaved = false;
      vm.newExercise.body.push({type: 'text', content: '' });
    }

    vm.addAnswers = function(){
      vm.showAnswers = true;
    }

    vm.addPicture = function(){
      console.log('in teacher.controller addPicture:' + vm.picFile.content);
      vm.exerciseSaved = false;
      vm.newExercise.body.push({type: 'picture', content: vm.picFile});
    }

    vm.updateShowAnswersStatus = function() {
      if(vm.newExercise.body.length == 0) {
        vm.showAnswers = false;
      }
    }

    vm.removeTextArea = function(index){
      vm.newExercise.body.splice(index, 1);
      vm.updateShowAnswersStatus();
    }

    vm.removePicture = function(index){
      vm.newExercise.body.splice(index, 1);
      vm.updateShowAnswersStatus();
    }

     vm.subjectSelected = function() {
      meanData.getSubSubjects(vm.subjects[vm.subject]._id)
      .success(function(data){
        vm.subSubjects = data;
      })
      .error(function(e){
        console.log(e);
      })
    }

   vm.submit = function(isValid) {
      console.log('in teacher.controller onSubmit');
      if (!isValid) {
        vm.formValid = false;
      }
      else {
        // first, fill the missing data in the newExercise object
        vm.newExercise.subject = vm.subjects[vm.subject]._id;
        vm.newExercise.subSubject = vm.subSubjects[vm.subSubject]._id;
        if(vm.newExercise.level == (vm.levels.length - 1)) {
          vm.beforeSetToDefaultLevel = vm.newExercise.level;
          vm.newExercise.level = vm.defaultLevel;
        }
        
        vm.allPicSavedCallback = function() { 
              console.log('in in teacher.controller allPicSavedCallback');
              exercise
                .newExercise(vm.newExercise)
                .error(function(err){
                  alert("There was an error : " + err);
                })
              .then(function(){
                // forth, reset the page for the new exerciese
                console.log('in teacher.controller onSubmit.exercise.then.forEach.end');
                vm.newExercise.body = [];  
                vm.newExercise.solutions = [{solution: "", isCorrect: true}, 
                                            {solution: "", isCorrect: false}, 
                                            {solution: "", isCorrect: false}, 
                                            {solution: "", isCorrect: false}, 
                                            {solution: "", isCorrect: false}];
                // this is for the edge case where the "don't know level" was selected. We need to restore the original level.
                if(vm.beforeSetToDefaultLevel != undefined) {
                  vm.newExercise.level = vm.beforeSetToDefaultLevel;
                  vm.beforeSetToDefaultLevel = undefined;
                }
                vm.updateShowAnswersStatus();
                vm.exerciseSaved = true;
                vm.formValid = true;
              });
          }

        // first, upload all pictures to server 
        var itemsProcessed = 0;
        angular.forEach(vm.newExercise.body, function(fileObj, index, array) {
            console.log('in teacher.controller onSubmit.forEach.body');
            if(fileObj.type == 'picture') {
              fileObj.content.upload = Upload.upload({
                  url: '/api/upload',
                  method: 'POST',
                  data: {file: fileObj.content}
              });
              fileObj.content.upload.then(function (response) {
                  $timeout(function () {
                      console.log('in in teacher.controller onSubmit.forEach.body.upload.then.timeout with:' + response.data.filePath);
                      vm.newExercise.body[index].content = response.data.filePath;
                      itemsProcessed++;
                      console.log('in in teacher.controller onSubmit.forEach.body.upload.then.timeout.beforeIf with:' + itemsProcessed + ' and  array length: ' + array.length);
                      if(itemsProcessed === array.length) {
                        vm.allPicSavedCallback();
                      }
                  }, 100);
              }, function (response) {
                      console.log('in in teacher.controller onSubmit.forEach.body.upload.then.timeout.response with:' + response.data.filePath);
                  if (response.status > 0)  {
                      $scope.errorMsg = response.status + ': ' + response.data;
                  }
              }, function (evt) {
                  console.log('in in teacher.controller onSubmit.forEach.body.upload.then.timeout.evt with:' + evt.loaded);
                  fileObj.content.progress = Math.min(100, parseInt(100.0 * 
                                          evt.loaded / evt.total));
              });
            }
            else{
                itemsProcessed++;
                console.log('in in teacher.controller onSubmit.forEach.body.else with:' + itemsProcessed + ' and  array length: ' + array.length);
                if(itemsProcessed === array.length) {
                  vm.allPicSavedCallback();
                }            
            }
          });
      };
   }
  }
})();