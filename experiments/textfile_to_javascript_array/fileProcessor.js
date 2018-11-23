var fs = require('fs'); 
var newFile = fs.createWriteStream('mostCommon.js', {
  flags: 'a' // 'a' means appending (old data will be preserved)
});

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('most_common_words.txt')
});

lineReader.on('line', function (line) {
  console.log('Line from file:', line);
  newFile.write("  '" + line + "',\n");
});