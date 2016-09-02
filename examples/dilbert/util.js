/*
 * Extract commics info
 *
 
<div class="comic-item-container js_comic_container_2016-09-01" itemtype="http://schema.org/CreativeWork" accountableperson="Universal Uclick" creator="Scott Adams" data-itemtype="" data-id="2016-09-01" data-url="http://dilbert.com/strip/2016-09-01" data-image="http://assets.amuniversal.com/55b5ae6045360134a486005056a9545d" data-date="September 01, 2016" data-creator="Scott Adams" data-title="Tell Me What Was In The Email" data-tags="email,laziness,attention,detail,tldr" data-description="Boss: I don't have time to read your long email. Tell me what it said. Dilbert: I wrote a long email because a summary would be dangerously misleading. Boss: I'll be the judge of that. Dilbert: How?!!!">
  <div class="meta-info-container">
*/

var http = require("http");
var htmlparser = require("htmlparser2");

var debug = require("debug")("dilbert");
var fine = require("debug")("dilbert:fine");


// Extract the dilbert tag from URL
function extractDilbertTag(html, cb) {
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


module.exports.dilbertForDay = function (day, cb) {
  // Check day format
  var ok = day.match(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
  if (!ok) {
    debug("not valid date format YYYY-MM-DD for: " + day);
    cb(new Error("not valid date format YYYY-MM-DD for: " + day), null);
    return;
  }
  // [TODO] check date is not in future

  // Parse img from Dilbert strip
  http.get("http://dilbert.com/strip/" + day, function (response) {

    var data = "";
    response.on('data', function (chunk) {
      data += chunk;
    });

    response.on('end', function (chunk) {

      extractDilbertTag(data, function (err, dilbert) {
        if (err) {
          debug("could not extract dilbert data from: " + url);
          cb("could not extract dilbert data from: " + url, null);
          return;
        }

        debug("found: " + JSON.stringify(dilbert));
        cb(null, dilbert);
      });
    });
  });

};



