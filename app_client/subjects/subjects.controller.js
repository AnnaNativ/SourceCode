(function() {
  
  angular
    .module('meanApp')
    .controller('subjectsCtrl', subjectsCtrl);

  subjectsCtrl.$inject = ['$location', 'subject', 'meanData'];
  
  function subjectsCtrl($location, subject, meanData) {
    var vm = this;
    
    vm.subjects = {};
    vm.subSubjects = {};
    vm.videos = {};
    vm.exercises = {};
    vm.schoolGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    vm.levels = ['1', '2', '3', '4', '5'];
    
    vm.newSubject = {};
    vm.newSubSubject = {};
    vm.newSubjectAdded = false; 
    vm.newSubSubjectAdded = false; 


    meanData.getSubjects()
    .success(function(data){
      vm.subjects = data;
      vm.subSubjects = [];
    })
    .error(function(e){
      console.log(e);
    })

    vm.addNewSubject = function() {
      subject
        .newSubject(vm.newSubject)
        .error(function(err){
          alert("There was an error : " + err);
        })
        .success(function(data){
          console.log('in subjects.controller addNewSubject.success');
          vm.subjects.push(data);
          // set the add subject successful message
          vm.newSubjectAdded = true; 
          vm.cancelNewSubject();
        })
        .then(function(){
          console.log('in subjects.controller addNewSubject.then');
          vm.cancelNewSubject();
       });    
    }

    vm.addNewSubSubject = function() {
      vm.newSubSubject.subjectId = vm.subjects[vm.subject]._id;
      subject
        .newSubSubject(vm.newSubSubject)
        .error(function(err){
          alert("There was an error : " + err);
        })
        .success(function(data){
          console.log('in subjects.controller addNewSubSubject.success');
          vm.subSubjects.push(data);
          // set the add subject successful message
          vm.newSubSubjectAdded = true; 
          vm.cancelNewSubSubject();
        })
        .then(function(){
          console.log('in subjects.controller addNewSubject.then');
          vm.cancelNewSubject();
       });
    }

    vm.addSubjectClicked = function() {
      vm.addingSubject = true;
      // clrer the add subject successful message
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
    }

    vm.addSubSubjectClicked = function() {
      vm.addingSubSubject = true;
      // clrer the add subject successful message
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
    }

    vm.cancelNewSubject = function() {
      vm.newSubject = {};
      vm.addingSubject = false;
    }

    vm.cancelNewSubSubject = function() {
      vm.newSubSubject = {};
      vm.addingSubSubject = false;
    }

    vm.getVideos = function() {
      var videos = vm.subSubjects[vm.subSubject].sample_videos;
      videos.push(vm.subSubjects[vm.subSubject].tutorial_video);
      meanData.getVideos(videos)
      .success(function(data){
        vm.videos = data;
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.getExercises = function() {
      meanData.getExercises(vm.subSubjects[vm.subSubject]._id)
      .success(function(data){
        vm.exercises = data;
      })
      .error(function(e){
        console.log(e);
      })
    }
    
    vm.subjectSelected = function() {
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
      vm.subSubject = undefined;
      vm.exercise = undefined;
      // clrear the add subject successful message
      vm.newSubjectAdded = false; 
      meanData.getSubSubjects(vm.subjects[vm.subject]._id)
      .success(function(data){
        vm.subSubjects = data;
      })
      .error(function(e){
        console.log(e);
      })
    }

    vm.subSubjectSelected = function() {
      vm.newSubjectAdded = false; 
      vm.newSubSubjectAdded = false; 
      vm.exercise = undefined;
      console.log('In SubjectSelected');
      if(vm.subject >= 0 && vm.subSubject >= 0) {
        vm.getVideos();
        vm.getExercises();       
      } 
    }
  }

})();