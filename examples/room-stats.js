
/* 
 * a Sparkbot that shows stats for a Spark room
 * 
 * note : this example requires that you've set a SPARK_TOKEN env variable 
 *  
 */

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var SparkBot = require("../sparkbot/webhook");
var bot = new SparkBot();

// do not listen to ourselves
// comment if you're running the bot from your Developer access token and you want to invoke in a test room
//bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


bot.onCommand("help", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_I am all about Stats for your Spark rooms_\n\n- /help\n\n- /stats [#messages]"
    });
});


bot.onCommand("stats", function (command) {

    // Max number of fetched messages, default is 100
    var max = command.args[0];
    if (!max) {
        max = 100;
    }

    // As computing stats takes time, let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_heard you ! now computing stats among last " + max + " messages..._"
    });

    // Build a map of participations by participant email
    var participants = {};
    var totalMessages = 0; // used to get %ages of participation
    spark.messagesGet(command.message.roomId, max)
        .then(function (messages) {
            // Process messages 
            messages.forEach(function (message) {
                totalMessages++;
                var current = participants[message.personEmail];
                if (!current) {
                    participants[message.personEmail] = 1;
                }
                else {
                    participants[message.personEmail] = current + 1;
                }
            });

            // Sort participants by participation DESC
            var top = Object.keys(participants) //Create a list from the keys of your map. 
                .sort( //Sort it ...
                function (a, b) { // using a custom sort function that...
                    // compares (the keys) by their respective values.
                    return participants[b] - participants[a]; // DESC order
                });

            // Display top 10 participants 
            var length = top.length;
            var limit = Math.min(length, 10);
            switch (limit) {
                case 0:
                    spark.messageSendRoom(command.message.roomId, {
                        text: "did not find any participant! is the room active?"
                    });
                    break;
                case 1:
                    spark.messageSendRoom(command.message.roomId, {
                        markdown: "**kudos to <@personEmail:" + top[0] + ">" + ", the only 1 active participant in here !**"
                    });
                    break;
                default:
                    var stats = "**kudos to the top participants**";
                    for (var i = 0; i < limit; i++) {
                        var email = top[i];
                        var number = participants[email];
                        var pourcentage = Math.round(number * 100 / totalMessages);

                        // Display only relevant contributors
                        if (pourcentage >= 2) {
                            stats += "\n\n" + (i + 1) + ". <@personEmail:" + email + ">, " + pourcentage + "% (" + number + ")";
                        }
                    }
                    spark.messageSendRoom(command.message.roomId, {
                        markdown: stats
                    });
                    break;
            }
        })
        .catch(function (err) {
            // process error
            console.log(err);
        });

});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am so happy to join !"
        })
            .then(function (message) {
                spark.messageSendRoom(trigger.data.roomId, {
                    markdown: "_I am all about Stats for your Spark rooms_\n\n- /help\n\n- /stats [#messages]"
                });;
            })
            .catch(function (err) {
                console.log(err);
            });
    }
});



