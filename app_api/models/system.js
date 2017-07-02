var mongoose = require('mongoose');

var systemSchema = new mongoose.Schema({
  version: String,
  imagesLocation: String
},{ collection: 'system' });

mongoose.model('System', systemSchema);

