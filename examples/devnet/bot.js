/* 
 * a bot that help you get orientation at DevNet
 * 
 */

var request = require("request");
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("../../sparkbot/webhook");
var bot = new SparkBot();

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


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
bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "I can tell about DevNet events\n- /about\n- /help\n- /next [#max]: show upcoming #max events, defaults to 5\n- /now: show events happening now\n"
    });
}


bot.onCommand("next", function (command) {

    // let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_heard you ! asking my crystal ball..._"
    });

    var limit = command.args[0];
    if (!limit) limit = 5;
    if (limit < 1) limit = 1;

    fetchNextEvents(limit, function (err, events) {
        if (err) {
            spark.messageSendRoom(command.message.roomId, {
                 markdown: "**sorry, ball looks broken :-(**"
            });
            return;
        }

        spark.messageSendRoom(command.message.roomId, {
            markdown: events
        });  
    })

});


bot.onCommand("now", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "personId: " + command.message.personId + "\n\nemail: " + command.message.personEmail
    });
});




function fetchNextEvents(limit, cb) {

    // Get list of upcoming events
    var options = {
        method: 'GET',
        url: "https://devnet-events-api.herokuapp.com/api/v1/events/next?limit=" + limit
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not retreive list of events, error: " + error);
            cb(new Error("Could not retreive upcoming events, sorry [Events API not responding]"), null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("could not retreive list of events, response: " + response);
            sparkCallback(new Error("Could not retreive upcoming activities, sorry [bad anwser from Events API]"), null);
            return;
        }

        var events = JSON.parse(body);
        debug("fetched " + events.length + " activities");
        fine(JSON.stringify(events));

        if (events.length == 0) {
            cb(null, "**Guess what? No upcoming event!**");
            return;
        }

        var nb = events.length;
        var msg = "**Here are the " + nb + " upcoming events:**";
        for (var i = 0; i < nb; i++) {
            var current = events[i];
            msg += "\n- " + current.beginDay + " " + current.beginTime + ": [" + current.name + "](" + current.location +") at " + current.city + " ( " + current.country + ")";
        }

        cb(null, msg);
    });
}


