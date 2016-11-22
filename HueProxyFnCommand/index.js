const iothub = require('azure-iothub');
const Message = require('azure-iot-common').Message;

const connectionString = process.env.IOTHUB_CONNECTION_STRING;

module.exports = function(context, req) {

    // Just send the command request body as-is
    const message = new Message(req.body);

    // Connect to IoT Hub
    const uid = context.bindingData.uid;
    const client = iothub.Client.fromConnectionString(connectionString);
    client.open((err) => {
        if (err) {
            context.log('Error connecting to: ' + connectionString);
            context.log(err);
            context.res = { status: 500, body: 'Error connecting to IoT Hub' };
            context.done();
        } else {
            context.log('Connected to: ' + connectionString);
            // Send the message
            client.send(uid, message, (err) => {
                if (err) {
                    context.log('Error sending message to: ' + uid);
                    context.log(err);
                    context.res = { status: 500, body: 'Error sending message to IoT Hub' };
                    context.done();
                } else {
                    context.log('Message sent to ' + uid);
                    context.res = { status: 200, body: 'Message sent' };
                    context.done();
                }
            });
        }
    });
}
