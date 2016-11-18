var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);

//=========================================================
// Bots Dialogs
//=========================================================

const UUID = '001788fffe09ff3c-WDFWKbjWPutKHhaMSRJoKbREawkFnFmrvjPj9T4y';
const PROXY_URL = 'http://hueproxy.azurewebsites.net/command/' + UUID;

bot.dialog('/', function (session, args, next) {
    switch (session.message.text) {
        case 'on':
            session.send("J'allume les lumières !");
            request.post({
                url: PROXY_URL,
                json: {command: 'turnAllLightsOn'}
            });
            break;
        case 'off':
            session.send("J'éteins les lumières !");
            request.post({
                url: PROXY_URL,
                json: {command: 'turnAllLightsOff'}
            });
            break;
        default:
            session.send("Commande inconnue !");
            break;
    }
});

//=========================================================
// Deployment
//=========================================================

if (process.env.FUNCTIONS_EXTENSION_VERSION) {
    // If we are in the Azure Functions runtime...
    const listener = connector.listen();
    module.exports = (context, req) => {
        listener(req, context.res);
    }
} else {
    // Otherwise, setup Restify Server
    var server = restify.createServer();
    server.post('/api/messages', connector.listen());
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url); 
    });
}
