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

};

module.exports.Assignment = function(assignment) {
    this.assignment = assignment;
    this.userProgressHistory = [];
    this.sequencialHits = 0;

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

    this.getSubSubject = function() {
        return assignment.subsubjectId;
    }

    this.isNew = function() {
        return (this.assignment.status == 'new');
    }

    this.setInProgress = function() {
        this.assignment.status = 'inprogress';
    }

    this.incrementSequencialHits = function() {
        this.sequencialHits++;
    }

    this.getSequencialHits = function() {
        return this.sequencialHits;
    }

    this.resetSequencialHits = function() {
        this.sequencialHits = 0;
    }
};

module.exports.students = new Students();
