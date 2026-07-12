import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import { supabase } from './services/supabaseClient.js';
import { telemetryService } from './services/telemetryService.js';
import { themeStyles } from './services/themeData.js';
import { CACHE_CONFIG } from './config/cache.js';

// Import upgraded Prompt Intelligence services
import { compileDeterministicQuery } from './services/queryCompiler.js';
import { decomposeRawPrompt } from './services/decompositionEngine.js';
import { runContextIsolatedRetrieval } from './services/retrievalService.js';
import { buildPromptContext } from './services/contextBuilder.js';
import { runPromptEnhancerAgent, validateManualDescription } from './services/agentService.js';
import { buildBlueprint } from './services/blueprintBuilder.js';
import { validateBlueprintV1 } from './services/blueprintValidator.js';
import { compileBlueprintToPrompt } from './services/promptCompiler.js';

// Import Observability metrics services
import {
  getObservabilitySummary,
  getObservabilityAnalytics,
  getObservabilityGaps,
  getObservabilityTrends,
  getObservabilityIntegrity,
  getObservabilityAbComparison
} from './services/observabilityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PRODUCTION || 'https://veyntra.vercel.app',
  'https://veyntra.vercel.app',
  'https://www.veyntra.vercel.app',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Support Google Chrome's Private Network Access (PNA) preflight requirements
app.use((req, res, next) => {
  if (req.headers['access-control-request-private-network'] === 'true') {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

// Enable CORS for the Next.js frontend and JSON parsing
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Enforce Secure HTTP Response Headers & Content Security Policy (CSP)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Allow safe inline styles/scripts and connections to model endpoints and Supabase
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: http: ws: wss:;");
  next();
});

// Initialize Express Router for versioned routes
const apiRouter = express.Router();

// Enveloping & Request ID Middleware
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  // Wrap res.json
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object' && ('requestId' in body)) {
      return originalJson.call(this, body);
    }

    const isError = res.statusCode >= 400 || (body && (body.error || body.errors));
    const status = isError ? 'error' : 'success';
    
    const enveloped = {
      status,
      message: isError ? (body?.error || body?.message || 'Request failed') : 'Request succeeded',
      data: isError ? null : body,
      error: isError ? (body?.error || body?.message || 'Error occurred') : null,
      errorCode: body?.errorCode || null,
      timestamp: new Date().toISOString(),
      requestId
    };

    if (body?.validationScore !== undefined) {
      enveloped.validationScore = body.validationScore;
    }
    if (body?.errors !== undefined) {
      enveloped.errors = body.errors;
    }
    if (body?.warnings !== undefined) {
      enveloped.warnings = body.warnings;
    }
    if (body?.prompt !== undefined) {
      enveloped.prompt = body.prompt;
    }
    if (body?.ragDetails !== undefined) {
      enveloped.ragDetails = body.ragDetails;
    }
    if (body?.source !== undefined) {
      enveloped.source = body.source;
    }

    return originalJson.call(this, enveloped);
  };

  req.log = (message, level = 'info') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [req:${requestId}] ${message}`);
  };

  console.log(`[${new Date().toISOString()}] [INFO] [req:${requestId}] ${req.method} ${req.originalUrl || req.url}`);

  next();
});

// Visual styles catalog for prompt references
const localThemeStyles = themeStyles || {
  "Sleek Dark Glassmorphic": {
    name: "Sleek Dark Glassmorphic",
    description: "Deep obsidian backdrops, frosted semi-transparent containers, neon-violet glow highlights, and minimal card borders.",
    keywords: "glassmorphism, dark obsidian background, backdrop-filter blur, subtle neon border glow, premium dark mode, rich transparency effects"
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), service: 'Veyntra RAG Agent Server' });
});

// ==========================================
// OBSERVABILITY & ANALYTICS DASHBOARD API
// ==========================================

apiRouter.get('/observability/summary', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const summary = await getObservabilitySummary();
    res.json(summary);
  } catch (error) {
    console.error(`[observability] Summary endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve observability summary' });
  }
});

apiRouter.get('/observability/analytics', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const analytics = await getObservabilityAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error(`[observability] Analytics endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve observability analytics' });
  }
});

apiRouter.get('/observability/gaps', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      type: req.query.type,
      limit: req.query.limit
    };
    const gaps = await getObservabilityGaps(filters);
    res.json(gaps);
  } catch (error) {
    console.error(`[observability] Gaps endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve knowledge gaps list' });
  }
});

