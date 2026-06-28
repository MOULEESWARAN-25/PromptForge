import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamically loads a versioned prompt template from the prompts folder and strips YAML frontmatter metadata.
 */
export function loadPromptTemplate(subfolder, filename) {
  try {
    const templatePath = path.resolve(__dirname, `../prompts/${subfolder}/${filename}`);
    if (fs.existsSync(templatePath)) {
      const raw = fs.readFileSync(templatePath, "utf-8");
      // Strip YAML frontmatter block if present
      const clean = raw.replace(/^---[\s\S]*?---/, "").trim();
      return clean;
    }
  } catch (err) {
    console.error(`[promptAssembler] Failed to load prompt template ${subfolder}/${filename}: ${err.message}`);
  }
  return "";
}

/**
 * Dedicated Prompt Assembler Service
 * Decouples prompt template formatting, variables substitution, and validation rules injection.
 */
export class PromptAssembler {
  /**
   * Assembles a structured markdown prompt specification from retrieved resources.
   *
   * @param {object} params
   * @param {string} params.baseTemplate - The raw generation template
   * @param {string} params.blueprint - The structured JSON blueprint compiled to markdown
   * @param {string} params.context - Retrieved Knowledge Graph entities, conversation histories
   * @param {string} params.a11yBlock - Accessibility constraints and guidelines
   * @param {object} params.themeDetails - Visual design tokens and spacing variables
   * @param {string} params.framework - Active front-end framework name (e.g. "Tailwind CSS")
   */
  static assemble({
    baseTemplate,
    blueprint,
    context,
    a11yBlock,
    themeDetails,
    framework
  }) {
    let system = baseTemplate;

    // Inject retrieved context & accessibility requirements
    system = system.replace("${context}", context || "No database design guides retrieved.");
    system = system.replace("${a11yBlock}", a11yBlock || "");

    if (themeDetails) {
      system += `\nTheme Selection: **${themeDetails.name}** (${themeDetails.keywords}). ${themeDetails.description}\n`;
    }
    if (framework) {
      system += `\nTarget Framework: ${framework}. Adhere to its standard patterns and layout wrappers.\n`;
    }

    return {
      systemInstruction: system,
      userMessage: `Generate prompt spec based on the blueprint:\n${blueprint}`
    };
  }
}
