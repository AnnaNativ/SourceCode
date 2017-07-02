var mongoose = require('mongoose');
// BRING IN YOUR SCHEMAS & MODELS
require('./users');
require('./exercises');
require('./subjects');
require('./subSubjects');
require('./system');
require('./assignments');
require('./audit');

require('./videos');
var System = mongoose.model('System');

var gracefulShutdown;
module.exports.systemConfig = {
  
};
var dbURI = 'mongodb://localhost/meanAuth';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
  // Get system data from the db
  System.find({}, function(err, systemData){
    if (err) {
      throw err;
    }
    systemConfig = systemData[0];
    console.log('Using verison: ' + systemData[0].version);
    console.log('Pictures location: ' + systemData[0].imagesLocation);
  });
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app termination', function() {
    process.exit(0);
  });
});


