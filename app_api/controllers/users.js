var mongoose = require('mongoose');
var user = mongoose.model('User');

module.exports.teachers = function(req, res)
{
 console.log('getting teachers for: '+ req.body.name);
   var query = '{role:"teacher"},{school:'+ req.body.name +'}';
    user
       .find({$and:[{school:req.body.name},{role:'teacher'}]})
      .exec(function(err, teachers) {
         res.status(200).json(teachers);
        });
    };