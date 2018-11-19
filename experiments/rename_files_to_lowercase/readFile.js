var fs = require('fs');

var walkSync = function(dir) {
  var files = fs.readdirSync(dir);
  var filelist = [];
  files.forEach(function(file) {
    filelist.push(file);
  });
  return filelist;
};

var path = "./mp3/";

var mp3List = walkSync(path);
console.log(mp3List);

mp3List.map(function(item) {
  var newFileName = item.toLowerCase();
  newFileName = newFileName.replace(/ /g, '_'); 
  newFileName = newFileName.replace(/,/g, ''); 
  newFileName = newFileName.replace(/-/g, '_'); 
  fs.rename(path + item, path + newFileName, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  });
});