apiRouter.get('/observability/trends', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const trends = await getObservabilityTrends();
    res.json(trends);
  } catch (error) {
    console.error(`[observability] Trends endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve historical trends' });
  }
});

apiRouter.get('/observability/integrity', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const integrity = await getObservabilityIntegrity();
    res.json(integrity);
  } catch (error) {
    console.error(`[observability] Integrity endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve graph integrity validation' });
  }
});

apiRouter.get('/observability/ab_comparison', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    const comparison = await getObservabilityAbComparison();
    res.json(comparison);
  } catch (error) {
    console.error(`[observability] A/B comparison endpoint failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve A/B benchmark comparison metrics' });
  }
});

// System Status & Observability Telemetry Stats
apiRouter.get('/telemetry/stats', async (req, res) => {
  try {
    const stats = await telemetryService.getStats();
    res.json(stats);
  } catch (error) {
    console.error(`[telemetry] Stats retrieval failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve telemetry stats' });
  }
});

// Helper function for context isolation check
function getAllowedKbTypes(mode) {
  const cleanMode = (mode || '').toLowerCase();
  switch (cleanMode) {
    case 'component':
      return ['component', 'common'];
    case 'page':
    case 'spa':
      return ['spa', 'component', 'common'];
    case 'application':
    case 'fullstack':
      return ['fullstack', 'spa', 'component', 'common'];
    default:
      return ['common'];
  }
}

// Resolve the effective knowledge base type for telemetry metrics
function getEffectiveKbType(ent) {
  if (ent.kb_type) return ent.kb_type;
  const commonCategories = [
    'product strategy', 'ux & design', 'frontend development', 
    'visual design style', 'animation & motion', 'layout', 
    'theme', 'typography', 'visual style', 'wizard_step'
  ];
  const cat = (ent.category || '').toLowerCase();
  if (commonCategories.includes(cat)) {
    return 'common';
  }
  if (cat === 'component') return 'component';
  if (cat === 'page' || cat === 'spa') return 'spa';
  if (cat === 'application' || cat === 'fullstack') return 'fullstack';
  return ent.category || 'common';
}


// Helper function to determine overall status based on KPI thresholds
function determineOverallStatus(avgPromptScore, patchRate, coverageScore, leakageRate) {
  if (avgPromptScore < 80 || patchRate > 20 || coverageScore < 60 || leakageRate > 0) {
    return 'critical';
  }
  if (avgPromptScore <= 90 || patchRate >= 10 || coverageScore <= 80) {
    return 'warning';
  }
  return 'healthy';
}

