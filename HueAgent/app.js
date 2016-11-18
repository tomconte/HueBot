'use strict';

const Protocol = require('azure-iot-device-amqp').Amqp;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const request = require('request');

// Get the Hue Bridge secret "username"

// Register the device

request('http://localhost:8080/register/aaa-bbb-ccc-ddd-eee', function (error, response, body) {
    console.log(body);
    const deviceInfo = JSON.parse(body).deviceInfo;
    const connectionString = "HostName=HueHub.azure-devices.net;DeviceId=" + deviceInfo.deviceId + ";SharedAccessKey=" + deviceInfo.authentication.symmetricKey.primaryKey;
    startAgent(connectionString); 
});

function startAgent(connectionString) {
    // Connect directly to IoT Hub
    const client = Client.fromConnectionString(connectionString, Protocol);
    client.open(function() {
        console.log('Client connected');
        client.on('message', function(msg) {
            console.log(msg.data);
            client.complete(msg, function() {
                console.log('Command acknowledged.');
            });
        });
        client.on('error', function(err) {
            console.error(err.message);
        });
        client.on('disconnect', function() {
            client.removeAllListeners();
            client.open(connectCallback);
        });
    });
}
