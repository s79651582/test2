const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// إعداد Dialogflow
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

app.post('/webhook', async (req, res) => {
  try {
    // قراءة الرسالة من JSON الذي يرسله WhatsAuto
    const { message, sender, group_name, phone } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "لا يوجد رسالة!" });
    }

    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'ar'  // أو 'en' حسب اللغة
        }
      }
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // الرد بنفس الصيغة المطلوبة من WhatsAuto
    return res.json({ reply: result.fulfillmentText || "لا يوجد رد." });

  } catch (error) {
    console.error("Dialogflow Error:", error);
    return res.status(500).json({ reply: "حدث خطأ في الخادم" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));