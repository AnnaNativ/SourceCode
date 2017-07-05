var mongoose = require( 'mongoose');
var Schema = mongoose.Schema;

var auditSchema = new mongoose.Schema({ 
    type:{type: String, required: true, enum: ['exercise', 'nextlevel','needhelp']},
    userId:{type: Schema.Types.ObjectId, ref: 'exercises'},
    level:Number,
    exerciseId:{type: Schema.Types.ObjectId, ref: 'exercises'},
    subsubjectId:{type: Schema.Types.ObjectId, ref: 'subsubjects'},
    publishDate: {type: Date, default: Date.now},
    outcome:{type: String, enum: ['success', 'failure','needhelp']}
    },{ collection: 'userAudit' });    

mongoose.model('UserAudit', auditSchema);


