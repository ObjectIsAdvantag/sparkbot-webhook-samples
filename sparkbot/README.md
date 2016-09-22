# sparkbot-webhook

This framework makes it easy to build ChatBots for Cisco Spark in nodejs. 

It has been designed as a companion to a DevNet learning lab, and to help nodejs developers understand the concepts of Cisco Spark webhooks.


## Features

_Note that running a few [tests](../tests) is a great way to discover the framework features._

- cisco spark webhooks
   - supports all Spark webhooks, see https://developer.ciscospark.com/webhooks-explained.html
   - via listeners function: .on(<resources>,<event>)
   - check [onEvent-all-all](../tests/onEvent-all-all.js) and [onEvent-messages-created](../tests/onEvent-messages-created.js) code samples

- new message handler
   - gives an easy way to process only new messages
   - via an .onMessage() listener function
   - check [onMessage](../tests/onMessage.js) and [onMessage-asCommand](../tests/onMessage-asCommand.js) code samples

- interactive assistants
   - straight forward way to take action on commands (keywords)
   - option to trim mention if your bot is mentionned in a group room
   - option to specify a fallback command
   - via an .onCommand() listener function
   -check [onCommand](../tests/onCommand.js) sample

- healthcheck
   - GET /, returns a 200 OK, plus detailled info about your bot configuration
   - automatically added and exposed at same entrypoint than your bot Web API

- account detection
   - only if if a spark token is present
   - automatically computed at bot startup via an async call to Cisco Spark
   - let your code know is it is running as a HUMAN (Developer Account, ie dedicated Spark account) or MACHINE (a Bot account)

 






