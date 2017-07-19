var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schoolGrades = new Schema({
    schoolGrade: {type: String, required: true, enum: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב']},
    maxGrade: {type: Number, default: 5}
},{ _id : false });

var schoolsSchema = new mongoose.Schema({
    name: String,
    classes:[schoolGrades],
});

mongoose.model('School', schoolsSchema);
mongoose.model('SchoolGrades', schoolGrades);

