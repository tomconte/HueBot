'use strict';

const Protocol = require('azure-iot-device-amqp').Amqp;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const request = require('request');

/********************************************************************************/
/* Initialization
/********************************************************************************/

// Find the Hue Bridge

request('https://www.meethue.com/api/nupnp', (error, response, body) => {
    if (!error && response.statusCode == 200) {
        console.log('Found the bridge!');
        console.log(body);
        let b = JSON.parse(body)[0];
        let bridgeIp = b.internalipaddress;
        let bridgeId = b.id;

        // Now we need a whitelisted username for the Bridge
        let userName;
        // Option 1: the user has a username and enters it as a parameter
        if (process.argv[2]) {
            userName = process.argv[2];
        }
        // Option 2: the user doesn't have a username, let's create a new one
        // TODO
        
        // Now register the bridge with the proxy service
        registerAgent(bridgeIp, bridgeId, userName);
    } else {
        console.log(error);
        return;
    }
})

/********************************************************************************/
/* Device registration
/********************************************************************************/

function registerAgent(ip, id, u) {
    let uuid = id + '-' + u;
    request('http://localhost:8080/register/' + uuid, (error, response, body) => {
        const deviceInfo = JSON.parse(body).deviceInfo;
        const connectionString = "HostName=HueHub.azure-devices.net;DeviceId=" + deviceInfo.deviceId + ";SharedAccessKey=" + deviceInfo.authentication.symmetricKey.primaryKey;
        console.log('********************\nThis is your UUID: ' + uuid + '\n********************')
        startAgent(ip, u, connectionString); 
    });
}

/********************************************************************************/
/* Agent
/********************************************************************************/

function startAgent(ip, user, connectionString) {
    // Connect directly to IoT Hub
    const client = Client.fromConnectionString(connectionString, Protocol);
    client.open(function() {
        console.log('Client connected. Forwarding commands to ' + ip);
        client.on('message', (msg) => {
            console.log(msg.data);
            executeCommand(ip, user, msg.data, () => {
                client.complete(msg, () => {
                    console.log('Command acknowledged.');
                });
            });
        });
        client.on('error', (err) => {
            console.error(err.message);
        });
        client.on('disconnect', () => {
            client.removeAllListeners();
            client.open(connectCallback);
        });
    });
}

/********************************************************************************/
/* Agent
/********************************************************************************/

function executeCommand(ip, user, command, cb) {
    console.log('Send command ' + command.command + ' to ' + ip + ' with ' + user);
    cb();
}
