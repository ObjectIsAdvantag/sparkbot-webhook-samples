/* 
 * a bot that gives you instant access to Cisco Spark technical data
 * 
 * note : this example can work with any type of spark token (from a developer or bot account)
 *  
 */

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var SparkBot = require("../sparkbot/webhook");
var bot = new SparkBot();

// do not listen to ourselves
// comment if you're running the bot from your Developer access token and you want to invoke in a 1-1 room
//bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "I can give you quick access to Spark technical data\n\n- /help\n\n- /room\n\n- /whoami\n\n- /whois @mention\n\n"
    });
}


bot.onCommand("room", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "roomId: " + command.message.roomId
    });

});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am the Inspector Bot !"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    spark.messageSendRoom(message.roomId, {
                        markdown: "**Note that - in Group rooms - I wake up only when mentionned.**"
                    })
                        .then(function (message) {
                            showHelp(message.roomId);
                        });
                }
                else {
                    showHelp(message.roomId);
                }
            });
    }
});



bot.onCommand("whoami", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "personId: " + command.message.personId + "\n\nemail: " + command.message.personEmail
    });
});


bot.onCommand("whois", function (command) {
    // Check usage
    if (command.message.mentionedPeople.length != 2) {
        spark.messageSendRoom(command.message.roomId, {
            markdown: "sorry, I cannot proceed if you do not mention a room participant"
        });
        return;
    }

    var participant = command.message.mentionedPeople[1];

    spark.personGet(participant).then(function (person) {
        spark.messageSendRoom(command.message.roomId, {
            markdown: "personId: " + person.id + "\n\ndisplayName: " + person.displayName + "\n\nemail: " + person.emails[0]
        });
    });
});



