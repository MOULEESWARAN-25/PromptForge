import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initializing free-tier Gemini API client
const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.1, // low temp for deterministic entity extraction
  maxOutputTokens: 2048,
  maxRetries: 0
});

// Initializing fallback Groq model client
let groqModel = null;
if (process.env.GROQ_API_KEY) {
  try {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      maxRetries: 0
    });
  } catch (err) {
    console.error(`[decomposition] Failed to initialize Groq: ${err.message}`);
  }
}

/**
 * Prompt Decomposition Engine
 * Deconstructs raw prompt text into classified entities and confidence scores.
 */
export async function decomposeRawPrompt(rawPrompt) {
  if (!rawPrompt || !rawPrompt.trim()) {
    return null;
  }

  const systemInstruction = `You are an expert Prompt Decomposition Engine. Your job is to analyze a raw software development prompt and deconstruct it into structured entity classes.

You must output a JSON object containing the classified entities and your prediction confidence scores (from 0.00 to 1.00).

Allowed Modes: 'application' (full-stack), 'page' (SPA layout), or 'component' (single reusable UI control).

Here is the JSON structure you MUST return:
{
  "detected_mode": {
    "value": "application | page | component",
    "confidence": 0.95
  },
  "inferred_app_type": {
    "value": "Student Management Hub | E-Commerce Marketplace | SaaS Dashboard Admin Panel | Custom",
    "confidence": 0.88
  },
  "features": [
    { "name": "Attendance Tracking", "confidence": 0.90 }
  ],
  "pages": [
    { "name": "Dashboard Panel Page", "confidence": 0.85 }
  ],
  "components": [
    { "name": "Shadcn/UI Data Table", "confidence": 0.78 }
  ],
  "theme": {
    "value": "Sleek Dark Glassmorphic | Wes Anderson Retro | Cyberpunk Neon | Brutalist Bold | Minimalist Typography",
    "confidence": 0.60
  },
  "typography": {
    "value": "Inter | Geist | Poppins | Manrope",
    "confidence": 0.50
  },
  "database": [
    { "name": "Attendance Table", "confidence": 0.80 }
  ],
  "security": [
    { "name": "Role-Based Access Control (RBAC)", "confidence": 0.92 }
  ]
}

Ensure your output is strictly valid JSON. Do not include markdown wraps or surrounding text. Correct spelling and map vague terms to their closest professional equivalents (e.g. "studnt averages" -> "Marks Calculation").

FEW-SHOT EXAMPLES:

---
Example 1 (Cross-domain feature addition / RBAC):
User Prompt: "Add RBAC constraints to our existing SaaS layout so that only billing admins can view invoice tables."
Output JSON:
{
  "detected_mode": { "value": "page", "confidence": 0.95 },
  "inferred_app_type": { "value": "SaaS Dashboard Admin Panel", "confidence": 0.90 },
  "features": [
    { "name": "User Access Permissions", "confidence": 0.92 }
  ],
  "pages": [
    { "name": "Billing Settings Portal Page", "confidence": 0.88 },
    { "name": "RBAC Access Configuration Page", "confidence": 0.85 }
  ],
  "components": [
    { "name": "Shadcn/UI Data Table", "confidence": 0.80 }
  ],
  "theme": { "value": "Sleek Dark Glassmorphic", "confidence": 0.75 },
  "typography": { "value": "Inter", "confidence": 0.70 },
  "database": [
    { "name": "Permissions Table", "confidence": 0.85 }
  ],
  "security": [
    { "name": "Role-Based Access Control (RBAC)", "confidence": 0.98 }
  ]
}

---
Example 2 (Realtime service integration):
User Prompt: "Set up a real-time notification hub over our backend endpoints so team members get instant alerts when a ticket status changes."
Output JSON:
{
  "detected_mode": { "value": "application", "confidence": 0.90 },
  "inferred_app_type": { "value": "Task Manager Hub", "confidence": 0.85 },
  "features": [
    { "name": "Real-time Push Notifications", "confidence": 0.95 }
  ],
  "pages": [
    { "name": "Dashboard Panel Page", "confidence": 0.80 }
  ],
  "components": [
    { "name": "Dynamic Toast Alerts UI", "confidence": 0.90 }
  ],
  "theme": { "value": "Sleek Dark Glassmorphic", "confidence": 0.70 },
  "typography": { "value": "Inter", "confidence": 0.65 },
  "database": [
    { "name": "Notifications Table", "confidence": 0.80 }
  ],
  "security": [
    { "name": "Websocket Authentication", "confidence": 0.88 }
  ]
}

---
Example 3 (Database and schema migration):
User Prompt: "Migrate our MySQL relational tables for user orders and invoices to Supabase Postgres, adding check constraints for currency validation."
Output JSON:
{
  "detected_mode": { "value": "application", "confidence": 0.92 },
  "inferred_app_type": { "value": "E-Commerce Marketplace", "confidence": 0.85 },
  "features": [
    { "name": "Stripe Payments Billing Gateway", "confidence": 0.88 }
  ],
  "pages": [
    { "name": "Billing Settings Portal Page", "confidence": 0.80 }
  ],
  "components": [],
  "theme": { "value": "Sleek Dark Glassmorphic", "confidence": 0.60 },
  "typography": { "value": "Inter", "confidence": 0.60 },
  "database": [
    { "name": "Orders Relational Schema", "confidence": 0.95 },
    { "name": "Invoices Schema Model", "confidence": 0.95 }
  ],
  "security": [
    { "name": "Supabase Security Policies", "confidence": 0.90 }
  ]
}
`;

  const messages = [
    new SystemMessage(systemInstruction),
    new HumanMessage(`Decompose this prompt:\n"${rawPrompt}"`)
  ];

  try {
    let content;
    try {
      const response = await geminiModel.invoke(messages);
      content = response.content;
    } catch (geminiError) {
      console.warn(`[decomposition] Gemini model call failed (${geminiError.message}). Trying Groq fallback...`);
      if (groqModel) {
        const response = await groqModel.invoke(messages);
        content = response.content;
      } else {
        throw geminiError;
      }
    }

    const raw = content.trim();
    const cleaned = raw
      .replace(/^```json\r?\n?/, "")
      .replace(/^```\r?\n?/, "")
      .replace(/\r?\n?```$/, "")
      .trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`[decomposition] Error decomposing prompt: ${error.message}`);
    // Safe fallback defaults on parse/API failure
    return {
      detected_mode: { value: "application", confidence: 0.5 },
      inferred_app_type: { value: "Custom", confidence: 0.5 },
      features: [],
      pages: [],
      components: [],
      theme: { value: "Sleek Dark Glassmorphic", confidence: 0.5 },
      typography: { value: "Inter", confidence: 0.5 },
      database: [],
      security: []
    };
  }
}
