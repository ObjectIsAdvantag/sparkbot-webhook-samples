# Webhook Samples 


- [express-all-in-one](express-all-in-one.js): a simple HTTP service based on Express, listening to incoming WebHook Resource/Events

- [onEvent-all-all](onEvent-all-all.js), [onEvent-messages-created](onEvent-messages-created.js) : examples of listeners to specific Webhook (Resources/Event) triggers. Leverages Sparkbot function: webhook.onEvent().

- [onMessage](onMessage.js) : examples of listeners invoked when new message contents are succesfully fetched from Spark. Leverages Sparkbot function: webhook.onMessage(). 

- [onMessage-asCommand](onMessage-asCommand.js) : illustrates how to interpret the message as a bot command. Leverages Sparkbot function: webhook.onMessage().

- [onCommand](onCommand.js): shortcut to listen to a specific command. Leverages Sparkbot function: webhook.onCommand().


## Run locally

Each sample can be launched from the same set of command lines install then run calls
Note that the SPARK_TOKEN env variable is required to run all samples that read message contents

``` bash
# Installation
> git clone https://github.com/ObjectIsAdvantag/sparkbot-webhook-samples
> cd sparkbot-webhook-Samples
> npm install

# Run
> cd tests
> DEBUG=sparkbot,sparkbot-utils,sparkbot-interpreter,sparkbot-router SPARK_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX node tests/express-all-in-one.js
Cisco Spark Bot started at http://localhost:8080/
   GET  / for Health checks
   POST / receives Spark Webhook events
``` 

## Register your bot on Cisco 

Expose your bot publically with localtunnel.

Check your bot is accessible by hitting its heath endpoint at https://*yourbot*.localtunnel.me/
Note: make sure you hit the _secured_ HTTPS endpoint.  

``` bash

# Expose
> npm install localtunnel -g
> lt -s mybot -p 8080
your url is: http://<yourbot>.localtunnel.me

# In another terminal, run
> curl https://<yourbot>.localtunnel.me/
{
  "message": "Congrats, your Cisco Spark webhook is up and running",
  "since": "2016-09-01T13:15:39.425Z",
  "listeners": [
    "messages/created"
  ],
  "token": true,
  "account": {
    "type": "human",
    "person": {
      "id": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS85MmIzZGQ5YS02NzVkLTRhNDEtOGM0MS0yYWJkZjg5ZjQ0ZjQ",
      "emails": [
        "stsfartz@cisco.com"
      ],
      "displayName": "Steve Sfartz",
      "avatar": "https://1efa7a94ed216783e352-c62266528714497a17239ececf39e9e2.ssl.cf1.rackcdn.com/V1~c2582d2fb9d11e359e02b12c17800f09~aqSu09sCTVOOx45HJCbWHg==~1600",
      "created": "2016-02-04T15:46:20.321Z"
    }
  },
  "interpreter": {
    "prefix": "/",
    "trimMention": true,
    "ignoreSelf": false
  },
  "commands": [
    "help"
  ],
  "tip": "Register your bot as a WebHook to start receiving events: https://developer.ciscospark.com/endpoint-webhooks-post.html"
}
```


## Register your bot as a Spark WebHook

Last step, is to create a Spark Webhook for your bot.

This can be done via the Cisco Spark Developer Portal / [Create a WebHook](https://developer.ciscospark.com/endpoint-webhooks-post.html) interactive documentation,
but also via Postman or a CURL command as will see right after.

### via the interactive documentation

For the scope of this example, we'll associate our bot to all resources and events.

Note: even if our webhook can process all events, you can register a webhook with a more limited set of events. Then Spark will then invoke your webhook only if those events happen (whatever your bot can process).

![](../docs/img/spark4devs-create-webhook-all-all.png)


### via CURL

As an alternative, you can run this CURL command.

``` bash
> curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_SPARK_TOKEN" -d '{
        "name": "Sparkbot Samples",
        "resource": "all",
        "event": "all",
        "targetUrl": "https://yourbot.localtunnel.me/"
    }' "https://api.ciscospark.com/v1/webhooks/"
```


### via postman

Or you can also create this webhook via Postman.

![](../docs/img/postman-create-webhook-all-all.png)






 