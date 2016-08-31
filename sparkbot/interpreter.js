
var https = require("https");
var htmlparser = require("htmlparser2");

var debug = require("debug")("sparkbot-interpreter");
var fine = require("debug")("fine-grained");



var sparkAccounts = ["machine", "human", "unknown"];

/* Helper library to interpret Spark commands as they flow in
 * Please invoke with a valid Webhook configuration
 */
function CommandInterpreter(config) {
    this.token = config.token;
    if (!this.token) {
        debug("token required, skipping interpreter initialization...");
        return;
    }
    
    this.accountType = "unknown";
	this.person = null;
    var self = this;
	detectSparkAccount(this.token, function(err, account, people) {
        if (err) {
            debug("could not retreive account type, err: " + err + ", continuing...");
            return;
        }

		self.accountType = account;
		self.person = people;
	});

    this.trimMention = config.trimMention;
    this.prefix = config.commandPrefix;
    this.ignoreSelf = config.ignoreSelf;
}


// Return a string in which webhook mentions are removed
// Note : we need to start from the HTML text as it only includes mentions for sure. In practice, the plain text message may include a nickname 
function trimMention(person, message) {
    var buffer = "";
    var skip = 0;
    var group = 0;      
    var parser = new htmlparser.Parser({
        onopentag: function(tagname, attribs){
            fine("opening brace name: " + tagname + ", with args: " + JSON.stringify(attribs));
            if (tagname === "spark-mention") {
                if (attribs["data-object-type"]=="person" && attribs["data-object-id"]== person.id ) {
                        skip++; // to skip next text as bot was mentionned
                }
            }
        },
        ontext: function(text){
            if (!skip) {
                fine("appending: " + text);
                if (group > 0) {
                    buffer += " ";
                }
                buffer += text.trim();
                group++;
            }
            else {
                skip--; // skipped, let's continue HTML parsing in case other bot mentions appear
                group = 0;
            }
        },
        onclosetag: function(tagname){
             fine("closing brace name: " + tagname);
        }
    }, {decodeEntities: true});
    parser.parseComplete(message.html);

    debug("trimed: " + buffer);
    return buffer;
}


// checks if a command can be extracted, if so, invokes the callback with signature (err, { keyword:"", args:[]})
// if the text should be ignored, the callback is not invoked. Happens if the bot is writing, or if the specified prefix is not present
// if  
CommandInterpreter.prototype.extract = function (message, cb) {
    // If the message comes from the bot, ignore it
    if (this.ignoreSelf && (message.personId === this.person.id)) {
        debug("bot is writing => ignoring");
        return;
    }

    // Remove mention 
    // Note: this makes sense only if this is a bot account
    var text = message.text;
    if  ((this.accountType == "machine") && this.trimMention) {
        debug("removing bot mention if present in: " + text);
        text = trimMention(this.person, message);
    }

    // Remove extra whitespaces
    text = text.replace( /\s\s+/g, " ");

    // If the message does not contain any text, simply ignore it
    // GTK: happens in case of a pure file attachement for example
    if (!text) {
        debug("no text in message => ignoring");
        return;
    }

    // If it is not a command, ignore it
    if (this.prefix && (this.prefix != text.charAt(0))) {
        debug("text does not start with the command prefix: " + this.prefix + " => ignoring...");
        return;
    }

    // Extract command
    var splitted = text.substring(1).split(' ');
    var keyword = splitted[0];
    if (!keyword) {
        debug("empty command, ignoring");
        cb({ "keyword":"", "args":[]});
        return;        
    }
    debug("detected command: " + keyword);

    // Remove leading command and return 
    splitted.shift();
    cb(null, { "keyword": keyword, "args": splitted, "message":message });
}



// Detects account type by invoking the Spark People ressource
//    - HUMAN if the token corresponds to a bot account, 
//    - BOT otherwise
//
// cb function signature should be (err, type, account) where type: HUMAN|BOT, account: People JSON structure
//
function detectSparkAccount(token, cb) {
	//console.log("checking Spark account");
	var options = {
						'method': 'GET',
						'hostname': 'api.ciscospark.com',
						'path': '/v1/people/me',
						'headers': {'authorization': 'Bearer ' + token}
					};
	var req = https.request(options, function (response) {
		var chunks = [];
		response.on('data', function (chunk) {
			chunks.push(chunk);
		});
		response.on("end", function () {
            switch (response.statusCode) {
                case 200:
                    break; // we're good, let's proceed
            
                case 401:
                    debug("Spark authentication failed: 401, bad token");
                    cb(new Error("response status: " + response.statusCode + ", bad token"), null, null);
                    return;

                default: 
                    debug("could not retreive Spark account, status code: " + response.statusCode);
                    cb(new Error("response status: " + response.statusCode), null, null);
                    return;
            }
				
			// Robustify
			var payload = JSON.parse(Buffer.concat(chunks));
			if (!payload.emails) {
                debug("could not retreive Spark account, unexpected payload");
				cb(new Error("unexpected payload: not json"), null, null);
                return;
			}
			var email = payload.emails[0];
			if (!email) {
                debug("could not retreive Spark account, unexpected payload: no email");
				cb(new Error("unexpected payload: no email"), null, null);
                return;
			}

			// Check if email corresponds to a spark bot
			var splitted = email.split("@");
			if (!splitted || (splitted.length != 2)) {
                debug("could not retreive Spark account, malformed email");
				cb(new Error("unexpected payload: malformed email"), null, null);
                return;
			}
			var domain = splitted[1];
			if ('sparkbot.io' == domain) {
				debug("bot account detected, name: " + payload.displayName);
				cb(null, "machine", payload);
                return;	
			} 

			debug("human account detected, name: " + payload.displayName);
			cb(null, "human", payload);
		});
	});
	req.on('error', function(err) {
		debug("cannot find a Spark account for token, error: " + err);
		cb(new Error("cannot find Spark account for token"), null, null);
	});
	req.end();
}


// Remove leading bot name (or fraction) from text 
// If the bot name appears elsewhere in the text, it is not removed
function trimBotName(text, name) {
	var splitted = name.split(' ');
	var nickname = splitted[0];
	if (text.startsWith(nickname)) {
		console.log("message starts with bot name, removing it")
		return text.substring(nickname.length).trim();
	}
	return text;
}


module.exports = CommandInterpreter;