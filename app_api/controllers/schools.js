var mongoose = require('mongoose');

var Schools = mongoose.model('schools');

module.exports.schools = function(req, res)
{
   Schools
      .find()
      .exec(function(err, schools) {
        res.status(200).json(schools);
      });
  };


