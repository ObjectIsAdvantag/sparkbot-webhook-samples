/*
 * Extract commics info
 *
 
<div class="comic-item-container js_comic_container_2016-09-01" itemtype="http://schema.org/CreativeWork" accountableperson="Universal Uclick" creator="Scott Adams" data-itemtype="" data-id="2016-09-01" data-url="http://dilbert.com/strip/2016-09-01" data-image="http://assets.amuniversal.com/55b5ae6045360134a486005056a9545d" data-date="September 01, 2016" data-creator="Scott Adams" data-title="Tell Me What Was In The Email" data-tags="email,laziness,attention,detail,tldr" data-description="Boss: I don't have time to read your long email. Tell me what it said. Dilbert: I wrote a long email because a summary would be dangerously misleading. Boss: I'll be the judge of that. Dilbert: How?!!!">
  <div class="meta-info-container">
*/

var http = require("http");
var htmlparser = require("htmlparser2");

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");


// Extracts the dilbert strip data from URL
function extract(html, cb) {
  var found = false;
  var parser = new htmlparser.Parser({
    onopentag: function (tagname, attribs) {
      if (!found && (tagname === "div")) {
        fine("opening brace name: " + tagname + ", with args: " + JSON.stringify(attribs));

        var currentClass = attribs["class"];
        if (currentClass && currentClass.startsWith("comic-item-container")) {
          debug("found dilbert zone: " + tagname + ", with args: " + JSON.stringify(attribs));
          found = true;

          if (!attribs) {
            cb(new Error("empty tag", null));
            return;
          }
          var url = attribs["data-url"];
          var image = attribs["data-image"];
          if (!url || !url) {
            cb(new Error("could not read contents", null));
            return;
          }

          cb(null, { "url": url, "image": image });
          return;
        }
      }
    }
  }, { decodeEntities: true });
  parser.parseComplete(html);
}


// Returns date in YYYY-MM-DD format
function toYYYMMDD(date) {
  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + "-" + month + "-" + day;
}


// Returns false if specified date is not in a valid range
function checkRange(date) {
  // TODO : not implemented yet
  return true;
}


module.exports.stripForDay = function (day, cb) {
  
  // Robustify: check date if valid
  if (day) {
    // YYYY-MM-DD format
    var ok = day.match(/^(\d{4})[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
    if (!ok) {
      debug("not valid date format YYYY-MM-DD for: " + day);
      cb(new Error("not valid date format YYYY-MM-DD for: " + day), null);
      return;
    }

    if (!checkRange(ok)) {
      debug("specified date does not comply to dilbert range: " + day);
      cb(new Error("date: " + day + " does not comply with Dilbert Strip range: "), null);
      return;
    }
  }
  else {
    // Invoke Dilbert strip for today
    day = toYYYMMDD(new Date());
  }
  
  // Parse img from Dilbert strip
  http.get("http://dilbert.com/strip/" + day, function (response) {

    var data = "";
    response.on('data', function (chunk) {
      data += chunk;
    });

    response.on('end', function (chunk) {

      extract(data, function (err, dilbert) {
        if (err) {
          debug("could not extract data from: " + url);
          cb("could not extract data from: " + url, null);
          return;
        }

        debug("found: " + JSON.stringify(dilbert));
        cb(null, dilbert);
      });
    });
  });

};



