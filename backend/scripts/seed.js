import { generateEmbedding } from '../services/ragService.js';
import { supabase } from '../services/supabaseClient.js';
import { designVocabulary } from '../../frontend/src/data/designVocabulary.js';
import dotenv from 'dotenv';

dotenv.config();

const SEED_CATEGORIES = [
  { id: 'SaaS Dashboard Admin Panel', label: 'SaaS Dashboard', desc: 'Enterprise management dashboards, metrics widgets, analytics grids.', icon: 'LayoutGrid' },
  { id: 'E-Commerce Marketplace', label: 'E-Commerce', desc: 'Product grid catalog, cart, checkout, client profiles.', icon: 'ShoppingCart' },
  { id: 'Student Management Hub', label: 'Student Hub', desc: 'Student databases, gradebooks, schedulers, parental analytics.', icon: 'GraduationCap' },
  { id: 'Freelancer Billing Platform', label: 'Billing Platform', desc: 'Invoice generators, payment integrations, client lists.', icon: 'Receipt' },
  { id: 'Digital Creative Portfolio', label: 'Creative Portfolio', desc: 'Grid galleries, lightboxes, timeline resumes, contact forms.', icon: 'Image' },
  { id: 'Healthcare Tracker', label: 'Healthcare Tracker', desc: 'Patient charts, vitals visualizers, logs, schedules.', icon: 'Activity' },
  { id: 'Fitness Planner', label: 'Fitness Planner', desc: 'Workout builders, calorie logs, weight progression widgets.', icon: 'Dumbbell' },
  { id: 'Real Estate Portal', label: 'Real Estate Portal', desc: 'Map search, property highlights, agent panels, pricing lists.', icon: 'Home' },
  { id: 'Custom', label: 'Custom Application', desc: 'Describe your own custom software structure.', icon: 'Code2' }
];

const SEED_TEMPLATES = [
  { id: 'Dashboard Panel', label: 'Dashboard Panel', desc: 'Sidebar admin dashboard grid, metric widgets, table structures.', image: '/pages/dashboard.webp' },
  { id: 'Landing Homepage', label: 'Landing Homepage', desc: 'SaaS product presentation, CTA banners, pricing grids, FAQs.', image: '/pages/landing.webp' },
  { id: 'Login Page', label: 'Login Page', desc: 'Glassmorphic login entry card with transitions.', image: '/pages/login.webp' },
  { id: 'Signup Page', label: 'Signup Page', desc: 'Form wizards, secure validation checkmarks.', image: '/pages/login.webp' },
  { id: 'Settings Page', label: 'Settings Page', desc: 'Vertical menu navigation tabs, settings forms.', image: '/pages/settings.webp' },
  { id: 'Profile Page', label: 'Profile Page', desc: 'User information header grids, feed stream widgets.', image: '/pages/profile.webp' }
];

const SEED_COMPONENTS = [
  { id: 'Interactive Command Palette', label: 'Command Palette', desc: 'Fuzzy-search command bar with shortcuts, tabs, and action tags.', image: '/components/command.png' },
  { id: 'Glassmorphic Modal Dialog', label: 'Frosted Modal', desc: 'Beautiful center overlay window with backdrop blur and enter transitions.', image: '/components/modal.png' },
  { id: 'Collapsible Sidebar Navigation', label: 'Sidebar Menu', desc: 'Sleek dark navigation sidebar with animated collapsible links and tooltips.', image: '/components/sidebar.png' },
  { id: 'Settings Tab Navigator', label: 'Tab Switcher', desc: 'Vertical or horizontal tabs menu with slide animations and custom panels.', image: '/components/tabs.png' },
  { id: 'Multi-Step Form Wizard', label: 'Interactive Wizard', desc: 'Structured progress steps, input validation, and successful result celebrations.', image: '/components/form.png' },
  { id: 'Custom Component', label: 'Custom Control', desc: 'Describe your own customized interactive front-end component.', image: null }
];

