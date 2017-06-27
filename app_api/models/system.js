var mongoose = require('mongoose');

var systemSchema = new mongoose.Schema({
  version: String,
  imagesLocation: String
});

mongoose.model('System', systemSchema, 'system');

