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
const UUID = '001788fffe09ff3c-SytarAfJSr2talYJE-fuSc9D6s1hbgzBe9dEqxd0';
const PROXY_URL = 'https://huebot.azurewebsites.net/api/command/' + UUID;

bot.dialog('/', function (session, args, next) {
    let t = session.message.text.toLowerCase();
    switch (t) {
        case 'on':
        case 'allume':
        case 'allume toutes les lumières':
        case 'allume les lumières':
            session.send("J'allume les lumières !");
            request.post({
                url: PROXY_URL,
                json: {command: 'turnAllLightsOn'}
            });
            break;
        case 'off':
        case 'éteint':
        case 'éteint toutes les lumières':
        case 'éteint les lumières':
            session.send("J'éteins les lumières !");
            request.post({
                url: PROXY_URL,
                json: {command: 'turnAllLightsOff'}
            });
            break;
        case 'tu es bête':
            session.send('Et toi tu es débile !');
            break;
        default:
            if (t.substring(0, 5) == 'scene') {
                let sceneName = t.split(' ')[1];
                session.send('Je rappelle la scène ' + sceneName + ' !');
                request.post({
                    url: PROXY_URL,
                    json: {command: 'recallScene', scene: sceneName}
                });
            } else {
                session.send("Commande inconnue !");
            }
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
