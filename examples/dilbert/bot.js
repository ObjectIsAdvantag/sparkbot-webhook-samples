
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
function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "_I am the Dilbert bot, can send you comics from [Dilbert Strip](http://dilbert.com/strip/):_\n\n- /help\n\n- /today [YYYY-MM-DD]"
    });
}
bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});


//
// TODAY COMMAND
//
bot.onCommand("today", function (command) {

    // [TODO] Get Data parameter
    var date = command.args[0];
    if (!date) {
        date = "2016-09-01";
    }

    // As computing stats takes time, let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "heard you ! now calling dilbert..."
    })
    .then(function (messages) { 

        // Show comics
        showDilbert(command.message.roomId, date);
    });
});


// Input day must be in YYYY-MM-DD format
function showDilbert(roomId, day) {

    Dilbert.dilbertForDay(day, function (err, dilbert) {
        if (err) {
            debug("could not extract dilbert data for day: " + day + ", err: " + JSON.stringify(err));
            spark.messageSendRoom(roomId, {
                "markdown": "sorry, I am not in a mood now, check out [Dilbert Strip](http://dilbert.com/strip/)."
            });
            return;
        }

        debug("found: " + JSON.stringify(dilbert));
        spark.messageSendRoom(roomId, {
            "files": [dilbert.image],
            "text": dilbert.url
        });
    });
}


//
// WECOME MESSAGE WHEN ADDED INTO ROOMS
//
bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (bot.interpreter.person && (bot.interpreter.person.id === newMembership.personId)) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am so happy to join !"
        })
            .then(function (message) {
                // show how to use
                showHelp(command.message.roomId);
            })
            .catch(function (err) {
                debug("Could not send welcome message, err: " + JSON.stringify(err));
            });
    }
});




