const searcher = require("./api/SearchWrapper");

const sqlite3 = require('sqlite3').verbose();

let words = [];

let db = new sqlite3.Database('./assets/sqlite-31.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

db.serialize(() => {
  db.all(`SELECT lemma as word FROM words`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }

    console.log(rows.length);

    let index = 33556;
    let removed = 0;
    function searchFn(row) {

      console.log("@@@ index = " + index + ", removed = " + removed);

      if(index >= rows.length) {
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Close the database connection.');
        });
        throw new Error("Finish!!!");
      }

      let _word = row.word;
      searcher.searchCambridge(_word)
      .then((arr) => {
        console.log("get " + _word + " success at cambridge!");
        searchFn(rows[++index]);
      })
      .catch((err) => {
        _word = _word.replace("-", "%20");
        searcher.searchWikipedia(_word)
        .then((text) => {
          console.log("get " + _word + " success at wiki!");
          searchFn(rows[++index]);
        })
        .catch((err) => {
          console.log(err);
          if(err === "Not Found") {
            db.exec(`DELETE FROM words WHERE lemma = "` + row.word + `"`, () => {
              console.log("=================== " + row.word + " has been removed ===================");
              removed++;
            });
          }
          else if(err === "Error") {
            setTimeout(searchFn(rows[index]), 3 * 60 * 1000);
          }
          searchFn(rows[++index]);
        });
      });
    };

    searchFn(rows[index]);

  });
});
