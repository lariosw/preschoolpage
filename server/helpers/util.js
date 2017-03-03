/**
 * Created by Marvin on 2/20/17.
 */
var fs = require('fs');
var path = require('path');

module.exports.getDirectoryFiles = function(directory, nameOnly){
  var files = fs.readdirSync(directory);
  var formattedFiles = [];
    for(var i=0; i<files.length;i++){
      if(files[i].indexOf('.') == 0) continue; //skip hidden files
      formattedFiles.push(nameOnly ? files[i].substring(0, files[i].indexOf('.')) : files[i]);
    }
  return formattedFiles;
};

module.exports.ensureDirectoryExists = function(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  module.exports.ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
};

module.exports.deleteFile = function(filePath){
  fs.unlink(filePath, function(){});
}

module.exports.foreach = function(arrayToLoop, callback) {
  for(var i=0; i< arrayToLoop.length;i++){
    callback(arrayToLoop[i], i);
  }
};

module.exports.arrayDiff = function(array1, array2, startsWithMatch){
  var diff = [];
  for(var i=0; i< array1.length; i++){
    diff.push(array1[i]);
    for(var x=0; x< array2.length; x++){
      if((startsWithMatch && (array1[i].indexOf(array2[x]) == 0 || array2[x].indexOf(array1[i]) == 0)) || array1[i] == array2[x]){
        diff.pop(array1[i]);
        continue;
      }
    }
  }
  return diff;
};

module.exports.arrayIntersect = function(array1, array2, startsWithMatch){
  var intersect = [];
  for(var i=0; i< array1.length; i++){
    for(var x=0; x< array2.length; x++){
      if((startsWithMatch && (array1[i].indexOf(array2[x]) == 0 || array2[x].indexOf(array1[i]) == 0)) || array1[i] == array2[x]){
        intersect.push(array1[i]);
        continue;
      }
    }
  }
  return intersect;
};
