
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var debug = require("debug")("sparkbot");

var Utils = require("./utils");
var webhookResources = [ "memberships", "messages", "rooms"];
var webhookEvents = [ "created", "deleted", "updated"];

/* Creates a Cisco Spark webhook with specified configuration structure: 
 *  
 *  { 
 * 		port, 		// int: local port on which the webhook is accessible
 * 		path,  		// string: path to which new webhook POST events are expected
 * 		token		// string: spark API access token                    	
 *  }
 *  
 * If no configuration is specified, the defaults below apply: 
 *  { 
 * 		port 		: process.env.PORT || 8080,
 * 		path		: process.env.WEBHOOK_URL || "/"   
 * 		token		: process.env.SPARK_TOKEN                  	
 *  }
 * 
 */
function Webhook(config) {
	// Inject defaults if no configuration specified
	if (!config) {
		debug("webhook instantiated with default configuration");
		config = {
			port 		: process.env.PORT || 8080,
			path		: process.env.WEBHOOK_URL || "/",
			token		: process.env.SPARK_TOKEN
		};
	} 
	
	// Abort if mandatory copnfig parameters are not present
	if (!config.port || !config.path) {
		debug("bad configuration for webhook, aborting Webhook constructor");
		return null;
	}

	// Check Spark token
	if (!config.token) {
		debug("no Spark access token specified, will not fetch message contents and room titles");
	}
	else {
		this.token = config.token;
	}

	// Webhook listeners
	this.listeners = {};
	self = this;
	function fire(trigger) {
		// Retreive listener for incoming event
		var entry = trigger.resource + "/" + trigger.event;
		var listener = self.listeners[entry];
		if (!listener) {
			debug("no listener found for resource/event: " + entry);
			return;
		}

		// Invoke listener
		debug("calling listener for resource/event: " + entry + ", with data context: " + trigger.data.id);
		listener(trigger);		
	}

	// Webhook API routes
	started = Date.now();
	app.route(config.path)
		.get(function (req, res) {
			debug("healtch check hitted");
			res.json({
				message: "Congrats, your Cisco Spark webhook is up and running",
				since: new Date(started).toISOString(),
				listeners: Object.keys(self.listeners),
				token: (self.token != null),
				tip: "Register your bot as a WebHook to start receiving events: https://developer.ciscospark.com/endpoint-webhooks-post.html"
			});
		})
		.post(function (req, res) {
			debug("webhook invoked");
			
			// analyse incoming payload, should conform to Spark webhook trigger specifications
        	if (!req.body || !Utils.checkWebhookEvent(req.body)) {
				debug("unexpected payload POSTed, aborting...");
				res.status(400).json({message: "Bad payload for Webhook",
										details: "either the bot is misconfigured or Cisco Spark is running a new API version"});
				return;
			}

			// event is ready to be processed, let's send a response to Spark without waiting any longer
			res.status(200).json({message: "message received and being processed by webhook"});

			// process incoming resource/event, see https://developer.ciscospark.com/webhooks-explained.html
			fire(req.body);	
		});
	
	// Start bot
	app.listen(config.port, function () {
		debug("Cisco Spark bot started on port: " + config.port);
	});
}


