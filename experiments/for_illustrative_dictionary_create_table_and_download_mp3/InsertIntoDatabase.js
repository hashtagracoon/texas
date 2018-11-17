const searcher = require("./api/SearchWrapper");

const sqlite3 = require('sqlite3').verbose();

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')

var fs = require('fs');

async function downloadMp3(url, filename) {

  const path = Path.resolve(__dirname, "mp3", filename)

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
      searcher.searchCambridge(_word)
      .then((arr) => {
        for(let i=0;i<arr.length;i++) {

          //const lemma = arr[i].title;

          const pos = arr[i].pos;
          console.log(pos);
          /*
          const gram = arr[i].gram;
          const pron = arr[i].pron;
          let meanings = "";
          let examples = "";
          for(let j=0;j<arr[i].meanings.length;j++) {
            meanings += arr[i].meanings[j].meaning + "|||";
            for(let k=0;k<arr[i].meanings[j].egs.length;k++) {
              if(k >= 2) break;
              examples += arr[i].meanings[j].egs[k] + "###";
            }
            examples += "|||";
          }
          */
/*
          console.log(`${i}, ${arr[i].title}, ${pos}, ${gram}, ${pron}, ${meanings}, ${examples}`);

          if(i === 0) {
            //console.log(`UPDATE words SET pos = '${pos}', gram = '${gram}', pron = '${pron}', meanings = '${meanings}', examples = '${examples}' where lemma = '${row.lemma}'`);
            db.run(`UPDATE words SET pos = (?), gram = (?), pron = (?), meanings = (?), examples = (?) where lemma = (?)`,
                   [pos, gram, pron, meanings, examples, row.lemma],
                   () => { console.log(`=== update ${row.lemma} complete ===`); }
            );
          }
          else {
            db.run(`INSERT INTO words VALUES ((?), (?), (?), (?), (?), (?))`,
                  [row.lemma, pos, gram, pron, meanings, examples],
                  () => {
                    console.log(`=== insert ${row.lemma} complete ===`);
            });
          }
*/
          if (!fs.existsSync(`./__mp3__/${row.lemma}_${pos}.mp3`)) {
            console.log("dont have this mp3, try to download...");
            if(arr[i].mp3) {
              downloadMp3("http://dictionary.cambridge.org" + arr[i].mp3, `${row.lemma}_${pos}.mp3`);
            }
          }
        }
        searchFn(rows[++index]);
      })
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
        searchFn(rows[++index]);
      });
    }

    searchFn(rows[index]);

  });
});
