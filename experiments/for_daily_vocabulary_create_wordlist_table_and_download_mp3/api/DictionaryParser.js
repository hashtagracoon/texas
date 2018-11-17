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
  },
  
  parseWebster: function(body) {
  
	  let $ = cheerio.load(body);

	  let titleArray = [];
	  $('.row.entry-header .hword').each(function(i, elem) {
		  //console.log($(this).text());
      titleArray.push($(this).text());
    });

    let posArray = [];
    $('.row.entry-header span.fl a.important-blue-link').each(function(i, elem) {
      //console.log($(this).text());
      posArray.push($(this).text());
    });

    let pronArray = [];
    $('span.prs span.pr').not(':has(span)').each(function(i, elem) {
      if($(this).prev().text() === '\\') {
        //console.log($(this).text());
        pronArray.push($(this).text());
      }
    });

    let mp3Array = [];
    $('a.play-pron.hw-play-pron').each(function(i, elem) {
      let data_lang = $(this).attr('data-lang').split('_');
      let data_file = $(this).attr('data-file');
      let data_dir = $(this).attr('data-dir');
      mp3Array.push(`https://media.merriam-webster.com/audio/prons/${data_lang[0]}/${data_lang[1]}/mp3/${data_dir}/${data_file}.mp3`);
      //console.log(mp3Array[mp3Array.length - 1]);
    });

    let meaningsArray = [];
    const limitLength = 2;
    for(let i = 1; i <= limitLength; i++) {
      // each entry-1, entry-2 is a different pos (verb, noun...)
      // each .sb is a different meaning
      //console.log('+++++++++++++++++++++++++++++++');
      let meanings = [];
      $(`#dictionary-entry-${i} .vg .sb`).each(function(i, elem) {
        for(let j = 0; j < limitLength; j++) {
          //console.log(`<${j}>`);
          // each .sb-0, .sb-1 is a different sub-meaning
          let entry = $(this).find(`span.sb-${j}`).find('span .dtText').first().text();
          entry = entry.split('\n');
          entry = entry[0];
          if(entry.startsWith(': ')) entry = entry.slice(2);
          //console.log('meaning: ' + entry);
      
          let example = $(this).find(`span.sb-${j} .ex-sent`).text();
          //console.log('example: ' + example);

          if(entry) {
            meanings.push({meaning: entry, egs: [example]});
          }

          //console.log('=======');
        }
      });

      if(meanings.length) {
        meaningsArray.push(meanings);
      }

    }

    let entries = [];
    for(let i = 0; i < meaningsArray.length; i++) {
      entries.push({
        title: titleArray[i],
        pron: pronArray[i],
        mp3: mp3Array[i],
        pos: posArray[i],
        gram: null,
        meanings: meaningsArray[i]
      });
    }

    return entries;

  }
  
};