// Registers a listener for new (resource, event) POSTed to webhook   
Webhook.prototype.on = function(resource, event, listener) {
	if (!listener) {
		debug("on: listener registration error. Please specify a listener for resource/event");
		return;
	}
	// check (resource, event) conforms to Spark webhook specifications, see https://developer.ciscospark.com/webhooks-explained.html 
	if (!resource || !event) {
		debug("on: listener registration error. please specify a resource/event for listener");
		return;
	}

	switch(resource) {
		case "all":
			if (event != "all") {
				debug("on: listener registration error. Bad configuration: only 'all' events is suported for 'all' resources");
				debug("WARNING: listener not registered for resource/event: " + resource + "/" + event);
				return;
			}
			
			addMessagesCreatedListener(this, listener);
			addMessagesDeletedListener(this, listener);
			addRoomsCreatedListener(this, listener);
			addRoomsUpdatedListener(this, listener);
			addMembershipsCreatedListener(this, listener);
			addMembershipsUpdatedListener(this, listener);
			addMembershipsDeletedListener(this, listener);
			return;
		
		case "messages": 
			if (event == "all") {
				addMessagesCreatedListener(this, listener);
				addMessagesDeletedListener(this, listener);
				return;
			}
			if (event == "created") {
				addMessagesCreatedListener(this, listener);
				return;
			}
			if (event == "deleted") {
				addMessagesDeletedListener(this, listener);
				return;
			};
			break;

		case "memberships": 
			if (event == "all") {
				addMembershipsCreatedListener(this, listener);
				addMembershipsUpdatedListener(this, listener);
				addMembershipsDeletedListener(this, listener);
				return;
			}
			if (event == "created") {
				addMembershipsCreatedListener(this, listener);
				return;
			}
			if (event == "updated") {
				addMembershipsUpdatedListener(this, listener);
				return;
			};
			if (event == "deleted") {
				addMembershipsDeletedListener(this, listener);
				return;
			};
			break;

		case "rooms": 
			if (event == "all") {
				addRoomsCreatedListener(this, listener);
				addRoomsUpdatedListener(this, listener);
				return;
			}
			if (event == "created") {
				addRoomsCreatedListener(this, listener);
				return;
			}
			if (event == "updated") {
				addRoomsUpdatedListener(this, listener);
				return;
			};
			break;

		default:
			break;
	}	

	debug("on: listener registration error, bad configuration. Resource: '" + resource + "' and event: '" + event + "' do not comply with Spark webhook specifications.");
}


// Get message details from triggered events   
Webhook.prototype.decryptMessage = function(trigger, cb) {
	if (!this.token) {
		debug("no Spark token configured, cannot read message details.")
		cb(new Error("no Spark token configured, cannot decrypt message"), null);
		return;
	}

	Utils.readMessage(trigger.data.id, this.token, cb);
}


// Get message details from triggered events   
Webhook.prototype.processNewMessage = function(cb) {
	var token = this.token;
	addMessagesCreatedListener(this, function(trigger) {
		if (!token) {
			debug("no Spark token configured, cannot read message details.")
			cb(new Error("no Spark token configured, cannot decrypt message"), null, null);
			return;
		}

		Utils.readMessage(trigger.data.id, token, function (err, message) {
			cb(null, trigger, message);
		});
	});
}


module.exports = Webhook


//
// Internals
//

function addMessagesCreatedListener(webhook, listener) {
	webhook.listeners["messages/created"] = listener;
	debug("addMessagesCreatedListener: listener registered"); 
}

function addMessagesDeletedListener(webhook, listener) {
	webhook.listeners["messages/deleted"] = listener;
	debug("addMessagesDeletedListener: listener registered"); 
}

function addRoomsCreatedListener(webhook, listener) {
	webhook.listeners["rooms/created"] = listener;
	debug("addRoomsCreatedListener: listener registered"); 
}

function addRoomsUpdatedListener(webhook, listener) {
	webhook.listeners["rooms/updated"] = listener;
	debug("addRoomsUpdatedListener: listener registered"); 
}

function addMembershipsCreatedListener(webhook, listener) {
	webhook.listeners["memberships/created"] = listener;
	debug("addMembershipsCreatedListener: listener registered"); 
}

function addMembershipsUpdatedListener(webhook, listener) {
	webhook.listeners["memberships/updated"] = listener;
	debug("addMembershipsUpdatedListener: listener registered"); 
}

function addMembershipsDeletedListener(webhook, listener) {
	webhook.listeners["memberships/deleted"] = listener;
	debug("addMembershipsDeletedListener: listener registered"); 
}