// Lightweight metrics health endpoint for automated monitoring & dashboards
apiRouter.get('/metrics/health', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    // 1. Try to fetch the latest daily snapshot from knowledge_metrics_daily
    const { data: latestDaily, error: dailyErr } = await supabase
      .from('knowledge_metrics_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!dailyErr && latestDaily) {
      const totalGens = latestDaily.total_generations;
      const patchRate = totalGens > 0
        ? parseFloat(((latestDaily.patch_count / totalGens) * 100).toFixed(1))
        : 0.0;

      // Calculate context leakage rate by querying the runs for this date
      let contextLeakageRate = 0.0;
      try {
        const startOfDay = `${latestDaily.date}T00:00:00.000Z`;
        const endOfDay = `${latestDaily.date}T23:59:59.999Z`;
        const { data: runs } = await supabase
          .from('prompt_history')
          .select('rag_details, mode')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay)
          .eq('engine_version', 'phase2')
          .eq('telemetry_source', 'production');

        if (runs && runs.length > 0) {
          let leakCount = 0;
          runs.forEach(run => {
            const rag = run.rag_details;
            if (rag && Array.isArray(rag.results)) {
              let hasLeakage = false;
              rag.results.forEach(ent => {
                const entityKbType = getEffectiveKbType(ent);
                const allowedKbTypes = getAllowedKbTypes(run.mode);
                if (entityKbType && !allowedKbTypes.includes(entityKbType)) {
                  hasLeakage = true;
                }
              });
              if (hasLeakage) leakCount++;
            }
          });
          contextLeakageRate = parseFloat(((leakCount / runs.length) * 100).toFixed(1));
        }
      } catch (err) {
        console.warn(`[metrics/health] Failed computing leak rate from telemetry, defaulting: ${err.message}`);
      }

      const avgPromptScore = Number(latestDaily.avg_prompt_score);
      const coverageScore = Number(latestDaily.avg_coverage_score);
      const status = determineOverallStatus(avgPromptScore, patchRate, coverageScore, contextLeakageRate);

      return res.json({
        status,
        avg_prompt_score: avgPromptScore,
        patch_rate: patchRate,
        coverage_score: coverageScore,
        context_leakage_rate: contextLeakageRate,
        total_generations: totalGens,
        aggregation_date: latestDaily.date
      });
    }

    // 2. Fall back to calculating metrics from prompt_history directly for the last 7 days
    console.log("[metrics/health] Daily metrics snapshot table empty or missing. Falling back to raw telemetry query.");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: rawRuns, error: rawErr } = await supabase
      .from('prompt_history')
      .select('rag_details, mode')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('engine_version', 'phase2')
      .eq('telemetry_source', 'production');

    if (!rawErr && rawRuns && rawRuns.length > 0) {
      let scoreSum = 0;
      let scoreCount = 0;
      let patchCount = 0;
      let leakCount = 0;
      const totalGens = rawRuns.length;

      rawRuns.forEach(run => {
        const rag = run.rag_details;
        if (rag) {
          if (typeof rag.final_score === 'number') {
            scoreSum += rag.final_score;
            scoreCount++;
          }
          if (rag.patch_triggered === true) {
            patchCount++;
          }
          if (Array.isArray(rag.results)) {
            let hasLeakage = false;
            rag.results.forEach(ent => {
              const entityKbType = getEffectiveKbType(ent);
              const allowedKbTypes = getAllowedKbTypes(run.mode);
              if (entityKbType && !allowedKbTypes.includes(entityKbType)) {
                hasLeakage = true;
              }
            });
            if (hasLeakage) {
              leakCount++;
            }
          }
        }
      });

      const avgPromptScore = scoreCount > 0 ? parseFloat((scoreSum / scoreCount).toFixed(1)) : 90.0;
      const patchRate = totalGens > 0 ? parseFloat(((patchCount / totalGens) * 100).toFixed(1)) : 0.0;
      const leakageRate = totalGens > 0 ? parseFloat(((leakCount / totalGens) * 100).toFixed(1)) : 0.0;
      const coverageScore = 80.0;
      const status = determineOverallStatus(avgPromptScore, patchRate, coverageScore, leakageRate);

      return res.json({
        status,
        avg_prompt_score: avgPromptScore,
        patch_rate: patchRate,
        coverage_score: coverageScore,
        context_leakage_rate: leakageRate,
        total_generations: totalGens,
        aggregation_date: new Date().toISOString().split('T')[0]
      });
    }

    // 3. Ultimate baseline fallback if database has no prompt history runs
    return res.json({
      status: "healthy",
      avg_prompt_score: 90.0,
      patch_rate: 0.0,
      coverage_score: 80.0,
      context_leakage_rate: 0.0,
      total_generations: 0,
      aggregation_date: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error(`[metrics/health] Failed to compile health metrics: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve metrics health status' });
  }
});

// Dynamic Vocabulary List
apiRouter.get('/vocabulary', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.vocabulary}`);
  try {
    const { data, error } = await supabase
      .from('design_vocabulary')
      .select('id, name, category, keywords, description, snippet, example_prompt, difficulty, tags, design_tokens');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(`[vocabulary] Retrieval failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve design vocabulary' });
  }
});

// Vocabulary and History Telemetry Stats
apiRouter.get('/vocabulary/stats', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.search}`);
  try {
    // Fetch total specifications compiled from prompt_history
    const historyCountPromise = supabase
      .from('prompt_history')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total design patterns from design_vocabulary
    const vocabCountPromise = supabase
      .from('design_vocabulary')
      .select('*', { count: 'exact', head: true });

    const [historyRes, vocabRes] = await Promise.all([historyCountPromise, vocabCountPromise]);
    
    res.json({
      total_specifications_compiled: historyRes.error ? 12400 : (historyRes.count || 0),
      total_design_patterns: vocabRes.error ? 60 : (vocabRes.count || 0),
      ai_tools_supported: 8
    });
  } catch (error) {
    console.error(`[vocabulary/stats] Stats retrieval failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve global stats' });
  }
});

// Local emergency fallback cache definitions
const emergencyCategories = {
  APP_CATEGORIES: [
    { id: 'SaaS Dashboard Admin Panel', label: 'SaaS Dashboard', desc: 'Enterprise management dashboards, metrics widgets, analytics grids.', icon: 'LayoutGrid' },
    { id: 'E-Commerce Marketplace', label: 'E-Commerce', desc: 'Product grid catalog, cart, checkout checkout, client profiles.', icon: 'ShoppingCart' },
    { id: 'Student Management Hub', label: 'Student Hub', desc: 'Student databases, gradebooks, schedulers, parental analytics.', icon: 'GraduationCap' },
    { id: 'Freelancer Billing Platform', label: 'Billing Platform', desc: 'Invoice generators, payment integrations, client lists.', icon: 'Receipt' },
    { id: 'Digital Creative Portfolio', label: 'Creative Portfolio', desc: 'Grid galleries, lightboxes, timeline resumes, contact forms.', icon: 'Image' },
    { id: 'Healthcare Tracker', label: 'Healthcare Tracker', desc: 'Patient charts, vitals visualizers, logs, schedules.', icon: 'Activity' },
    { id: 'Fitness Planner', label: 'Fitness Planner', desc: 'Workout builders, calorie logs, weight progression widgets.', icon: 'Dumbbell' },
    { id: 'Real Estate Portal', label: 'Real Estate Portal', desc: 'Map search, property highlights, agent panels, pricing lists.', icon: 'Home' },
    { id: 'Custom', label: 'Custom Application', desc: 'Describe your own custom software structure.', icon: 'Code2' }
  ],
  CATEGORY_FEATURES: {
    'SaaS Dashboard Admin Panel': ['KPI Metric Cards', 'Interactive Charts', 'Data Tables & Filters', 'User Role Permissions', 'Activity Logs', 'Dark Mode Toggle', 'CSV/PDF Data Export', 'Collapsible Sidebar'],
    'E-Commerce Marketplace': ['Product Search & Filter', 'Shopping Cart & Checkout', 'Product Detail Gallery', 'Customer Reviews', 'Order Tracking Dashboard', 'Stripe Payment Integration', 'Wishlist Page'],
    'Student Management Hub': ['Student Directory', 'Grades & Performance Analytics', 'Attendance Tracker', 'Course Scheduler', 'Teacher Portal', 'Parent Notifications', 'Assignment Submit Area'],
    'Freelancer Billing Platform': ['Invoice Generator', 'Client Contact Manager', 'Payment Status Dashboard', 'Time Tracker Widget', 'Recurring Subscriptions', 'Stripe/PayPal Integration', 'Expense Reports'],
    'Digital Creative Portfolio': ['Filterable Project Grid', 'Image/Video Lightbox', 'About Me Hero Page', 'Contact Form with Validation', 'Interactive Resume Timeline', 'Social Media Integration', 'Testimonial Slider'],
    'Healthcare Tracker': ['Appointment Scheduler', 'Patient Medical Records', 'Prescription Tracker', 'Vitals Metric Cards', 'Doctor Chat Interface', 'Wearable Sync Dashboard', 'Health Goals Tracker'],
    'Fitness Planner': ['Workout Builder', 'Calorie Counter Dashboard', 'Weight Progress Graph', 'Exercise Video Library', 'Weekly Routine Planner', 'Achievement Badges', 'Water Intake Tracker'],
    'Real Estate Portal': ['Interactive Map Search', 'Property Detail Carousel', 'Mortgage Calculator', 'Agent Contact Panel', 'Filter Criteria (Price, Beds)', 'Virtual Tour Link Showcase', 'Saved Searches'],
    'Custom': ['User Authentication', 'Database API Connect', 'CRUD Action Panel', 'Responsive Grid Layout', 'Dark Mode Toggle', 'Email Notifications', 'Interactive Dashboard Panels', 'Activity Stream Log']
  },
  AI_FEATURE_SUGGESTIONS: {
    'SaaS Dashboard Admin Panel': ['Multi-tenant Architecture', 'Webhook Integrations', 'Audit Logging', 'API Key Management', 'Custom Themes', 'Two-Factor Authentication (2FA)'],
    'E-Commerce Marketplace': ['Abandoned Cart Recovery', 'AI Product Recommendations', 'Dynamic Pricing', 'Social Proof Popups', 'Multi-currency Support', 'Subscription Orders'],
    'Student Management Hub': ['Automated Grading', 'Plagiarism Checker Integration', 'Video Classroom', 'Gamified Badges', 'Alumni Network', 'Behavioral Insights'],
    'Freelancer Billing Platform': ['Automated Tax Calculation', 'Contract E-Signatures', 'Multi-currency Invoicing', 'Client Portal', 'Late Fee Automation'],
    'Digital Creative Portfolio': ['3D Asset Viewer', 'Password Protected Galleries', 'Notion-like Blog', 'Client Feedback Comments', 'Custom Domain Setup'],
    'Healthcare Tracker': ['Telemedicine Video Chat', 'HL7/FHIR Integration', 'Symptom Checker AI', 'Medication Reminders', 'Secure Document Vault'],
    'Fitness Planner': ['Strava/Apple Health Sync', 'AI Workout Generator', 'Meal Plan Builder', 'Macro Calculator', 'Community Challenges'],
    'Real Estate Portal': ['3D Virtual Tours', 'Neighborhood Crime Stats', 'Automated Valuation Model', 'Agent Lead Routing', 'Rent Payment Portal'],
    'Custom': ['AI Content Generation', 'Real-time WebSockets', 'OAuth2 Social Login', 'Stripe Subscriptions', 'Analytics Dashboard', 'File Upload AWS S3']
  }
};

const emergencyTemplates = {
  PAGE_TYPES: [
    { id: 'Dashboard Panel', label: 'Dashboard Panel', desc: 'Sidebar admin dashboard grid, metric widgets, table structures.', image: '/pages/dashboard.webp' },
    { id: 'Landing Homepage', label: 'Landing Homepage', desc: 'SaaS product presentation, CTA banners, pricing grids, FAQs.', image: '/pages/landing.webp' },
    { id: 'Login Page', label: 'Login Page', desc: 'Glassmorphic login entry card with transitions.', image: '/pages/login.webp' },
    { id: 'Signup Page', label: 'Signup Page', desc: 'Form wizards, secure validation checkmarks.', image: '/pages/login.webp' },
    { id: 'Settings Page', label: 'Settings Page', desc: 'Vertical menu navigation tabs, settings forms.', image: '/pages/settings.webp' },
    { id: 'Profile Page', label: 'Profile Page', desc: 'User information header grids, feed stream widgets.', image: '/pages/profile.webp' }
  ],
  PAGE_COMPONENTS: {
    'Dashboard Panel': ['Collapsible Sidebar', 'KPI Metric Cards', 'Sortable Data Table', 'Command Palette (Cmd+K)', 'Skeleton Shimmer Loaders', 'Toast Notifications', 'Quick Stats Charts'],
    'Landing Homepage': ['Hero CTA Section', 'Bento Grid Features', 'Client Logo Marquee Ticker', 'Testimonial Carousel', 'Accordion FAQ Collapsible', 'Floating Bottom Nav', 'Interactive Video Showcase'],
    'Login Page': ['Glassmorphism Entry Card', 'Floating Input Labels', 'OTP Verification Code Input', 'Spring Scale Checkmark Bounces', 'Switch Mode Toggle', 'Error Validation States'],
    'Signup Page': ['Multi-step Registration Form', 'Password Strength Estimator', 'Terms of Service Checkbox', 'Oauth Social Logins', 'Success Animation Screen', 'Email Verification Code'],
    'Settings Page': ['Vertical Tab Navigation', 'Profile Avatar Uploader', 'Toggle Notification Switches', 'API Key Management Board', 'Danger Zone Deactivation Card', 'Preferences Form'],
    'Profile Page': ['User Profile Header', 'Activity Stream Feed', 'Follower/Connection Stats', 'Editable Contact Details', 'Bio Summary Box', 'Recent Uploads Gallery', 'Social Media Links']
  }
};

const emergencyComponents = {
  COMPONENT_TYPES: [
    { id: 'Interactive Command Palette', label: 'Command Palette', desc: 'Fuzzy-search command bar with shortcuts, tabs, and action tags.', image: '/components/command.png' },
    { id: 'Glassmorphic Modal Dialog', label: 'Frosted Modal', desc: 'Beautiful center overlay window with backdrop blur and enter transitions.', image: '/components/modal.png' },
    { id: 'Collapsible Sidebar Navigation', label: 'Sidebar Menu', desc: 'Sleek dark navigation sidebar with animated collapsible links and tooltips.', image: '/components/sidebar.png' },
    { id: 'Settings Tab Navigator', label: 'Tab Switcher', desc: 'Vertical or horizontal tabs menu with slide animations and custom panels.', image: '/components/tabs.png' },
    { id: 'Multi-Step Form Wizard', label: 'Interactive Wizard', desc: 'Structured progress steps, input validation, and successful result celebrations.', image: '/components/form.png' },
    { id: 'Custom Component', label: 'Custom Control', desc: 'Describe your own customized interactive front-end component.', image: null }
  ]
};

const emergencyStarterTemplates = [
  { id: 'saas', label: 'SaaS Dashboard', desc: 'Pre-configured prompt for admin panels', mode: 'application', prompt: 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.', image: '/pages/dashboard.webp', icon: 'LayoutTemplate' },
  { id: 'ai', label: 'AI Chat Interface', desc: 'Ready-to-compile conversational UI', mode: 'application', prompt: 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.', image: '/pages/login.webp', icon: 'Sparkles' },
  { id: 'portfolio', label: 'Developer Portfolio', desc: 'Personal site with project galleries', mode: 'page', prompt: 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.', image: '/pages/profile.webp', icon: 'Box' },
  { id: 'docs', label: 'Documentation Hub', desc: 'Markdown-ready docs with sidebar navigation', mode: 'page', prompt: 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.', image: '/pages/settings.webp', icon: 'FileText' },
  { id: 'ecommerce', label: 'E-commerce Storefront', desc: 'Product grid, cart, and filtering', mode: 'application', prompt: 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.', image: '/pages/landing.webp', icon: 'ShoppingBag' },
  { id: 'admin', label: 'Internal Tool', desc: 'Data management and CRUD UI', mode: 'application', prompt: 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.', image: '/pages/dashboard.webp', icon: 'TerminalSquare' }
];

// Endpoints for Dynamic Metadata
apiRouter.get('/forge/categories', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.categories}`);
  try {
    const { data, error } = await supabase.from('app_categories').select('*');
    if (error || !data || data.length === 0) {
      return res.json(emergencyCategories);
    }
    res.json(data);
  } catch (err) {
    res.json(emergencyCategories);
  }
});

apiRouter.get('/forge/templates', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.templates}`);
  try {
    const { data, error } = await supabase.from('page_templates').select('*');
    if (error || !data || data.length === 0) {
      return res.json(emergencyTemplates);
    }
    res.json(data);
  } catch (err) {
    res.json(emergencyTemplates);
  }
});

apiRouter.get('/forge/components', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.components}`);
  try {
    const { data, error } = await supabase.from('components').select('*');
    if (error || !data || data.length === 0) {
      return res.json(emergencyComponents);
    }
    res.json(data);
  } catch (err) {
    res.json(emergencyComponents);
  }
});

