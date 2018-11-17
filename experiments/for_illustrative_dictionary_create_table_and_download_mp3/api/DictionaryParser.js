const cheerio = require("cheerio-without-node-native");

const _debug = true;
const logger = (output) => {
  if(_debug) console.log(output);
  else return;
};

module.exports = {

  parseCambridgeDictionary: function(body) {

    let $ = cheerio.load(body);

    try {
      // If have this word
      $ = cheerio.load($(".entry-body").first().html());
    }
    catch(err) {
      // If donn't have this word
      logger(err);
      return [];
    }

    let entries = [];
    $(".entry-body__el").each(function(i, elem) {

      let obj = {};

      // Get the word
      let title = $(this).find(".headword .hw").html();
      // If it isn't a word, it could be a phrase
      if(!title) title = $(this).find(".headword .phrase").html();
      obj.title = title;


      // Get KK pronuciation
      let pron = "";
      let tempPron = "";
      $(this).find(".pron .ipa").each(function(i, elem) {
        // Sometimes there's no US pron
        if(i === 0) {
          tempPron = $(this).text();
        }
        // Only take one (US) pron
        if(i === 1) {
          pron = $(this).text();
        }
      });
      // If there's no US pron, use the temp (UK) pron
      if(pron === "") obj.pron = tempPron;
      else obj.pron = pron;

      // Get pronuciation source mp3 url
      let mp3;
      $(this).find(".audio_play_button").each(function(i, elem) {
        // Only take one (US) mp3
        if(i === 1) {
          mp3 = $(this).attr("data-src-mp3");
          obj.mp3 = mp3;
        }
      });

      // Get pos (V, N, adj...)
      let pos = $(this).find("span.pos").first().text();
      obj.pos = pos;

      // Get gram (countable, uncountable...)
      let gram = $(this).find("span.gram").first().text();
      obj.gram = gram;

      // Get meanings array
      obj.meanings = [];
      $(this).find(".sense-body").each(function(j, elem) {
        let meaning = $(this).find("b.def").first().text().trim();
        let meaningObj = {
          "meaning": meaning,
          "egs": []
        };

        // Get examples array
        $(this).find("span.eg").each(function(k, elem) {
          let eg = $(this).text();
          meaningObj.egs.push(eg);
        });

        obj.meanings.push(meaningObj);

      });

      entries.push(obj);
    });

    // Check and remove invalid part
    if(entries.length > 0) {
      for(let i = entries.length - 1;i >= 0;i--) {
        if(entries[i].title === null) {
          entries.splice(i, 1);
        }
      }
    }

    // Check dulplicate part
    let posArray = [];
    let index = 0;
    for(let i = 0;i < entries.length;i++) {
      if(posArray.includes(entries[i].pos)) {
        index = i;
        break;
      }
      else posArray.push(entries[i].pos);
    }
    // Remove dulplicate part
    if(index !== 0) {
      for(let i = entries.length - 1;i >= index;i--) {
        entries.splice(i, 1);
      }
    }

    return entries;
  }
  
};
