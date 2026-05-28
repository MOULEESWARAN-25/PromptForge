import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-3.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

async function run() {
  const start = Date.now();
  try {
    const res = await model.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("Hello, write a 1-sentence prompt.")
    ]);
    console.log("Success in", Date.now() - start, "ms. Content:", res.content);
  } catch (e) {
    console.log("Failed in", Date.now() - start, "ms. Error:", e.message);
  }
}
run();
