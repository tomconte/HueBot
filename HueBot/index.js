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

// TODO: store this in user session
const PROXY_URL = 'https://huebot.azurewebsites.net/api/command/';

bot.dialog('/', [ 
    function (session, args, next) {
        if (!session.userData.uuid) {
            session.send('Hi! Before I can control your Hue Lights, I will need the UUID displayed by the HueBot Agent.');
            session.beginDialog('/uuid');
        } else {
            next();
        }
    },
    function (session, results) {

        // If we just got the UUID, restart conversation
        if (results.response) session.endConversation('Thanks ! Your UUID is now set.');

        let t = session.message.text;

        switch (t.toLowerCase()) {
            case 'on':
            case 'lights on':
            case 'turn on the lights':
            case 'turn all the lights on':
                session.endConversation("I am turning on the lights !");
                request.post({
                    url: PROXY_URL + session.userData.uuid,
                    json: {command: 'turnAllLightsOn'}
                });
                break;
            case 'off':
            case 'lights off':
            case 'turn off the lights':
            case 'turn all the lights off':
                session.endConversation("I am turning off the lights !");
                request.post({
                    url: PROXY_URL + session.userData.uuid,
                    json: {command: 'turnAllLightsOff'}
                });
                break;
            case 'hi':
            case 'help':
                session.send('Use these commands: on, off, scene.');
                session.endConversation('See you !');
                break;
            case 'uuid':
            case 'what is my uuid':
                session.endConversation('Your UUID is: ' + session.userData.uuid);
                break;
            case 'change my uuid':
                session.beginDialog('/uuid');
                break;
            default:
                if (t.substring(0, 5) == 'scene') {
                    let sceneName = t.split(' ')[1];
                    session.endConversation('I am recalling scene ' + sceneName + ' !');
                    request.post({
                        url: PROXY_URL + session.userData.uuid,
                        json: {command: 'recallScene', scene: sceneName}
                    });
                } else {
                    session.endConversation("Unknown command !");
                }
                break;
        }
    }
]);

bot.dialog('/uuid', [
    function (session) {
        builder.Prompts.text(session, 'Please type in your UUID:');
    },
    function (session, results) {
        session.userData.uuid = results.response;
        session.endDialog();
    }
]);

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
