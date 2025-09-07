import { v4 as uuidv4 } from "uuid";
import dialogflow from "@google-cloud/dialogflow";

// ====== استدعاء المتغيرات من Vercel Environment ======
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// ====== إنشاء جلسة Dialogflow ======
const sessionClient = new dialogflow.SessionsClient({
  credentials: credentials,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // إنشاء session ID
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      uuidv4()
    );

    // إرسال النص إلى Dialogflow
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "ar", // أو en إذا محادثة بالإنجليزية
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // إعادة الرد بصيغة WhatsAuto
    return res.status(200).json({
      reply: result.fulfillmentText || "لم يتم العثور على رد",
    });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