apiRouter.get('/forge/starter-templates', async (req, res) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.ttls.templates}`);
  try {
    const { data, error } = await supabase.from('starter_templates').select('*');
    if (error || !data || data.length === 0) {
      return res.json(emergencyStarterTemplates);
    }
    res.json(data);
  } catch (err) {
    res.json(emergencyStarterTemplates);
  }
});

/**
 * Main prompt architect and generator endpoint (grounded by Relational Knowledge Graph)
 */
apiRouter.post('/forge', async (req, res) => {
  const {
    mode,
    query,
    theme,
    category,
    pageType,
    components = [],
    componentName,
    history = [],
    codebaseContext,
    framework,
    modelProvider = 'gemini',
    // Expanded Project Setup metadata from front-end
    projectName,
    projectDescription,
    frontendStack,
    backendStack,
    database,
    authOption,
    deployment,
    additionalFeatures = [],
    projectIntegration = 'new'
  } = req.body;

  if (!query && mode !== 'enhance') {
    return res.status(400).json({ error: 'Description query or raw prompt is required' });
  }

  const startTime = Date.now();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  try {
    let activeMode = mode;
    let decomposed = null;
    let activeTheme = theme;
    let activeTypography = req.body.typography || 'Inter';

    // ==========================================
    // STAGE 0: PROMPT DECOMPOSITION (ENHANCE MODE)
    // ==========================================
    if (activeMode === 'enhance') {
      console.log("[api/forge] Enhance Prompt Mode detected. Decomposing raw text...");
      decomposed = await decomposeRawPrompt(query);
      if (decomposed && decomposed.detected_mode && decomposed.detected_mode.confidence > 0.75) {
        activeMode = decomposed.detected_mode.value;
        console.log(`[api/forge] Dynamic mode classification aligned to: [${activeMode}] (Confidence: ${decomposed.detected_mode.confidence})`);
      }
      if (decomposed && decomposed.theme && decomposed.theme.confidence > 0.75) {
        activeTheme = decomposed.theme.value;
      }
      if (decomposed && decomposed.typography && decomposed.typography.confidence > 0.75) {
        activeTypography = decomposed.typography.value;
      }
    }

    // ==========================================
    // STAGE 1: USER INPUT REQUIREMENT VALIDATION
    // ==========================================
    let validatedProjectDescription = projectDescription;
    if (projectIntegration === 'new' && projectDescription) {
      console.log("[api/forge] Standalone project description detected. Validating inputs...");
      validatedProjectDescription = await validateManualDescription(projectDescription);
    }

    // ==========================================
    // STAGE 2: CONTEXT-ISOLATED RAG RETRIEVAL
    // ==========================================
    const selectionsPayload = {
      appCategory: category,
      pageType,
      componentType: componentName || componentName,
      theme: activeTheme,
      typography: activeTypography,
      features: category ? components : [], // app mode maps features to components field in legacy client
      components: pageType ? components : [],
      generationMode: req.body.generationMode || 'professional'
    };

    console.log(`[api/forge] Running Context-Isolated retrieval on Knowledge Graph...`);
    const { results: retrievedEntities, telemetry } = await runContextIsolatedRetrieval({
      mode: activeMode,
      query,
      theme: activeTheme,
      typography: activeTypography,
      selections: selectionsPayload,
      decomposed,
      limit: 16,      // Phase III-D.7 optimal config (was 8)
      hopDepth: 3    // Phase III-D.7 optimal config — hop 4 adds zero value at limit≥12
    });

    // ==========================================
    // STAGE 3: BUILD, VALIDATE & COMPILE BLUEPRINT
    // ==========================================
    // Determine expectation source
    let expectationSource = 'graph';
    if (req.body.selections && (req.body.selections.features?.length > 0 || req.body.selections.components?.length > 0)) {
      expectationSource = 'wizard';
    } else if (req.body.telemetry_source === 'synthetic_test' || req.body.benchmark_id) {
      expectationSource = 'benchmark';
    }

    console.log(`[api/forge] Building JSON Architecture Blueprint with expectation source: ${expectationSource}...`);
    const blueprintJson = await buildBlueprint({
      mode: activeMode,
      projectName,
      projectDescription: validatedProjectDescription,
      projectIntegration,
      framework: projectIntegration === 'existing' ? framework : 'Tailwind CSS',
      theme: activeTheme,
      typography: activeTypography,
      retrievedEntities,
      telemetry,
      expectationSource
    });

    console.log(`[api/forge] Validating JSON Architecture Blueprint...`);
    const validationResult = validateBlueprintV1(blueprintJson);

    // Reject execution if the blueprint violates strict error rules (V101, V102, V103, V106, V107, V110, V111)
    if (!validationResult.valid) {
      console.warn(`[api/forge] Aborting generation: blueprint validation failed (Score: ${validationResult.validationScore}/100)`);
      return res.status(400).json({
        error: "Blueprint validation failed. Architectural governance rules violated.",
        validationScore: validationResult.validationScore,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }

    console.log(`[api/forge] Compiling Architecture Blueprint to Markdown (Score: ${validationResult.validationScore}/100)...`);
    const compiledBlueprintMarkdown = compileBlueprintToPrompt(blueprintJson);

    // ==========================================
    // STAGE 4: CONTEXT ASSEMBLY (CONTEXT BUILDER)
    // ==========================================
    const assembledContext = await buildPromptContext(retrievedEntities, history, req.requestId, query, activeMode);

    // ==========================================
    // STAGE 5: MULTI-AGENT EXPORT ORCHESTRATION
    // ==========================================
    const { prompt: generatedPrompt, qualityScore, patchTriggered, reviews, qualityWarnings } = await runPromptEnhancerAgent({
      mode: activeMode,
      query,
      blueprint: compiledBlueprintMarkdown,
      context: assembledContext,
      selections: selectionsPayload,
      history,
      blueprintJson
    });

    const latencyMs = Date.now() - startTime;

    // Format telemetry mapping matching frontend format requirements
    const formattedResults = retrievedEntities.map(ent => ({
      name: ent.name,
      category: ent.entity_type,
      kb_type: ent.kb_type || 'common',
      score: ent.consolidated_score || 0.8,
      description: ent.overview || '',
      snippet: JSON.stringify(ent.prompt_fragments || {}),
      examplePrompt: ent.overview || '',
      id: ent.id,
      keywords: ent.keywords || []
    }));

    const telemetry_v2 = {
      pipeline_version: 1,
      blueprint_version: 1,
      benchmark_id: req.body.benchmark_id || null,
      validation_score: validationResult.validationScore,
      architectural_surface_score: validationResult.architectural_surface_score,
      blueprint_completion_rate: validationResult.blueprint_completion_rate,
      retrieval_utilization_rate: blueprintJson.coverage.retrieval_utilization_rate,
      latency_ms: latencyMs,
      patch_count: patchTriggered ? 1 : 0,
      evaluation_rubric: req.body.evaluation_rubric || null,
      llm_evaluation_score: qualityScore,
      structural_accuracy: null,
      structural_accuracy_score: null,
      expected_context: blueprintJson.expected_context,
      dependency_closure_additions: blueprintJson.coverage.dependency_closure_additions || null,
      closure_sources: blueprintJson.coverage.closure_sources || null,
      closure_depth: blueprintJson.coverage.closure_depth || 0,
      complexity_level: req.body.complexity_level || null,
      scenario_type: req.body.scenario_type || null,
      retrieval_completion_rate: blueprintJson.coverage.retrieval_completion_rate || 0.00,
      closure_completion_rate: blueprintJson.coverage.closure_completion_rate || 0.00,
      retrieval_dependency_coverage: blueprintJson.coverage.retrieval_dependency_coverage || 0.00,
      retrieval_purity_rate: blueprintJson.coverage.retrieval_purity_rate || 0.00,
      closure_selectivity_rate: blueprintJson.coverage.closure_selectivity_rate || 0.00,
      closure_added_ratio: blueprintJson.coverage.closure_added_ratio || 0.00,
      closure_efficiency_ratio: blueprintJson.coverage.closure_efficiency_ratio || 0.00,
      pre_closure_validator_failures: blueprintJson.coverage.pre_closure_validator_failures || 0,
      post_closure_validator_failures: blueprintJson.coverage.post_closure_validator_failures || 0,
      closure_added_nodes: blueprintJson.coverage.closure_added_nodes || 0
    };

    res.json({
      prompt: generatedPrompt,
      qualityWarnings: qualityWarnings || [],
      ragDetails: {
        engine_version: 'phase2',
        telemetry_source: req.body.telemetry_source || 'production',
        generation_type: 'blueprint_guided',
        benchmark_version: req.body.benchmark_version || null,
        benchmark_id: req.body.benchmark_id || null,
        pipeline_version: 1,
        anchor: blueprintJson, // The JSON blueprint conforms to version 1 schema definitions
        results: formattedResults,
        latencyMs,
        // Detailed RAG operational telemetry
        selected_entities: telemetry.selected_entities,
        expanded_entities: telemetry.expanded_entities,
        vector_hits: telemetry.vector_hits,
        scores: telemetry.scores,
        final_score: qualityScore,
        patch_triggered: patchTriggered,
        expertReviews: reviews || [],
        // Phase III Blueprint validation telemetry
        validation_score: validationResult.validationScore,
        validation_errors: validationResult.errors,
        validation_warnings: validationResult.warnings,
        telemetry_v2
      },
      source: "Google Gemini 2.5 Flash + Groq Llama 3.3 Multi-Agent Panel"
    });

  } catch (error) {
    console.error(`[forge] Agent execution error [${new Date().toISOString()}]: ${error.message}`);
    res.status(500).json({ error: `Internal prompt agent execution failed: ${error.message}` });
  }
});


// Mount the versioned apiRouter on both paths
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// Global Unhandled Error Handling Middleware (enforces standard 500 responses)
app.use((err, req, res, next) => {
  const reqId = req.requestId || 'unknown';
  console.error(`[${new Date().toISOString()}] [ERROR] [req:${reqId}] Uncaught Exception: ${err.message}`, err.stack);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'An unexpected internal server error occurred',
    errorCode: 'INTERNAL_SERVER_ERROR'
  });
});

// Process event logging for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] [FATAL] Unhandled Promise Rejection at:`, promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] [FATAL] Uncaught Exception thrown:`, err.message, err.stack);
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` Veyntra Upgraded RAG Backend running on: ${process.env.BACKEND_PUBLIC_URL || `http://localhost:${PORT}`}`);
  console.log(` Database: Connecting to Supabase Vector DB (BGE 1024d embeddings)`);
  console.log(` AI Orchestration: LangChain + Gemini + Groq Multi-Agent Pipeline`);
  console.log(`================================================================`);
});
