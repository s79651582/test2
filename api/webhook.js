import { v4 as uuidv4 } from "uuid";
import dialogflow from "@google-cloud/dialogflow";

// ====== استدعاء المتغيرات من Vercel Environment ======
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

const sessionClient = new dialogflow.SessionsClient({
  projectId,
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

// ====== Vercel Serverless Function ======
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      uuidv4()
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "ar", // أو "en"
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return res.status(200).json({
      reply: result.fulfillmentText || "لم يتم العثور على رد",
    });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
