'use strict';

const Protocol = require('azure-iot-device-amqp').Amqp;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const request = require('request');

let bridgeIp, bridgeId, userName;
let client;

/********************************************************************************/
/* Initialization
/********************************************************************************/

// Find the Hue Bridge

request('https://www.meethue.com/api/nupnp', (error, response, body) => {
    if (!error && response.statusCode == 200) {
        let bridgeInfo = JSON.parse(body)[0];

        if (!bridgeInfo) {
            console.log('Bridge not found!');
            return;
        }

        console.log('Found the bridge!');
        console.log(body);

        bridgeIp = bridgeInfo.internalipaddress;
        bridgeId = bridgeInfo.id;

        // Now we need a whitelisted username for the Bridge
        if (process.argv[2]) {
            // Option 1: the user has a username and enters it as a parameter
            userName = process.argv[2];
        } else {
            // Option 2: the user doesn't have a username, let's create a new one
            // TODO
            console.log('Creating a new user...');
            return;
        }
        
        // Now register the bridge with the proxy service
        registerAgent();
    } else {
        console.log(error);
        return;
    }
})

/********************************************************************************/
/* Device registration
/********************************************************************************/

function registerAgent() {
    let uuid = bridgeId + '-' + userName;
    request('http://hueproxy.azurewebsites.net/register/' + uuid, (error, response, body) => {
        if (error) {
            console.log(error);
            return;
        }
        const deviceInfo = JSON.parse(body).deviceInfo;
        const connectionString = "HostName=HueHub.azure-devices.net;DeviceId=" + deviceInfo.deviceId + ";SharedAccessKey=" + deviceInfo.authentication.symmetricKey.primaryKey;
        console.log('********************\nThis is your UUID: ' + uuid + '\n********************')
        startAgent(connectionString); 
    });
}

/********************************************************************************/
/* Agent
/********************************************************************************/

function startAgent(connectionString) {
    // Connect directly to IoT Hub
    client = Client.fromConnectionString(connectionString, Protocol);
    client.open(connectCallback);
}

function connectCallback() {
    console.log('Client connected. Forwarding commands to ' + bridgeIp);
    client.on('message', (msg) => {
        console.log(msg.data);
        executeCommand(bridgeIp, userName, msg.data, () => {
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
}

/********************************************************************************/
/* Commands
/********************************************************************************/

function executeCommand(ip, user, command, cb) {
    console.log('Send command ' + command.command + ' to ' + ip + ' with ' + user);

    let url = 'http://' + ip + '/api/' + user;
    let options;

    switch (command.command) {
        case 'turnAllLightsOn':
            options = {
                url: url + '/groups/0/action',
                body: JSON.stringify({on: true})
            };
            request.put(options, (error, response, body) => {
                console.log(error);
            });
            break;
        case 'turnAllLightsOff':
            options = {
                url: url + '/groups/0/action',
                body: JSON.stringify({on: false})
            };
            request.put(options, (error, response, body) => {
                if (error) console.log(error);
            });
            break;
        default:
            console.log('Unknown command ' + command);
    }

    cb();
}
