const searcher = require("./api/SearchWrapper");

const sqlite3 = require('sqlite3').verbose();

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')

var fs = require('fs');

async function downloadMp3(url, filename) {

  const path = Path.resolve(__dirname, "image", filename)

  // axios image download with response type "stream"
  const response = await Axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  })

  // pipe the result stream into a file on disc
  response.data.pipe(Fs.createWriteStream(path))

  // return a promise and resolve when download finishes
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve()
    })

    response.data.on('error', () => {
      reject()
    })
  })

}

let db = new sqlite3.Database('./assets/sqlite-31-full-complete.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

db.serialize(() => {
  db.all(`SELECT * FROM words`, (err, rows) => {

    if (err) {
      console.error(err.message);
    }

    let index = 0;

    function searchFn(row) {

      console.log(`word: ${row.lemma}`);
/*
      if(row.meanings) {
        searchFn(rows[++index]);
        return;
      }
      */
/*
      if(row.lemma !== "abbreviate") {
        searchFn(rows[++index]);
      }
*/
      let _word = row.lemma;
      let _pos = row.pos;
      if(_pos === "noun") {
        searcher.searchImage(_word)
        .then((arr) => {
          
            if (!fs.existsSync(`./image/${row.lemma}.jpg`)) {
              console.log("dont have this jpg, try to download...");
              downloadMp3(arr[0], `${row.lemma}.jpg`);
            }
          searchFn(rows[++index]);
      ``})
        .catch((err) => {

/*
        console.log(err);
        _word = _word.replace("-", "%20");
        searcher.searchWikipedia(_word)
        .then((text) => {
          db.run(`UPDATE words SET meanings = (?) where lemma = (?)`,
                [text, row.lemma],
                () => {
                  console.log(`=== update ${row.lemma} complete ===`);
          });
          console.log("get " + _word + " success at wiki!");
          searchFn(rows[++index]);
        })
        .catch((err) => {
          console.log(err);
          if(err === "Not Found") {
            console.log(`${_word} not found?`);
            //setTimeout(searchFn(rows[index]), 3 * 1000);
            searchFn(rows[++index]);
          }
          else if(err === "Error") {
            setTimeout(searchFn(rows[index]), 3 * 60 * 1000);
          }
          searchFn(rows[++index]);
        });
        */
        searchFn(rows[index]);
      });
    }
    else {
      searchFn(rows[++index]);
    }
    }

    searchFn(rows[index]);

  });
});
