var mongoose = require( 'mongoose');
var Schema = mongoose.Schema;

var auditSchema = new mongoose.Schema({ 
    type:{type: String, required: true, enum: ['exercise', 'nextlevel','needhelp']},
    userId:{type: Schema.Types.ObjectId, ref: 'users'},
    level:Number,
    exerciseId:{type: Schema.Types.ObjectId, ref: 'exercises'},
    subsubjectId:{type: Schema.Types.ObjectId, ref: 'subsubjects'},
    createdDate: {type: Date, default: Date.now},
    outcome:{type: String, enum: ['success', 'failure','needhelp']}
    },{ collection: 'userAudit' });    

mongoose.model('UserAudit', auditSchema);

var progressSchema = new mongoose.Schema({ 
    userId:{type: Schema.Types.ObjectId, ref: 'users'},
    level:{type: Number, default:0},
    subsubjectId:{type: Schema.Types.ObjectId, ref: 'subsubjects'},
    assignmentId:{type: Schema.Types.ObjectId, ref: 'assignments'},
    createdDate: {type: Date, default: Date.now},
    isDone: {type: Boolean, default:false}
    },{ collection: 'userProgress' });    

mongoose.model('userProgress', progressSchema);


