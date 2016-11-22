const iothub = require('azure-iothub');

const connectionString = process.env.IOTHUB_CONNECTION_STRING;

module.exports = function(context, req) {

    // Registry address
    const registry = iothub.Registry.fromConnectionString(connectionString);

    // Device object
    let device = {
        deviceId: req.params.uid
    };

    // Create device in IoTHub registry
    registry.create(device, (err) => {
        registry.get(device.deviceId, (err, deviceInfo) => {
            context.res.send({
                "uid": req.params.uid,
                "deviceInfo": deviceInfo
            });
        });
    });
}
