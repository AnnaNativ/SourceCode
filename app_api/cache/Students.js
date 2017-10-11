var HashMap = require('hashmap');

function Students() {
    this.students = new HashMap();

    this.add = function(student) {
        this.students.set(student.id, student);
        console.log(JSON.stringify(this.students));
    }

    this.get = function(studentId) {
        return this.students.get(studentId.toString());
    }
};

module.exports.Student = function(id) {
    this.id = id.toString();
    this.assignments = new HashMap();
    this.doneExercises = new HashMap();

    this.addDoneExercise = function(exercise) {
        if(exercise) {
            this.doneExercises.set(exercise.toString(), true);
        }
        else {
            console.log('Error - exercise undefined');   
        }
    }

    this.addAssignment = function(assignment) {
        var assignmentID = assignment.getId();
        if(assignmentID != undefined) {
            this.assignments.set(assignmentID, assignment);
        }
        else {
            console.log('Error - assignmentID undefined');
        }
    }

    this.getAssignment = function(assignmentId) {
        return this.assignments.get(assignmentId.toString());
    }

    this.isExerciseDone = function(exerciseId) {
        return (this.doneExercises.get(exerciseId.toString()) != undefined);
    }

    this.isDoneExerciseEmpty = function() {
        return (this.doneExercises.count() == 0);
    }

    this.getExerciseDoneCount = function() {
        return this.doneExercises.count();
    }

};

module.exports.Assignment = function(assignment) {
    this.REQUIRED_SEQUENTIAL_HITS = 4;
    this.MIN_SUCCESSFUL_EXERCISES_PERCENTAGE = 0.6;
    this.assignment = assignment;
    this.userProgressHistory = [];
    this.sequencialHits = 0;
    this.maxSequencialHits = 0;
    this.groupId = null;
    this.groupBody = [];
    this.nextExercise = null;
    this.updatedDate = null;
    this.levelsSuccessCounter = new HashMap();
    this.exerciseCount = 0;
    this.successfulExerciseCount = 0;
    this.leftExerciseCount = 0;

    this.addUserProgress = function(userProgress) {
        this.userProgressHistory.push(userProgress);
    }

    this.getId = function() {
        if(this.assignment._id != undefined) {
            return this.assignment._id.toString();
        }
        return undefined;
    }
    
    this.getCurrentExerciseLevel = function() {
        return this.userProgressHistory[this.userProgressHistory.length - 1].level;
    }

    this.getCurrentSubSubjectId = function() {
        return this.userProgressHistory[this.userProgressHistory.length - 1].subsubjectId;
    }
    
    this.getOriginalSubSubjectId = function() {
        return this.assignment.subsubjectId;
    }

    this.getOriginalSubSubjectLastLevel = function() {
        var originalSubSubject = this.getOriginalSubSubjectId().toString();
        var currentSubSubject;
        for(var i=this.userProgressHistory.length - 1; i>=0; i--) {
            currentSubSubject = this.userProgressHistory[i].subsubjectId.toString();
            if(currentSubSubject == originalSubSubject) {
                return this.userProgressHistory[i].level;
            }
        }
    }

    this.inOriginalSubSubject = function() {
        return this.getCurrentSubSubjectId() == this.getOriginalSubSubjectId();
    }

    this.isNew = function() {
        return (this.assignment.status == 'new');
    }

    this.setInProgress = function() {
        this.assignment.status = 'inprogress';
    }
    
    this.getLeftExerciseCount = function() {
        return this.leftExerciseCount;      
    }

    this.updateSuccsessfulExercise = function(level) {
        this.incrementSequencialHits();
        this.successfulExerciseCount++;
        var counter = this.levelsSuccessCounter.get(level);
        if(counter == undefined) {
            counter = 0;
        }
        counter++;
        this.levelsSuccessCounter.set(level, counter);
    }

    this.updateUnsuccsessfulExercise = function(level) {
        this.resetSequencialHits();
    }

    this.incrementSequencialHits = function() {
        this.sequencialHits++;
        if(this.maxSequencialHits < this.sequencialHits) {
            this.maxSequencialHits = this.sequencialHits;
        }
    }

    this.getMaxSequencialHits = function() {
        return this.maxSequencialHits;
    }

    this.getCurrentSequencialHits = function() {
        return this.sequencialHits;
    }

    this.resetSequencialHits = function() {
        this.sequencialHits = 0;
    }

    this.resetMaxSequencialHits = function() {
        this.sequencialHits = 0;
        this.maxSequencialHits = 0;
        this.successfulExerciseCount = 0;
    }

    this.getGroupId = function() {
        return this.groupId;
    }

    this.setGroupId = function(groupId) {
        this.groupId = groupId;
    }

    this.setGroupBody = function(body) {
        this.groupBody = [];
        for(var i=0; i<body.length; i++) {
            this.groupBody.push({type: body[i].type, content: body[i].content});
        }
    }

    this.getGroupBody = function() {
        return this.groupBody;
    }

    this.getNextExercise = function() {
        return this.nextExercise;
    }

    this.setNextExercise = function(nextExercise) {
        this.nextExercise = nextExercise;
    }

    this.updateDateStatus = function(date) {
        this.updatedDate = date;
    }

    this.setExerciseCount = function(exercises) {
        this.exerciseCount = 0;
        for(var i=0; i<exercises.length; i++) {
            if(exercises[i].groupId == undefined || exercises[i].groupId.toString() != exercises[i].Id.toString()) {
                this.exerciseCount++;
            }
        }
    }

    this.getExerciseCount = function() {
        return this.exerciseCount;
    }

    this.getCurrentGrade = function() {
        return this.successfulExerciseCount / this.exerciseCount;
    }

    this.canGoToNextLevel = function() {
        if(this.exerciseCount == 0 || !this.inOriginalSubSubject()) {
            return true;
        }
        return this.maxSequencialHits >= this.REQUIRED_SEQUENTIAL_HITS || this.getCurrentGrade() >= this.MIN_SUCCESSFUL_EXERCISES_PERCENTAGE;
    }

};

module.exports.students = new Students();
