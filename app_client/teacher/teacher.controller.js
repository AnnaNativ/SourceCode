(function() {
  
  angular
    .module('meanApp')
    .controller('teacherCtrl', teacherCtrl);

  teacherCtrl.$inject = ['$location', '$routeParams', 'exercise', 'meanData', 'Upload', '$timeout', 'subject', 'assignment'];
  function teacherCtrl($location, $routeParams, exercise, meanData, Upload, $timeout, subject, assignment) {
    //####################################################################################
    //########## Teacher ###########
    //####################################################################################

    var vm = this;
    vm.formValid = true;
    vm.currentTab = 'assignments';
    vm.user = {};

    meanData.getProfile()
      .success(function (data) {
        vm.user = data;
      })
      .error(function (e) {
        console.log(e);
      });

    //####################################################################################
    //########## Students ###########
    //####################################################################################

    vm.selectedStudents = [];
    vm.students = [];
    vm.transclusionSettings = { };
		vm.studentSelectionTexts = {
				checkAll: 'בחר הכל',
				uncheckAll: 'בטל הכל',
				selectionCount: '- תלמידים שנבחרו למשימה',
				selectionOf: '/',
				searchPlaceholder: 'Search...',
				buttonDefaultText: 'בחר תלמידים להוסיף למשימה',
				dynamicButtonTextSuffix: '- תלמידים שנבחרו למשימה',
				disableSearch: 'Disable search',
				enableSearch: 'Enable search',
				selectGroup: 'Select all:',
				allSelectedText: 'All'
			};
    
    //####################################################################################
    //########## Subjects ###########
    //####################################################################################

    vm.subjects = {};
    vm.schoolLevels = ['1', '2', '3', '4', '5'];
    vm.schoolGrades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'י"א', 'י"ב'];
    vm.newSubject = {};
    vm.newSubjectAdded = false; 
    vm.addSubjectFormValid = true;

    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
      vm.subSubjects = [];
    })
    .error(function(e){
      console.log(e);
    })

    vm.addNewSubject = function() {
      if(vm.newSubject.name == undefined || vm.newSubject.name.length == 0 || 
        !(vm.newSubject.schoolGrade >= 0) || !(vm.newSubject.level >= 0)) {
        vm.addSubjectFormValid = false;
      }
      else {
        subject
          .newSubject(vm.newSubject)
          .error(function(err){
            alert("There was an error : " + err);
          })
          .success(function(data){
            console.log('in subjects.controller addNewSubject.success');
            vm.subjects.push(data);
            vm.subject = vm.subjects.length - 1;
            vm.subSubject = undefined;
            vm.newExercise.level = undefined;
            vm.subSubjects = [];
            // set the add subject successful message
            vm.newSubjectAdded = true; 
            vm.cancelNewSubject();
          })
          .then(function(){
            console.log('in subjects.controller addNewSubject.then');
        });  
      }  
    }

    vm.addSubjectClicked = function() {
      vm.addingSubject = true;
      // clrer the add subject successful message
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
      vm.newExerciseAdded = false; 
    }

    vm.cancelNewSubject = function() {
      vm.newSubject = {};
      vm.addingSubject = false;
      vm.addSubjectFormValid = true;
    }

     vm.subjectSelected = function() {
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
      vm.newExerciseAdded = false; 
      vm.subSubject = undefined;
      vm.exercise = undefined;
      // clrear the add subject successful message
      vm.newSubjectAdded = false; 
      meanData.getSubSubjects(vm.subjects[vm.subject]._id)
      .success(function(data){
        vm.subSubjects = data;
        vm.level = undefined;
        vm.exercises = [];
      })
      .error(function(e){
        console.log(e);
      })
    }

    //####################################################################################
    //########## Sub Subjects ###########
    //####################################################################################

    vm.subSubjects = {};
    vm.newSubSubject = {};
    vm.newSubSubjectAdded = false; 
    vm.addSubSubjectFormValid = true;

    vm.addNewSubSubject = function() {
      if(vm.newSubSubject.name == undefined || vm.newSubSubject.name.length == 0) {
        vm.addSubSubjectFormValid = false;
      }
      else {
        vm.newSubSubject.subjectId = vm.subjects[vm.subject]._id;
        subject
          .newSubSubject(vm.newSubSubject)
          .error(function(err){
            alert("There was an error : " + err);
          })
          .success(function(data){
            console.log('in subjects.controller addNewSubSubject.success');
            vm.subSubjects.push(data);
            vm.subSubject = vm.subSubjects.length - 1;
            vm.newExercise.level = undefined;          
            // set the add sub subject successful message
            vm.newSubSubjectAdded = true; 
            vm.cancelNewSubSubject();
          })
          .then(function(){
            console.log('in subjects.controller addNewSubject.then');
        });
      }
    }

    vm.addSubSubjectClicked = function() {
      vm.addingSubSubject = true;
      // clrer the add subject successful message
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
      vm.newExerciseAdded = false; 
    }

    vm.cancelNewSubSubject = function() {
      vm.newSubSubject = {};
      vm.addingSubSubject = false;
      vm.addSubSubjectFormValid = true;
    }

    vm.subSubjectSelected = function() {
      if(vm.currentTab == 'data') {
        vm.newSubjectAdded = false; 
        vm.newSubSubjectAdded = false; 
        vm.newExerciseAdded = false; 
        vm.exercise = undefined;
        vm.level = undefined;
      }
    }
    
    //####################################################################################
    //########## Levels ###########
    //####################################################################################

    vm.levels = ['1 קל', '2', '3 בינוני', '4', '5 מתקדם', 'לא יודע'];
    vm.defaultLevel = 2;

    vm.levelSelected = function() {
      console.log('In levelSelected');
      if(vm.subject >= 0 && vm.subSubject >= 0) {
        vm.getExercises();       
      } 
    }

    //####################################################################################
    //########## Schools ###########
    //####################################################################################

    vm.schools = [];

    meanData.getSchoolsList()
    .success(function(data){
      vm.schools = data;
    })
    .error(function(e){
      console.log(e);
    })

    //####################################################################################
    //########## Exercises ###########
    //####################################################################################

    vm.newExerciseAdded = false;

    vm.newExercise = {
      level: undefined,
      body:[],
      solutionPicture: [],
      solutions : [{solution: "", isCorrect: true}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}, 
                   {solution: "", isCorrect: false}],
      subject: "",
      subSubject: ""
    };

    vm.addExerciseClicked = function() {
      console.log('in subjects.controller addExerciseClicked');
      vm.addingExercise = true;
      vm.newExerciseAdded = false;
      // clrer the add subject successful message
    }

    vm.cancelNewExercise = function() {
      vm.newExercise.body = [];
      vm.newExercise.solutionPicture = [];
      vm.newExercise.solutions = [{solution: "", isCorrect: true}, 
                                  {solution: "", isCorrect: false}, 
                                  {solution: "", isCorrect: false}, 
                                  {solution: "", isCorrect: false}, 
                                  {solution: "", isCorrect: false}];
      vm.updateShowAnswersStatus();
      vm.formValid = true;
      vm.addingExercise = false;
    }

    vm.getExercises = function() {
      meanData.getExercises(vm.subSubjects[vm.subSubject]._id, vm.level)
      .success(function(data){
        vm.exercises = data;
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.addTextArea = function(){
      vm.newExerciseAdded = false;
      vm.answerType = "closed";
      vm.newExercise.body.push({type: 'text', content: '' });
    }

    vm.addPicture = function(){
      console.log('in teacher.controller addPicture:' + vm.picFile.content);
      vm.newExerciseAdded = false;
      vm.answerType = "closed";
      vm.newExercise.body.push({type: 'picture', content: vm.picFile});
    }

    vm.removeTextArea = function(index){
      vm.newExercise.body.splice(index, 1);
      vm.updateShowAnswersStatus();
    }

    vm.removePicture = function(index){
      vm.newExercise.body.splice(index, 1);
      vm.updateShowAnswersStatus();
    }

    vm.addNewExercise = function() {
      console.log('in teacher.controller onSubmit');
      if (vm.newExercise.body.length == 0 || 
          vm.newExercise.solutions[0].solution.length == 0 || 
          (vm.answerType == 'closed') && (vm.newExercise.solutions[1].solution.length == 0)) {
        vm.formValid = false;
      }
      else {
        // first, fill the missing data in the newExercise object
        vm.newExercise.subject = vm.subjects[vm.subject]._id;
        vm.newExercise.subSubject = vm.subSubjects[vm.subSubject]._id;
        if(vm.newExercise.level != (vm.levels.length - 1)) {
          vm.newExercise.level = vm.level;
        }
        else {
          vm.newExercise.level = vm.defaultLevel;
        }
        // now remove the empty answers from the exercise
        var solutions = [];
        for(var i=0; i<vm.newExercise.solutions.length; i++) {
          if(vm.newExercise.solutions[i].solution.length > 0) {
            solutions.push(vm.newExercise.solutions[i]);
          }
        }
        vm.newExercise.solutions = solutions;
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

                vm.cancelNewExercise();
                vm.exercises = {};
                vm.levelSelected();
                vm.newExerciseAdded = true;
              });
          }

        // first, upload all pictures to server 
        var itemsProcessed = 0;
        // if we have a solution picture, lets add it to the body for uploading the picture.
        if(vm.newExercise.solutionPicture.length > 0) {
          vm.newExercise.body.push(vm.newExercise.solutionPicture[0]);
        }
        angular.forEach(vm.newExercise.body, function(fileObj, index, array) {
            console.log('in teacher.controller onSubmit.forEach.body');
            if(fileObj.type == 'picture' || fileObj.type == 'solutionPicture') {
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

    //####################################################################################
    //########## Answers ###########
    //####################################################################################

    vm.showAnswers = false;
    vm.answerType = "closed";

    vm.addAnswers = function(){
      vm.showAnswers = true;
    }

    vm.addSolutionPicture = function(){
      vm.newExercise.solutionPicture.push({type: 'solutionPicture', content: vm.solutionPicFile});
    }

    vm.updateShowAnswersStatus = function() {
      if(vm.newExercise.body.length == 0) {
        vm.showAnswers = false;
      }
    }

    vm.removeSolutionPicture = function() {
      vm.solutionPicFile = undefined;
      vm.newExercise.solutionPicture = [];
    }

    vm.openAnswerClicked = function() {
      for(var i=1; i<vm.newExercise.solutions.length; i++) {
        vm.newExercise.solutions[i] = {solution: "", isCorrect: false};
      }
    }

    //####################################################################################
    //########## Assignments ###########
    //####################################################################################

    vm.newAssignmentAdded = false; 


    vm.loadAssignments = function() {
      meanData.getAssignmentsOfTeacher()
      .success(function(data){
        vm.assignments = data;
      })
      .error(function(e){
        console.log(e);
      })      
    }
    
    vm.loadAssignments();

    vm.addAssignment = function() {
      assignment
        .newAssignment({assigner: vm.user._id,
                        assignee: vm.selectedStudents,
                        subjectId: vm.subjects[vm.subject]._id,
                        subsubjectId: vm.subSubjects[vm.subSubject]._id})
        .error(function(err){
          alert("There was an error : " + err);
        })
        .success(function(data){
          console.log('in teacher.controller addAssignment.success');
          vm.cancelAssignment();
          vm.newAssignmentAdded = true;
          vm.loadAssignments();
        });
    }

    vm.cancelAssignment = function() {
      console.log('in cancelAssignment');
      vm.schoolGrade = undefined;
      vm.selectedStudents = [];
      vm.subject = undefined;
      vm.subSubject = undefined;
    } 

    //####################################################################################
    //########## School Grade ###########
    //####################################################################################

    vm.schoolGradeSelected = function() {
      console.log('In schoolGradeSelected');
      vm.newAssignmentAdded = false;
      meanData.getStudentsOfTeacher()
      .success(function(data){
        vm.students = [];
        data.forEach(function (item) {
          vm.students.push({id: item._id, label: item.name});
        });
      })
      .error(function(e){
        console.log(e);
      })      
    }
  }
})();