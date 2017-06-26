var mongoose = require('mongoose');

var assignments = mongoose.model('Assignment');

module.exports.getMyAssignments = function(req, res)
{
   console.log('!!!!! getting assignments...' + req);
   assignments
      .find() //implement assigment per user
      .exec(function(err, data) {
        res.status(200).json(data);
        console.log('came back with '+data);
      });


  };
