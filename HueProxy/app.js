'use strict';

const iothub = require('azure-iothub');
const Message = require('azure-iot-common').Message;
const restify = require('restify');

const connectionString = 'HostName=HueHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=llJRnP/m5BkiRz0bStz17hd/ojizZomKGvGbFKGGq2I=';

const registry = iothub.Registry.fromConnectionString(connectionString);
const client = iothub.Client.fromConnectionString(connectionString);

// Register new Hue Bridge

function register(req, res, next) {
    let device = {
        deviceId: req.params.uid
    };
    registry.create(device, function(err) {
        registry.get(device.deviceId, function(err, deviceInfo) {
            console.log(JSON.stringify(deviceInfo));
            res.send({
                "uid": req.params.uid,
                "deviceInfo": deviceInfo
            });
        });
    });

    next();
}

// Send a command

function command(req, res, next) {
    // Just send the command request body as-is
    const message = new Message(req.body);

    // Send the message
    client.send(req.params.uid, message, function(err) {
        if (err) {
            console.log('Error sending message to: ' + req.params.uid);
            console.log(err);
            res.send(500);
        } else {
            console.log('Message sent to ' + req.params.uid);
            res.send(200);
        }
    });

    next();
}

// Connect to IoT Hub
client.open(function(err) {
    if (err) {
        console.log('Error connecting to: ' + connectionString);
        console.log(err);
        return;
    } else {
        console.log('Connected to: ' + connectionString);
    }
});

// Create Restify server
const server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

// Define routes
server.get('/register/:uid', register);
server.post('/command/:uid', command);

// Run server
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
