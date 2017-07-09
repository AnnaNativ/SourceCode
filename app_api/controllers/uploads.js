require('./../models/db');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var getDirName = require('path').dirname;

module.exports.uploadPic = function (req, res) {
  console.log('In uploads.js uploadPic');
  var file = req.files.file;
  console.log(file.name);
  console.log(file.type);
  console.log(file.path);
  fs.readFile(req.files.file.path, function (err, data) {
    var d = new Date();
    // set the correct path for the file not the temporary one from the API:
    file.path = systemConfig.imagesLocation + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getTime() + "/" + file.name;
    mkdirp(getDirName(file.path), function (err) {
      if (err){
        return cb(err);
      } 
      // copy the data from the req.files.file.path and paste it to file.path
      fs.writeFile(file.path, data, function (err) {
        if (err) {
          return console.warn(err);
        }
        console.log("The file: " + file.name + " was saved to " + file.path);
        res.status(200);
        fileUrl = file.path.replace(systemConfig.imagesLocation, 'http://localhost:3000/images/')
        res.json({
          filePath: fileUrl
        });
      });
    });

  });
};

