
/* 
 * a Sparkbot that shows stats for a Spark room
 * 
 * note : this example requires that you've set a SPARK_TOKEN env variable 
 *  
 */

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var SparkBot = require("../../sparkbot/webhook");
var bot = new SparkBot();
bot.interpreter.ignoreSelf = true; // do not listen to ourselves

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });

var Dilbert = require("./util.js");


//
// HELP COMMAND
//
bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
bot.onCommand("fallback", function (command) {
    // so happy to join
    spark.messageSendRoom(command.message.roomId, {
        text: "sorry, I did not understand"
    })
        .then(function (message) {
            // show how to use
            showHelp(command.message.roomId);
        });
});

function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "I am the Dilbert bot, can send comics from [Dilbert Strip](http://dilbert.com/strip/):\n\n- /help\n\n- /strip [YYYY-MM-DD]\n\n**Note that - in Group rooms - I wake up only when mentionned.**"
    });
}


//
// TODAY COMMAND
//
bot.onCommand("strip", function (command) {

    // As computing stats takes time, let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "heard you ! now calling dilbert..."
    })
        .then(function (messages) {

            // Show comics
            var date = command.args[0];
            if (!date) {
                date = "";
            }
            Dilbert.stripForDay(date, function (err, dilbert) {
                if (err) {
                    debug("could not extract dilbert data for day: " + date + ", err: " + JSON.stringify(err));
                    spark.messageSendRoom(command.message.roomId, {
                        "markdown": "sorry, I am not in a very mood right now, check out [Dilbert Strip](http://dilbert.com/strip/)."
                    });
                    return;
                }

                debug("successfully fetched data: " + JSON.stringify(dilbert));
                spark.messageSendRoom(command.message.roomId, {
                    "files": [dilbert.image],
                    "text": dilbert.url
                });
            });
        });
});


//
// WECOME MESSAGE WHEN ADDED INTO ROOMS
//
bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (bot.interpreter.person && (bot.interpreter.person.id === newMembership.personId)) {
        debug("bot added to room: " + trigger.data.roomId + ", shooting welcome message");

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, so happy to join this room !"
        })
            .then(function (message) {
                // show how to use
                showHelp(trigger.data.roomId);
            });
    }
});




