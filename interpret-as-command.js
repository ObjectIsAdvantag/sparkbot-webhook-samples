/* 
 * a Cisco Spark webhook that leverages a simple library (batteries included)
 * 
 * note : this example requires that you've set a SPARK_TOKEN env variable 
 *  
 */

var SparkBot = require("./sparkbot/webhook");

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var bot = new SparkBot();
 
bot.processNewMessage(function(err, trigger, message) {
 
  if (err) {
      console.log("could not read new message, err: " + err.message); 
      return;
  }
  console.log("new message from: " + trigger.data.personEmail + ", text: " + message.text);

  //
  // ADD YOUR CUSTOM CODE HERE
  //  
  bot.interpretAsCommand(message, function (err, command) {
      if (err) {
          console.log("could not interpret message as a command, err: " + err.message); 
          return;
      }
      
      console.log("new command: " + command.keyword + ", with args: " + JSON.stringify(command.args));
  });


  
});

