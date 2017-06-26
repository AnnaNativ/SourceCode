var mongoose = require( 'mongoose');
//var Schema = mongoose.Schema;

var assignmentSchema = new mongoose.Schema({ 
    //subSubject: {type: Schema.Types.ObjectId, ref: 'SubSubject'}
    subsubjectId: String
    });    

mongoose.model('Assignment', assignmentSchema);
