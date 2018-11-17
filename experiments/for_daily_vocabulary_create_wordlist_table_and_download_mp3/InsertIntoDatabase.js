const sqlite3 = require('sqlite3').verbose();

const Path = require('path')
const Axios = require('axios')

var fs = require('fs');

var readLineSync = function(filename){
  var lines = fs.readFileSync(filename, 'utf-8')
                .split('\r\n')
                .filter(Boolean);
  return lines;
};

var wordList = readLineSync("most_common_words.txt");
console.log(wordList);

let db = new sqlite3.Database('wordlist.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

for(var i = 0; i < wordList.length; i++) {

  let word = wordList[i];

  db.serialize(() => {
    db.run(`INSERT INTO words (lemma) VALUES (?)`,[word], (err, rows) => {

      if (err) {
        console.error(err);
      }
      else {
        console.log(`insert ${word}`);
      }

    });
  });

}
