var mongoose = require( 'mongoose');

var auditSchema = new mongoose.Schema({ 
    //subSubject: {type: Schema.Types.ObjectId, ref: 'SubSubject'}
    exerciseId: []
    },{ collection: 'userAudit' });    

mongoose.model('UserAudit', auditSchema);


