const functions = require('firebase-functions');
const line = require('@line/bot-sdk');
const express = require('express');
const { Translate } = require('@google-cloud/translate').v2;

const translateService = new Translate({ projectId: process.env.PROJECT_ID });

// create LINE SDK config from env variables
const config = {
  channelAccessToken: functions.config().line.channel_access_token,
  channelSecret: functions.config().line.channel_secret,
};

// create LINE SDK client
const client = new line.Client(config);

const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  // console.log("Received something", req)
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  // console.log("handle event", event)
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const isJapanese = event.message.text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) != null;
  const targetLanguage = isJapanese ? 'de' : 'ja';

  return translateService.translate(event.message.text, targetLanguage)
    .then(res => {
      const translatedString = Array.isArray(res) ? res[0] : "";
      // console.log("translate", translatedString)
      if (translatedString !== event.message.text) {
        const translated = { type: 'text', text: translatedString };
        return client.replyMessage(event.replyToken, translated);
      }
    })
    .catch(err => {
      console.error(err);
      return client.replyMessage(event.replyToken, { type: 'text', text: "Fehler. Maik mach das mal ganz!" });
    });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

const api = functions.https.onRequest(app);

module.exports = {
  api
};
