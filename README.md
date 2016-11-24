# HueBot

This chatbot will rule your Hue lights.

However, sending commands to the Hue Bridge in your home is hard (because of the security, and that''s good). This means we need a bit of infrastructure in order to be able to talk to the Hue Bridge inside your home network.

## Overall architecture

![Architecture Diagram](images/Functions_IoT_Demo.png)

The Bot will use the IoT Hub service in order to securely communicate with the bridge device.

## Hue Agent

In order to be able to talk to your Hue Bridge, the Bot needs you to run an Agent from a machine connected to your local network. Just clone this repo, and then run the following commands:

``` sh
cd HueAgent
npm install
node app.js [username]
```

If you don't have a username, omit it and the Agent will create one for you. Please copy it somewhere, and pass it as a parameter the next time you start the Agent!

The Agent will print a UUID (unique identifier) for your Hue Bridge. You will need to give this UUID to the Hue Bot so it can communicate with your lights.

Leave the Agent running, as this is necessary for the Bot to communicate with your lights. I personnally use a Raspberry Pi device which is perfect for this type of gateway.

TODO: package the Agent as a Docker image so it is easier to start from a Raspberry Pi device.

## Hue Proxy

The Agent will then communicate with a Proxy service hosted in Azure, using the secure Azure IoT Hub service. This Proxy service will allow the Bot to send commands to your Hue installation.

## Hue Bot

The first time you chat with the Hue Bot, it will ask you for your UUID. Paste the text string that you received when you started the Agent.
