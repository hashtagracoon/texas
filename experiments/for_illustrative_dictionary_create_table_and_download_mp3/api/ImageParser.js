const cheerio = require("cheerio-without-node-native");

const _debug = true;
const logger = (output) => {
  if(_debug) console.log(output);
  else return;
};

module.exports = {

  parseGoogleImage: function(body) {
    const $ = cheerio.load(body);
    //logger(body);
    let arr = [];
    // Only get 3 images
    $("div a img").slice(0, 3).each(function(i, elem) {
      arr.push($(this).attr("src"));
    });
    logger(arr);
    return arr;
  },

  parseBingImage: function(body) {
    const $ = cheerio.load(body);
    //logger(body);
    let arr = [];
    // Only get 3 images
    $("div.content div.row div.item a.thumb").slice(0, 3).each(function(i, elem) {
      arr.push($(this).attr("href"));
    });
    logger(arr);
    return arr;
  }
};
