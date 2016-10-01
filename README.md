# Cisco Spark WebHook Examples in nodejs


Interested in creating your own Cisco Spark bots ? Pick an example that suits your scenario, and customize it.

To run any of these examples, follow the [How to run on Cloud9](docs/HowToRunOnCloud9.md) or [How to run locally](docs/HowToRegisterOnSpark.md) guide.

The examples below leverage the [sparkbot-webhook](sparkbot) nodejs library.  
To learn more about the library, check the [tests](tests/README.md) examples.

To go further, take a [DevNet Learning lab](https://learninglabs.cisco.com/labs).



## [inspect](examples/inspector.js)

Provides instant access to Cisco Spark technical data.

Features illustrated by this example:
- **Help command to display available commands**
- **About command to get meta info about the bot**
- **Welcome message as the bot is added in a room**
- **Fallback message if a command is not recognized**

This bot can be run as is with either a Developer or a Bot access token 

Invite _inspect@sparkbot.io_ to meet the bot.

![](docs/img/bot-inspect-welcome.png)



## [roomId](examples/roomid-phantom.js)

Fetches the identifier of the room in which this bot has just been added, 
and leaves the inquired room right away.

Features illustrated by this example:
- Help command to display available commands
- About command to get meta info about the bot
- Fallback message if a command is not recognized
- **Creates a 1-1 room and leaves a room, with node-sparky client**

Invite _roomid@sparkbot.io_ to meet the bot.

![](docs/img/bot-roomId.png)



## [room-stats](examples/room-stats.js)

Computes stats for the room it is invoked from. 

Features illustrated by this example:
- Help message to display bot commands
- Welcome message as the bot is added in a room
- **Calls the Spark API via the node-sparky client**
- **Markdown formatting with lists & mentions**
- **Runs with a fake Spark account**

Note that this webhook must be run with a Developer access token (either your's or a fake Spark account).
More details: this code needs to access all messages from the room, bots cannot read messages from Rooms (ie, GET Rooms returns a 403 with a bot token).



## [events](examples/devnet/bot.js)

Tells you about upcoming DevNet events.

Features illustrated by this example:
- Help command to display available commands
- About command to get meta info about the bot
- Welcome message as the bot is added in a room
- Fallback message if a command is not recognized
- **Command with integer argument** 
- **Calls a a public REST API**
- **Markdown formatting with lists and hyperlinks**

Invite _CiscoDevNet@sparkbot.io_ to meet the bot.

![](docs/img/bot-ciscodevnet-next.png)



## [dilbert](examples/dilbert/bot.js)

Fetches latest comic from Dilbert Strip (with invitation ad to visit the Web Site)

Features illustrated by this example:
- Help command to display available commands
- Welcome message as the bot is added in a room
- Fallback message if a command is not recognized
- **Command with a date argument**
- **HTML scraping**
- **Markdown formatting and file attachment**

Note this bot is provided as an example and should not be deployed without the consent of Dilbert Comics Strip. 
Go thru the [guide](examples/dilbert) to deploy locally for learning purposes.

![](docs/img/bot-dilbert-strip.png)

