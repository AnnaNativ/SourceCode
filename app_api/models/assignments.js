var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assignmentSchema = new mongoose.Schema({ 
    assigner: {type: Schema.Types.ObjectId, ref:'User'},
    assignee: {type: Schema.Types.ObjectId, ref:'User'},
    status: {type: String, enum: ['new', 'inprogress', 'failed', 'done'], default: 'new'},
    subjectId: {type: Schema.Types.ObjectId, ref:'Subject'},
    subsubjectId: {type: Schema.Types.ObjectId, ref:'SubSubject'},
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now},
});    

mongoose.model('Assignment', assignmentSchema);