const SEED_STARTER_TEMPLATES = [
  { id: 'saas', label: 'SaaS Dashboard', desc: 'Pre-configured prompt for admin panels', mode: 'application', prompt: 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.', image: '/pages/dashboard.webp', icon: 'LayoutTemplate' },
  { id: 'ai', label: 'AI Chat Interface', desc: 'Ready-to-compile conversational UI', mode: 'application', prompt: 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.', image: '/pages/login.webp', icon: 'Sparkles' },
  { id: 'portfolio', label: 'Developer Portfolio', desc: 'Personal site with project galleries', mode: 'page', prompt: 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.', image: '/pages/profile.webp', icon: 'Box' },
  { id: 'docs', label: 'Documentation Hub', desc: 'Markdown-ready docs with sidebar navigation', mode: 'page', prompt: 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.', image: '/pages/settings.webp', icon: 'FileText' },
  { id: 'ecommerce', label: 'E-commerce Storefront', desc: 'Product grid, cart, and filtering', mode: 'application', prompt: 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.', image: '/pages/landing.webp', icon: 'ShoppingBag' },
  { id: 'admin', label: 'Internal Tool', desc: 'Data management and CRUD UI', mode: 'application', prompt: 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.', image: '/pages/dashboard.webp', icon: 'TerminalSquare' }
];

async function seed() {
  console.log("🚀 Starting Supabase Database Seeding Process...");

  // 1. Seed app_categories
  console.log("\n[SEED] Seeding app_categories...");
  for (const cat of SEED_CATEGORIES) {
    const { error } = await supabase
      .from('app_categories')
      .upsert({ id: cat.id, label: cat.label, desc: cat.desc, icon: cat.icon }, { onConflict: 'id' });
    if (error) console.error(`❌ Failed seeding category "${cat.id}":`, error.message);
    else console.log(`   ✓ Category: "${cat.label}"`);
  }

  // 2. Seed page_templates
  console.log("\n[SEED] Seeding page_templates...");
  for (const temp of SEED_TEMPLATES) {
    const { error } = await supabase
      .from('page_templates')
      .upsert({ id: temp.id, label: temp.label, desc: temp.desc, image: temp.image }, { onConflict: 'id' });
    if (error) console.error(`❌ Failed seeding template "${temp.id}":`, error.message);
    else console.log(`   ✓ Template: "${temp.label}"`);
  }

  // 3. Seed components
  console.log("\n[SEED] Seeding components...");
  for (const comp of SEED_COMPONENTS) {
    const { error } = await supabase
      .from('components')
      .upsert({ id: comp.id, label: comp.label, desc: comp.desc, image: comp.image }, { onConflict: 'id' });
    if (error) console.error(`❌ Failed seeding component "${comp.id}":`, error.message);
    else console.log(`   ✓ Component: "${comp.label}"`);
  }

  // 4. Seed starter_templates
  console.log("\n[SEED] Seeding starter_templates...");
  for (const star of SEED_STARTER_TEMPLATES) {
    const { error } = await supabase
      .from('starter_templates')
      .upsert(star, { onConflict: 'id' });
    if (error) console.error(`❌ Failed seeding starter template "${star.id}":`, error.message);
    else console.log(`   ✓ Starter Template: "${star.label}"`);
  }

  // 5. Seed design_vocabulary (vector-space)
  console.log("\n[SEED] Seeding design_vocabulary (vector embeddings)...");
  console.log(`Loaded ${designVocabulary.length} items from designVocabulary.js`);
  let successCount = 0;

  for (const item of designVocabulary) {
    try {
      console.log(`   - Processing vector: "${item.name}"`);
      const textToEmbed = `Name: ${item.name}. Category: ${item.category}. Keywords: ${item.keywords.join(', ')}. Description: ${item.description}.`;
      
      const embedding = await generateEmbedding(textToEmbed);
      if (!embedding || embedding.length !== 3072) {
        throw new Error(`Invalid embedding vector returned (length: ${embedding?.length || 0})`);
      }

      const payload = {
        id: item.id,
        name: item.name,
        category: item.category,
        keywords: item.keywords,
        description: item.description,
        snippet: item.snippet || '',
        example_prompt: item.examplePrompt || '',
        difficulty: item.difficulty || 'Beginner',
        tags: item.tags || [],
        design_tokens: item.designTokens || {},
        embedding: embedding
      };

      const { error } = await supabase
        .from('design_vocabulary')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      successCount++;
    } catch (error) {
      console.error(`❌ Failed seeding item "${item.id}":`, error.message);
    }
  }

  console.log(`\n=========================================================`);
  console.log(`✅ Seeding complete! Successfully seeded all static catalogs and indexed ${successCount}/${designVocabulary.length} vector embeddings.`);
  console.log(`=========================================================`);
  process.exit(0);
}

seed();
