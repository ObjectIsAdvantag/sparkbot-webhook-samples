
var debug = require('debug')('sparbot');

var Utils = {};

// Returns true if specified JSON data complies with the Spark Webhook documentation
// see https://developer.ciscospark.com/webhooks-explained.html 
//
//   {
//     "id":"Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjRlNjA1NjAtNjYwMi00ZmIwLWEyNWEtOTQ5ODgxNjA5NDk3",         // webhook id
//     "created":"2016-08-23T16:26:02.754Z"                                                             // wehook creation date (does not change, not attached to the event)                                                                     
//     "name":"Guild Chat to http://requestb.in/1jw0w3x1",                                              // as specified at creation
//     "targetUrl":"https://mybot.localtunnel.me/",                                                     // as specified at creation
//     "filter":"roomId=Y2lzY29zcGFyazovL3VzL1JPT00vY2RlMWRkNDAtMmYwZC0xMWU1LWJhOWMtN2I2NTU2ZDIyMDdi",  // optional, as specified at creation
//     "resource":"messages",                                                                           // actual resource that triggered the webhook (different from specified at creation if 'all' was specified)
//     "event":"created",                                                                               // actual event that triggered the webhook (different from specified at creation if 'all' was specified)
//     "actorId":"Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjRlNjA1NjAtNjYwMi353454123E1221",                    // actual spark actor who triggered the webhook (source event)
//     "data":{
//          ...
//          EVENT SPECIFIC 
//          ...
//     }
//   } 
Utils.checkWebhookEvent = function(payload) {
    if (!payload 	|| !payload.id 
                    || !payload.name 
					|| !payload.created
                    //August 2016: present but not integrated yet in Spark documentation
					|| !payload.targetUrl     
                    || !payload.resource 
                    || !payload.event
					// August 2016: present but not integrated yet in Spark documentation
                    || !payload.actorId       
					|| !payload.data
					) {
			debug("received payload is not compliant with Spark Webhook specification");
			return false;
    }
    return true;
};

module.exports = Utils;
