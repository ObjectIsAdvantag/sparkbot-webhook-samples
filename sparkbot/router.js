
var debug = require("debug")("sparkbot-router");
var fine = require("debug")("fine-grained");


/*
 * Listener to new (messages/created) Webhook events which does routing based on command keyword
 */

function CommandRouter(webhook) {
    this.commands = {};
    
    // add router as (messages/created) listener
    if (!webhook) {
        debug("webhook required, skipping router initialization...");
        return;
    }
    this.webhook = webhook;

    var self = this;
    webhook.processNewMessage(function(err, trigger, message) {
        if (err) {
            debug("could not read new message, err: " + err.message); 
            return;
        }

        webhook.interpretAsCommand(message, function (err, command) {
            if (err) {
                debug("could not interpret message as a command, err: " + err.message); 
                return;
            }
            
            fine("new command: " + command.keyword + ", with args: " + JSON.stringify(command.args));
            var listener = self.commands[command.keyword];
            if (!listener) {
                fine("command: " + command.keyword + " is not registered, aborting...");
                return;
            }

            debug("firing new command: " + command.keyword);
            listener(null, command);
        });
    });
}


CommandRouter.prototype.addCommand = function (command, listener) {
    // Robustify
    if (!command ||!listener) {
        debug("addCommand: bad arguments, aborting...");
        return;
    }

    debug("added listener for command: " + command);
    this.commands[command] = listener;
}


module.exports = CommandRouter;