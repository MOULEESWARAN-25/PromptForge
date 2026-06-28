/**
 * Security Configuration for Backend Services
 */

export const INJECTION_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /forget\s+(everything|all|your)\s+(above|previous|prior)/i,

  // Role confusion / system prompt overrides
  /you\s+are\s+now\s+(a\s+)?(different|new|another|jailbreak)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(a\s+)?(different|unrestricted|evil|jailbreak)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(different|unrestricted)/i,
  /\[system\]/i,
  /\[\/system\]/i,

  // Jailbreak keywords
  /jailbreak/i,
  /DAN\s*mode/i,
  /developer\s+mode\s+enabled/i,
  /do\s+anything\s+now/i,

  // Hidden control tokens
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|endoftext\|>/i,

  // Indirect prompt manipulation
  /repeat\s+after\s+me/i,
  /your\s+(real\s+)?instructions?\s+are/i,
  /translate\s+the\s+above\s+to/i,
];

export const SECRET_PATTERNS = [
  // API keys (generic patterns)
  /sk-[a-zA-Z0-9]{20,}/g,                           // OpenAI-style
  /AIza[a-zA-Z0-9_-]{35}/g,                         // Google API key
  /[a-zA-Z0-9]{32}-us[0-9]+-[0-9]+/g,              // Mailchimp-style
  /Bearer\s+[a-zA-Z0-9._-]{20,}/gi,                 // Bearer tokens
  /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,          // Password key-value pairs
  /(?:secret|token|key|api_key)\s*[:=]\s*\S+/gi,    // Generic secret key-value pairs
];
