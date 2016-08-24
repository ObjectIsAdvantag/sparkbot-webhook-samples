# Cisco Spark WebHook Examples in NodeJS

Interested in creating your own Cisco Spark bot, pick an example that suits your scenario, and customize it.

To run your bot, simply take the Quick Start below, or take the DevNet Tutorial for a Step by step guide


## Run locally

``` bash
> git clone 
> cd 
> npm install
> node minimalists.js
Cisco Spark Bot started on port: 8080
```

Check your bot is accessible by hitting its heath endpoint at http://localhost:8080/

``` bash
// In another terminal, run
> curl http://localhost:8080/
{
  "message": "Congrats, your Cisco Spark bot is up and running",
  "since": "2016-08-24T15:09:59.412Z",
  "code": "minimalist.js",
  "tip": "Register your bot as a WebHook to start receiving events: https://developer.ciscospark.com/endpoint-webhooks-post.html"
}
```

## Expose your bot on the Web with localtunnel

Replace *mybot* with a unique name so that you do not mess up with other developers,
and run the following commands:

``` bash
// In another terminal
> npm install localtunnel -g
> lt -s mybot -p 8080
your url is: http://<yourbot>.localtunnel.me
```

Check your bot is accessible by hitting its heath endpoint at https://*yourbot*.localtunnel.me/
Note: make sure you hit the _secured_ HTTPS endpoint.  

``` bash
// In another terminal, run
> curl https://<yourbot>.localtunnel.me/
{
  "message": "Congrats, your Cisco Spark bot is up and running",
  "since": "2016-08-24T15:09:59.412Z",
  "code": "minimalist.js",
  "tip": "Register your bot as a WebHook to start receiving events: https://developer.ciscospark.com/endpoint-webhooks-post.html"
}
```


## Register your bot as a Spark WebHook

Go to the Cisco Spark Developer portal, login and create a new Webhook.

TODO: add figure


As an alternative, you can run this CURL command.

``` bash
// In another terminal
> curl https://
// npm install
```

To go further, we suggest you run other examples in this repo,
or learn to host your bot on a public cloud.


## Step by step guide

Take the DevNet Learning lab associated to this code samples.






