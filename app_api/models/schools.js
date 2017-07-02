//var mongoose = require( './db' );
var mongoose = require('mongoose');

var schoolsSchema = new mongoose.Schema({name:String});

mongoose.model('School', schoolsSchema);

