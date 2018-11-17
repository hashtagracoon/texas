const dictionaryParser = require("./DictionaryParser");
const imageParser = require("./ImageParser");
const fetch = require("node-fetch");
/*
if (typeof fetch !== 'function') {
  global.fetch = require('node-fetch');
}*/

const _debug = true;
const logger = (output) => {
  if(_debug) console.log(output);
  else return;
};

module.exports = {

  searchCambridge: function(word) {

    return new Promise((resolve, reject) => {

      logger("*** search at cambridge ***");

      let url = "https://dictionary.cambridge.org/dictionary/english/" + word;
      logger(url);

      fetch(url).then((response) => {
        return response.text();
      })
      .then((text) => {

        let searchResultArray = dictionaryParser.parseCambridgeDictionary(text);

        if(searchResultArray.length === 0) {
          logger("Unable to find this word at cambridge");
          reject("Not Found");
        }
        else {
          logger("Get Search Result from cambridge: ")
          logger(searchResultArray);
          resolve(searchResultArray);
        }
      })
      .catch((err) => {
        logger("search word from cambridge error: " + err);
        reject("Error");
      });

    });

  },

  searchWikipedia: function(word) {

    return new Promise((resolve, reject) => {

      logger("*** search at wiki ***");

      const url = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" +
                  word +
                  "&limit=1&namespace=0&format=json";

      logger(url);

      fetch(url).then((response) => {
        return response.json();
      })
      .then((json) => {
        // content summary (text, string)
        if(json[2][0]) {
          logger("Get Search Result from wiki: ")
          logger(json[2][0]);
          resolve(json[2][0]);
        }
        else {
          logger("Unable to find this word at wiki");
          reject("Not Found");
        }
      })
      .catch((err) => {
        logger("search wiki error: " + err);
        reject("Error");
      });

    });

  },

  searchImage: function(word) {

    return new Promise(async (resolve, reject) => {

      // Don't use google image anymore
      //let imageUrl = "https://www.google.com.tw/search?q=" + word + "&tbm=isch";
      // Use Bing image
      const _word = word.replace(" ", "%20");
      let imageUrl = "https://www.bing.com/images/search?q=" + _word;
      logger(imageUrl);

      fetch(imageUrl).then((response) => {
        return response.text();
      })
      .then((text) => {

        let searchImageArray = imageParser.parseBingImage(text);

        if(searchImageArray.length === 0) {
          logger("Unable to find this image");
          reject("Not Found");
        }
        else {
          logger("Get Image Result:")
          logger(searchImageArray);
          resolve(searchImageArray);
        }

      })
      .catch((err) => {
        logger(err);
        reject("Not Found");
      });

    });

  }

};
