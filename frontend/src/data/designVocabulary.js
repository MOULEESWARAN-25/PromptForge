export const designVocabulary = [
  // ==================== VISUAL DESIGN STYLES ====================
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    category: "Visual Design Style",
    keywords: ["glass", "blur", "backdrop", "frost", "glow", "transparent", "floating panel"],
    description: "Transparent, glass-like cards with rich background blur, saturation effects, and dynamic border highlights.",
    snippet: "background: rgba(255, 255, 255, 0.05);\nbackdrop-filter: blur(10px);\nborder: 1px solid rgba(255, 255, 255, 0.1);",
    examplePrompt: "Create a glassmorphism login card with a blurred background and subtle white border glow."
  },
  {
    id: "neumorphism",
    name: "Neumorphism (Soft UI)",
    category: "Visual Design Style",
    keywords: ["neumorphic", "soft shadow", "extruded", "sunken", "inset", "beveled"],
    description: "Soft shadows creating an extruded or inset appearance mimicking physical plastic objects extruded from their backgrounds.",
    snippet: "box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;",
    examplePrompt: "Design a neumorphic settings panel with soft raised shadows, inset toggle buttons, and rounded corners."
  },
  {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    category: "Visual Design Style",
    keywords: ["skeuomorphic", "real-world", "leather", "analog", "vintage dials", "texture", "paper"],
    description: "Digital elements mimicking physical, real-world objects and textures (such as stitched leather, wood, or glossy plastic dials).",
    snippet: "background-image: url('leather-texture.png');\nbox-shadow: inset 0 2px 4px rgba(0,0,0,0.4);",
    examplePrompt: "Build a skeuomorphic vintage synthesizer interface with realistic textured metal panels, analog dials, and glowing LED indicators."
  },
  {
    id: "brutalism",
    name: "Brutalism",
    category: "Visual Design Style",
    keywords: ["brutalist", "harsh border", "thick shadow", "monospace", "high contrast", "oversized typography", "flat primary colors"],
    description: "Raw, bold, deliberately unpolished interfaces featuring thick solid borders, black drop shadows, monospaced fonts, and aggressive color pairings.",
    snippet: "border: 3px solid #000000;\nbox-shadow: 6px 6px 0px #000000;\nfont-family: monospace;",
    examplePrompt: "Create a brutalist SaaS landing page with oversized typography, heavy black borders, grid layouts, and high-contrast yellow/black highlights."
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "Visual Design Style",
    keywords: ["cyberpunk", "neon", "glitch", "futuristic", "holo", "dark purple", "laser", "synthesizer"],
    description: "A futuristic style incorporating dark neon purple backgrounds, bright cyan/magenta glow borders, holographic scan lines, and high-tech status indicators.",
    snippet: "color: #00ffff;\ntext-shadow: 0 0 5px #00ffff, 0 0 15px #ff00ff;\nborder: 1px solid #ff00ff;",
    examplePrompt: "Design a cyberpunk hacking dashboard with dark grid overlays, glowing cyan text terminal, neon pink divider lines, and glitch active states."
  },
  {
    id: "bento-grid",
    name: "Bento Grid Layout",
    category: "Visual Design Style",
    keywords: ["bento", "grid cards", "apple layout", "varying card size", "dashboard grid", "interactive widgets"],
    description: "A trendy layout organizing content into a grid of varying-sized rectangular cards, popularized by Apple WWDC and modern AI SaaS interfaces.",
    snippet: "display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\ngap: 1rem;",
    examplePrompt: "Build a modern Bento Grid features section displaying product statistics, interactive sliders, and mini-graphs in varying card sizes."
  },
  {
    id: "flat-design",
    name: "Flat Design",
    category: "Visual Design Style",
    keywords: ["flat", "2d", "no shadow", "minimalist flat", "simple shape", "solid colors"],
    description: "A clean, minimalist style that removes all 3D effects, shadows, gradients, and textures in favor of simple 2D shapes and clear flat layouts.",
    snippet: "border: none;\nbox-shadow: none;\nbackground: #3b82f6;",
    examplePrompt: "Create a flat design vector workspace interface using simple solid background layers, bold iconography, and no gradients or drop shadows."
  },
  {
    id: "material-design",
    name: "Material Design",
    category: "Visual Design Style",
    keywords: ["material", "elevation shadow", "ripple", "floating action button", "fab", "google design"],
    description: "Google's design language focused on physical sheets of virtual paper with logical elevation shadows, fluid ripple click feedback, and Floating Action Buttons (FAB).",
    snippet: "box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);",
    examplePrompt: "Build an enterprise-grade dashboard adhering to Material Design, complete with raised cards, ripple effects on buttons, and a bottom-right FAB."
  },

  // ==================== LAYOUTS ====================
  {
    id: "hero-section",
    name: "Hero Section",
    category: "Layout",
    keywords: ["hero", "landing top", "cta header", "value proposition", "intro fold"],
    description: "The primary banner above-the-fold on a landing page, comprising a powerful headline, value-proposition subtext, strong CTAs, and a floating product visual.",
    snippet: "min-height: 80vh;\ndisplay: flex;\nflex-direction: column;\njustify-content: center;",
    examplePrompt: "Create a SaaS hero section with a centered glowing header, an interactive call-to-action button, and a floating 3D browser mock-up underneath."
  },
  {
    id: "split-layout",
    name: "Split Layout",
    category: "Layout",
    keywords: ["split screen", "two column", "half screen", "image left text right", "asymmetrical"],
    description: "A two-column layout splitting the viewport (often 50/50), typically featuring an illustrative graphic on one half and registration forms or copy on the other.",
    snippet: "display: grid;\ngrid-template-columns: 1fr 1fr;\n@media (max-width: 768px) { grid-template-columns: 1fr; }",
    examplePrompt: "Design an asymmetric split-screen onboarding page with a registration form on the left and a slow-panning abstract mesh on the right."
  },
  {
    id: "masonry-layout",
    name: "Masonry Layout",
    category: "Layout",
    keywords: ["masonry", "pinterest style", "staggered columns", "fluid grid", "brick wall layout"],
    description: "A staggered layout where elements of differing heights are placed in columns without vertical gaps (like Pinterest or gallery walls).",
    snippet: "column-count: 3;\ncolumn-gap: 1rem;\nbreak-inside: avoid;",
    examplePrompt: "Generate a responsive masonry layout gallery displaying photography cards of different aspect ratios without vertical gaps."
  },
  {
    id: "dashboard-layout",
    name: "Dashboard Layout",
    category: "Layout",
    keywords: ["dashboard grid", "sidebar topbar", "app shell", "admin panel frame", "workspace layout"],
    description: "The core layout structure of web applications, featuring a collapsible side navigation bar, a persistent topbar with search and profile menus, and a central content panel.",
    snippet: "display: grid;\ngrid-template-columns: 240px 1fr;\ngrid-template-rows: 64px 1fr;",
    examplePrompt: "Design an app shell layout featuring a collapsible vertical sidebar navigation, a sticky topbar with global search, and a grid content canvas."
  },

  // ==================== COMPONENTS ====================
  {
    id: "accordion",
    name: "Accordion",
    category: "Component",
    keywords: ["accordion", "faq collapse", "expandable list", "disclosure", "collapsible header"],
    description: "A stacked list of headers that expand/collapse to reveal contextual details, commonly utilized in FAQ segments.",
    snippet: "transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);",
    examplePrompt: "Build a sleek, interactive FAQ accordion with smooth chevron rotation, glowing borders on focus, and fluid slide transitions."
  },
  {
    id: "drawer",
    name: "Drawer / Sheet",
    category: "Component",
    keywords: ["drawer", "sheet", "slide out menu", "side panel", "mobile navigation overlay"],
    description: "A contextual navigation or details panel that slides out from the viewport edge (left, right, top, or bottom).",
    snippet: "transform: translateX(0);\ntransition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);",
    examplePrompt: "Open checkout preferences inside a right-side sliding drawer featuring full backdrop blur overlays."
  },
  {
    id: "modal",
    name: "Modal / Dialog",
    category: "Component",
    keywords: ["modal", "dialog", "popup card", "overlay alert", "interactive lightbox"],
    description: "A centered popup box focusing user attention on a single task, completely blocking interaction with the main page under a darkened backdrop overlay.",
    snippet: "position: fixed;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);",
    examplePrompt: "Design a sleek authentication modal popup overlay with smooth scale-up entry animations and a frosted-glass backdrop overlay."
  },
  {
    id: "command-palette",
    name: "Command Palette",
    category: "Component",
    keywords: ["command palette", "cmd k", "spotlight search", "raycast", "quick actions menu"],
    description: "An overlay search palette triggered globally (e.g. Cmd+K) to let users search resources, run commands, and navigate rapidly via keyboard shortcuts.",
    snippet: "window.addEventListener('keydown', (e) => { if (e.key === 'k' && e.metaKey) togglePalette() });",
    examplePrompt: "Integrate a command palette triggered by Cmd+K, complete with categorized quick action options, fuzzy-search filtering, and keyboard navigation."
  },
  {
    id: "stepper",
    name: "Stepper",
    category: "Component",
    keywords: ["stepper", "wizard indicator", "multi step progress", "checkout steps", "form milestones"],
    description: "A visual tracker showing milestones in a multi-step checkout or wizard flow, highlighting the current, finished, and upcoming steps.",
    snippet: "display: flex;\njustify-content: space-between;\nalign-items: center;",
    examplePrompt: "Create a 4-step onboarding stepper with animated connection lines, glowing active stage nodes, and validation state checkmarks."
  },
  {
    id: "toast",
    name: "Toast Notification",
    category: "Component",
    keywords: ["toast", "snack bar", "success popup alert", "floating action feedback", "auto dismiss badge"],
    description: "A temporary, automated notification bubble sliding into the screen corners to provide quick success, warning, or error operation updates.",
    snippet: "position: fixed;\nbottom: 1.5rem;\nright: 1.5rem;\nanimation: slideIn 0.3s ease;",
    examplePrompt: "Show a success toast notification on the bottom-right of the viewport with a green checkmark icon, auto-dismissing after 3 seconds."
  },
  {
    id: "skeleton-loader",
    name: "Skeleton Loader",
    category: "Component",
    keywords: ["skeleton", "ghost loader", "loading card placeholder", "shimmer animate", "content skeleton"],
    description: "Dynamic grey placeholder blocks that animate with a fading shimmer pattern, simulating the screen layout while remote API data is being fetched.",
    snippet: "background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);\nbackground-size: 200% 100%;\nanimation: shimmer 1.5s infinite;",
    examplePrompt: "Render dynamic animated grid skeleton loaders with circular avatar and rectangular card shimmers while fetching dashboard lists."
  },
  {
    id: "kanban-board",
    name: "Kanban Board",
    category: "Component",
    keywords: ["kanban", "trello columns", "drag card", "project board", "todo board"],
    description: "A multi-column board (e.g. Backlog, Todo, In-Progress, Done) where interactive task cards can be dragged and dropped between states.",
    snippet: "display: flex;\ngap: 1.5rem;\noverflow-x: auto;",
    examplePrompt: "Build a drag-and-drop Kanban board layout complete with customizable progress columns, interactive task priority badges, and hover scaling card effects."
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Component",
    keywords: ["timeline", "chronological path", "activity logs", "history track", "milestones vertical"],
    description: "A vertical or horizontal visual list mapping milestones, chronologies, or history updates connected by a continuous structural path line.",
    snippet: "border-left: 2px solid rgba(255,255,255,0.1);\nmargin-left: 1rem;\npadding-left: 1.5rem;",
    examplePrompt: "Create a chronological project milestone timeline featuring left-aligned visual text items, pulsing node lights, and scroll-reveal triggers."
  },

  // ==================== NAVIGATION ====================
  {
    id: "dock-navigation",
    name: "Dock Navigation",
    category: "Navigation Pattern",
    keywords: ["dock nav", "macos dock", "floating icons bar", "magnifying nav", "spring hover menu"],
    description: "A floating bottom navigation panel where app icons scale and magnify based on mouse distance, inspired by the macOS dock.",
    snippet: "display: flex;\nalign-items: flex-end;\ngap: 12px;\nbackground: rgba(0,0,0,0.4);",
    examplePrompt: "Design a macOS-style floating dock menu at the bottom center of the window, including smooth icon-expansion on hover and spring scale micro-interactions."
  },
  {
    id: "mega-menu",
    name: "Mega Menu",
    category: "Navigation Pattern",
    keywords: ["mega menu", "complex navigation dropdown", "multi column navbar", "large scale category"],
    description: "A massive navigation dropdown panel opening from a top header link, categorizing links into multi-column layout lists and grids.",
    snippet: "position: absolute;\nwidth: 100%;\nleft: 0;\ndisplay: grid;\ngrid-template-columns: repeat(4, 1fr);",
    examplePrompt: "Create a premium responsive mega-menu that drops down on hover, dividing services into structured sections with icon descriptions and secondary callouts."
  },

  // ==================== MOTION & ANIMATION ====================
  {
    id: "micro-interactions",
    name: "Micro-interactions",
    category: "Animation & Motion",
    keywords: ["microinteraction", "button press transition", "active feedback scale", "hover trigger feedback", "spring response"],
    description: "Subtle visual animations acting as tactile feedback for actions, e.g. toggle triggers bounce, checkmarks animate paths, buttons depress.",
    snippet: "transform: scale(0.98);\ntransition: transform 0.1s ease;",
    examplePrompt: "Enhance all buttons with micro-interactions, causing them to shrink slightly on click, expand on hover, and play spring physics transitions."
  },
  {
    id: "magnetic-effect",
    name: "Magnetic Effect",
    category: "Animation & Motion",
    keywords: ["magnetic", "cursor attraction", "button follow mouse", "gravity offset hover"],
    description: "Interactive button physics where elements warp and subtly follow the user's cursor once it approaches within a close threshold.",
    snippet: "const dx = mouse.x - button.x;\nconst dy = mouse.y - button.y;\nsetTranslate(dx * 0.2, dy * 0.2);",
    examplePrompt: "Apply a magnetic effect to the main landing page buttons, causing them to gracefully drift toward and attract to the pointer cursor on hover."
  },
  {
    id: "marquee",
    name: "Marquee (Infinite Moving Cards)",
    category: "Animation & Motion",
    keywords: ["marquee", "infinite scroll loop", "logo carousel ticker", "moving track", "scrolling logos"],
    description: "A continuous horizontal tracking loop that scrolls cards or client logos endlessly to show extensive social proof.",
    snippet: "@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }",
    examplePrompt: "Construct a seamless horizontal partner logo marquee that infinitely loops logo elements from right to left, pausing on user mouse-hover."
  },

  // ==================== MODERN AI / SAAS ====================
  {
    id: "aurora-background",
    name: "Aurora Background",
    category: "Modern AI/SaaS Terms",
    keywords: ["aurora", "blended gradient waves", "neon clouds", "ambient lighting", "abstract glowing backdrop"],
    description: "Abstract background styling featuring massive, highly blurred neon gradient blobs floating and warping in slow background cycles, popular with AI dashboards.",
    snippet: "filter: blur(80px);\nbackground: radial-gradient(circle, #ff007f 0%, transparent 60%);\nanimation: move 20s infinite alternate;",
    examplePrompt: "Build an abstract dark portal canvas with a colorful, rotating aurora background comprising blurred neon blue and deep indigo waves."
  },
  {
    id: "spotlight-effect",
    name: "Spotlight Effect (Cursor Glowing Card)",
    category: "Modern AI/SaaS Terms",
    keywords: ["spotlight card", "radial follow highlight", "flashlight border hover", "cursor light tracker"],
    description: "Cards that track the user's cursor and project a radial neon gradient highlight behind the element borders or card background following the pointer position.",
    snippet: "background: radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.08) 0%, transparent 80%);",
    examplePrompt: "Design dynamic dashboard grid widget cards showing a cursor-following radial spotlight highlight on hover."
  },
  {
    id: "gradient-mesh",
    name: "Gradient Mesh",
    category: "Modern AI/SaaS Terms",
    keywords: ["gradient mesh", "complex fluid blend", "organic fluid vector", "multi color blur background"],
    description: "A complex graphic background displaying highly organic, smoothly blending nodes of contrasting colors forming unique flowing backdrops.",
    snippet: "background: radial-gradient(at 10% 20%, #4f46e5 0px, transparent 50%), radial-gradient(at 90% 80%, #ec4899 0px, transparent 50%);",
    examplePrompt: "Create a premium visual presentation background with an organic, multi-colored high-resolution gradient mesh layout."
  },
  {
    id: "animated-border",
    name: "Animated Glowing Border",
    category: "Modern AI/SaaS Terms",
    keywords: ["border glow animate", "glowing ring track", "rainbow card perimeter", "neon snake border"],
    description: "A visual technique where cards feature a thin, dynamic boundary perimeter that glows and animates along the edges via gradients.",
    snippet: "background: linear-gradient(var(--angle), #ff007f, #7f00ff);\nanimation: rotateBorder 4s linear infinite;",
    examplePrompt: "Surround the pricing spotlight cards with an animated glowing gradient border that slowly spins neon highlights around the perimeter."
  }
];

export const themeStyles = {
  "Sleek Dark Glassmorphic": {
    name: "Sleek Dark Glassmorphic",
    description: "Deep obsidian backdrops, frosted semi-transparent containers, neon-violet glow highlights, and minimal card borders.",
    keywords: "glassmorphism, dark obsidian background, backdrop-filter blur, subtle neon border glow, premium dark mode, rich transparency effects, raycast, linear",
    background: "rgba(10, 5, 22, 0.95)",
    surface: "rgba(255, 255, 255, 0.05)",
    primary: "#7c3aed",
    secondary: "#a78bfa",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    family: "Visual Style",
    bestFor: "Premium developer workstations and AI SaaS portals",
    typography: "Geist",
    motion: "Subtle Spring",
    density: "Compact",
    whyItWorks: [
      "Frosted glass backdrops reduce structural background noise.",
      "Vibrant neon outlines clearly prioritize interactive target areas.",
      "High ambient contrast supports premium, developer-first aesthetic branding."
    ],
    aliases: ["Glassmorphism", "Modern SaaS", "Vercel", "Ambient", "Holographic"]
  },
  "Wes Anderson": {
    name: "Wes Anderson Retro",
    description: "Warm pastel palettes, centered compositions, distinctive retro typography, warm muted margins, and vintage illustrations.",
    keywords: "wes anderson theme, vintage pastel colors, symmetrical layout, sharp borders, warm organic background, retro serif typography, high-character aesthetic",
    background: "#ffedd5",
    surface: "#fed7aa",
    primary: "#ea580c",
    secondary: "#fdba74",
    textPrimary: "#431407",
    textSecondary: "#854d0e",
    family: "Creative Theme",
    bestFor: "Artistic portfolios, editorial sites, and storybooks",
    typography: "Outfit",
    motion: "Snappy Slide",
    density: "Spacious",
    whyItWorks: [
      "Highly symmetrical structures evoke immediate design balance.",
      "Warm pastel base reduces flat digital canvas coldness.",
      "Retro high-character fonts establish strong individual branding personalities."
    ],
    aliases: ["Retro", "Framer", "Editorial", "Consumer", "Storybook"]
  },
  "Cyberpunk Neon": {
    name: "Cyberpunk Neon",
    description: "Pitch black layouts contrast with highly illuminated cybernetic cyan and hot pink glow highlights, dark tech grid lines, and glitch active states.",
    keywords: "cyberpunk neon style, high-saturation magenta and cyan accents, dark synthwave grid overlays, high-energy glow, laser line borders, tech font details",
    background: "#05050a",
    surface: "#0d0d1a",
    primary: "#00ffff",
    secondary: "#ff00ff",
    textPrimary: "#00ffff",
    textSecondary: "#ff00ff",
    family: "Visual Style",
    bestFor: "Hacker consoles, data dashboards, and gaming workspaces",
    typography: "JetBrains Mono",
    motion: "Instant Glitch",
    density: "Compact",
    whyItWorks: [
      "Laser neon colors support excellent element scanning against pitch black.",
      "Cybernetic grid lines structure high volumes of parallel system feeds.",
      "High-energy glowing highlights mimic tactile terminal hardware panels."
    ],
    aliases: ["Cyberpunk", "Raycast", "Interactive Terminal", "Synthwave", "Dark Tech"]
  },
  "Brutalist Bold": {
    name: "Brutalist Bold",
    description: "Aggressive thick black borders, stark white or high-contrast primary backdrops, solid offset block drop shadows, and heavy monospace fonts.",
    keywords: "brutalist design, thick black solid borders, offset block drop shadows, high contrast flat palette, monospace typography, raw unpolished grids",
    background: "#18181b",
    surface: "#6843EC",
    primary: "#6843EC",
    secondary: "#000000",
    textPrimary: "#ffffff",
    textSecondary: "#d4d4d8",
    family: "Visual Style",
    bestFor: "Edgy consumer applications and graphic-forward layouts",
    typography: "IBM Plex Sans",
    motion: "Stiff Snap",
    density: "Standard",
    whyItWorks: [
      "Heavy black perimeters enforce clear bounding container shapes.",
      "Flat raw color blocks capture immediate focus without gradient gradients.",
      "Offset hard shadows create powerful tactile cardboard physical depths."
    ],
    aliases: ["Brutalism", "Framer", "Webflow", "Flat Design", "Stark Contrast"]
  },
  "Minimalist Typography": {
    name: "Minimalist Typography",
    description: "Stark whitespace, refined line heights, neutral shades of sand and slate, zero drop shadows, and extremely clear visual grids.",
    keywords: "minimalist flat design, clean whitespace, neutral sans-serif typography, subtle thin lines, elegant spacing, sleek sand/slate hues, zero clutter",
    background: "#fafaf9",
    surface: "#f5f5f4",
    primary: "#18181b",
    secondary: "#78716c",
    textPrimary: "#1c1917",
    textSecondary: "#78716c",
    family: "Visual Style",
    bestFor: "Information portals, personal essays, and agency presentations",
    typography: "Inter",
    motion: "Soft Fade",
    density: "Standard",
    whyItWorks: [
      "Stark whitespace channels 100% of user focus to core copy paragraphs.",
      "Zero shadow elements remove visual depth clutter.",
      "Neutral slate and sand shades invoke calm, professional trust."
    ],
    aliases: ["Minimalist", "Notion", "Clean Simple", "Corporate", "Slate"]
  },
  "Luxury Gold": {
    name: "Luxury Gold",
    description: "Deep charcoal surfaces layered with brass and gold accent trims, premium dark drop shadows, and serif brand headings.",
    keywords: "luxury gold design, dark brass, gold accents, premium drop shadows, dark mode, sophisticated layouts",
    background: "#0a0a0a",
    surface: "#121212",
    primary: "#d4af37",
    secondary: "#aa7c11",
    textPrimary: "#f5f5f0",
    textSecondary: "#a1a1aa",
    family: "Creative Theme",
    bestFor: "High-end landing pages, luxury items, and executive summaries",
    typography: "Outfit",
    motion: "Elegant Glide",
    density: "Standard",
    whyItWorks: [
      "Muted brass outlines create a warm, premium visual frame.",
      "Subtle deep elevations suggest high-end, layered structural value.",
      "Crisp gold details highlight strategic focal elements."
    ],
    aliases: ["Luxury", "Apple", "Premium", "Sophisticated", "Dark Brass"]
  },
  "Modern Dashboard": {
    name: "Modern Dashboard",
    description: "Deep indigo and dark slate surfaces, subtle grid systems, clean border outlines, and energetic corporate blue highlight elements.",
    keywords: "navy slate dashboard, tech borders, corporate blue details, dynamic widgets, sleek interface",
    background: "#0f172a",
    surface: "#1e293b",
    primary: "#3b82f6",
    secondary: "#60a5fa",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    family: "Modern SaaS",
    bestFor: "Enterprise B2B dashboards, statistics, and system nodes",
    typography: "Inter",
    motion: "Gentle Spring",
    density: "Compact",
    whyItWorks: [
      "Deep navy canvases support comfortable readability under dim lights.",
      "Corporate blue details project reliable technical precision.",
      "Structured border outlines split metric matrices elegantly."
    ],
    aliases: ["Modern SaaS", "Stripe", "Linear", "Tailwind", "Corporate Slate"]
  },
  "Analytics Platform": {
    name: "Analytics Platform",
    description: "Graphite backgrounds, card components with fine border lines, emerald green activity indicators, and compact layout elements.",
    keywords: "analytics interface, emerald green details, graphite card layout, dense grid display",
    background: "#111827",
    surface: "#1f2937",
    primary: "#10b981",
    secondary: "#34d399",
    textPrimary: "#f9fafb",
    textSecondary: "#9ca3af",
    family: "Modern SaaS",
    bestFor: "Fintech panels, active server stats, and telemetry metrics",
    typography: "Geist",
    motion: "Fast Snap",
    density: "Compact",
    whyItWorks: [
      "Emerald green pulses immediately communicate active live data operations.",
      "Graphite grid cards split high volumes of numerical information cleanly.",
      "Dense font sizing supports high datagrid dashboard scanner-ability."
    ],
    aliases: ["Modern SaaS", "Vercel", "Fintech", "Compact Grid", "Data Feed"]
  },
  "Stripe Inspired": {
    name: "Stripe Inspired",
    description: "Pure white surface layers, elegant gradient banners, indigo accent highlights, and soft layered canvas drop elevations.",
    keywords: "stripe design, indigo accents, soft gradients, drop elevations, floating cards, clean light theme",
    background: "#f8fafc",
    surface: "#ffffff",
    primary: "#6366f1",
    secondary: "#818cf8",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    family: "Modern SaaS",
    bestFor: "SaaS websites, billing screens, and light marketing apps",
    typography: "DM Sans",
    motion: "Premium Glide",
    density: "Standard",
    whyItWorks: [
      "Delicate ambient page shadows give containers a sleek floating dimension.",
      "Warm background and indigo lines keep layout clean.",
      "Vibrant linear gradient accents suggest progressive, modern SaaS flow."
    ],
    aliases: ["Stripe", "Modern SaaS", "Clean Simple", "Minimalist Light", "Indigo Glow"]
  },
  "Terminal": {
    name: "Terminal Workspace",
    description: "Monospaced green or amber glowing text on deep black, simulated terminal scan lines, and thin retro command window frames.",
    keywords: "command line, terminal screen, retro green glow, monospace, hacker console, scanlines",
    background: "#000000",
    surface: "#09090b",
    primary: "#22c55e",
    secondary: "#15803d",
    textPrimary: "#22c55e",
    textSecondary: "#4ade80",
    family: "Visual Style",
    bestFor: "Developer sandboxes, SSH logs, and command prompts",
    typography: "JetBrains Mono",
    motion: "Static",
    density: "Compact",
    whyItWorks: [
      "Monospaced neon text mimics nostalgic retro command line interfaces.",
      "Total black backdrops completely minimize battery power draw.",
      "Simplistic outline grids structure dense lines of syntax code cleanly."
    ],
    aliases: ["Raycast", "Interactive Terminal", "Developer Tool", "Retro CLI", "Amber Console"]
  },
  "Gaming Console": {
    name: "Gaming Console",
    description: "High-density charcoal surfaces, sharp angular cards, energetic crimson/neon-orange tags, and clean HUD badges.",
    keywords: "gaming hud, orange tags, angular cards, carbon texture style, dark dashboard",
    background: "#18181b",
    surface: "#27272a",
    primary: "#ea580c",
    secondary: "#f97316",
    textPrimary: "#f4f4f5",
    textSecondary: "#a1a1aa",
    family: "Creative Theme",
    bestFor: "Gamified dashboards, matchmaking queues, and stats trackers",
    typography: "Sora",
    motion: "Impactful Spring",
    density: "Compact",
    whyItWorks: [
      "Sharp angular container shapes evoke strong, high-contrast action.",
      "Energetic crimson and orange accents highlight telemetry milestones.",
      "Pill-shaped stats badges structure player levels clearly."
    ],
    aliases: ["Creative", "Gaming HUD", "Dynamic Action", "Stats Panel"]
  },
  "Data Visualization": {
    name: "Data Visualization",
    description: "Deep midnight backdrops, highly-contrast neon chart bars, cyan status alerts, and structured tabular grids.",
    keywords: "data tables, cyan details, chart bars, data visualization panels, high contrast",
    background: "#0f172a",
    surface: "#1e1b4b",
    primary: "#f43f5e",
    secondary: "#fb7185",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    family: "Modern SaaS",
    bestFor: "High-density database grids and interactive charts",
    typography: "Inter",
    motion: "Fast Snap",
    density: "Compact",
    whyItWorks: [
      "Deep midnight hues contrast highly with colorful multi-track graphs.",
      "Cyan alerts guide immediately to system anomalies.",
      "Dense tabular grid designs make visual data comparison seamless."
    ],
    aliases: ["Modern SaaS", "Vercel", "Telemetry", "Data Grids", "Dense Stats"]
  },
  "Notion Style": {
    name: "Notion Style",
    description: "Light gray flat surfaces, thin solid borders, simple system typography, and clean yellow folder badge accents.",
    keywords: "notion flat design, grey borders, minimal structure, yellow accents, document canvas",
    background: "#ffffff",
    surface: "#f1f1ef",
    primary: "#37352f",
    secondary: "#acaba9",
    textPrimary: "#37352f",
    textSecondary: "#6b6a67",
    family: "Enterprise Theme",
    bestFor: "Knowledge hubs, documentation wikis, and system reports",
    typography: "Manrope",
    motion: "Static",
    density: "Standard",
    whyItWorks: [
      "Thin dark-grey borders separate document scopes like clean notebook grids.",
      "Zero unnecessary elevations deliver a pure white document layout.",
      "Approachable font weights establish comfortable document reading environments."
    ],
    aliases: ["Notion", "Clean Simple", "Minimalist Light", "Wiki Layout"]
  },
  "Linear Style": {
    name: "Linear Style",
    description: "Dark carbon grids, fine border details, glowing purple timeline lines, and ultra-crisp responsive tabs.",
    keywords: "linear layout, purple glow timeline, dark carbon grids, ultra-crisp tabs",
    background: "#0c0c0d",
    surface: "#161618",
    primary: "#5b21b6",
    secondary: "#8b5cf6",
    textPrimary: "#f3f4f6",
    textSecondary: "#9ca3af",
    family: "Modern SaaS",
    bestFor: "Professional issue tracking, project timelines, and sprint boards",
    typography: "Geist",
    motion: "Premium Glide",
    density: "Compact",
    whyItWorks: [
      "Glowing neon track perimeters highlight selected active lines.",
      "Ultra-fine borders deliver a highly professional design style.",
      "Crisp navigation tabs segment administrative tasks seamlessly."
    ],
    aliases: ["Linear", "Modern SaaS", "Vercel", "Dark Tech", "Sleek Workspace"]
  },
  "Apple Inspired": {
    name: "Apple Inspired",
    description: "Frosted glass header bars, pure white canvas layers, extremely soft elevations, and clean SF Pro-style lettering.",
    keywords: "apple layout, SF Pro style, frosted glass, soft elevations, minimalist light theme",
    background: "rgba(255, 255, 255, 0.5)",
    surface: "rgba(255, 255, 255, 0.8)",
    primary: "#0071e3",
    secondary: "#86868b",
    textPrimary: "#1d1d1f",
    textSecondary: "#86868b",
    family: "Creative Theme",
    bestFor: "Consumer hardware dashboards, storefronts, and system reviews",
    typography: "Plus Jakarta Sans",
    motion: "Premium Glide",
    density: "Standard",
    whyItWorks: [
      "Ambient frosted-glass backdrops emulate luxurious natural materials.",
      "Very smooth shadow gradients elevate cards from light canvases.",
      "Aesthetic typography pairings deliver clean, high-prestige headlines."
    ],
    aliases: ["Apple", "Minimalist Light", "Clean Premium", "Premium Glow", "Frosted Glass"]
  },
  "Material Design": {
    name: "Material Design",
    description: "Pastel purple and indigo base layers, raised card surfaces, rounded action buttons, and clean google-inspired components.",
    keywords: "material design 3, elevated card shadows, ripple buttons, purple accents, clean spacing",
    background: "#f3f4f6",
    surface: "#e0e7ff",
    primary: "#1e1b4b",
    secondary: "#6366f1",
    textPrimary: "#1e1b4b",
    textSecondary: "#4b5563",
    family: "Visual Style",
    bestFor: "Android-styled apps, public service systems, and utilities",
    typography: "Poppins",
    motion: "Ripple Impact",
    density: "Standard",
    whyItWorks: [
      "Layered pastel colored elevations guide users through component hierarchies.",
      "Substantial corner rounding establishes approachable utility feels.",
      "High-contrast action areas simplify mobile finger targets."
    ],
    aliases: ["Material Design", "Framer", "Consumer", "Utility Panel"]
  },
  "Neo Brutalism": {
    name: "Neo Brutalism",
    description: "Playful high-saturation pastel yellow and sky blue containers, bold black outlines, and hard block shadows.",
    keywords: "neo brutalism, sky blue yellow accents, black outlines, block shadows, fun interface",
    background: "#67e8f9",
    surface: "#facc15",
    primary: "#000000",
    secondary: "#374151",
    textPrimary: "#000000",
    textSecondary: "#374151",
    family: "Visual Style",
    bestFor: "Edgy newsletter landings, modern Web3 sites, and tech tools",
    typography: "Space Grotesk",
    motion: "Impactful Spring",
    density: "Standard",
    whyItWorks: [
      "Unblended raw color palettes generate immediate energetic visual interest.",
      "Hard, zero-blur drop shadows pop components out like physical stickers.",
      "Monolithic headings deliver highly legible, graphic messaging structures."
    ],
    aliases: ["Neo Brutalism", "Framer", "Webflow", "Creative", "Tactile Pop"]
  },
  "Healthcare Clean": {
    name: "Healthcare Clean",
    description: "Sleek teal and mint accents, pristine white card surfaces, soft pill shapes, and a highly accessible layout structure.",
    keywords: "clinical healthcare, clean teal, mint green tags, pill buttons, soft layout",
    background: "#f0f9ff",
    surface: "#ffffff",
    primary: "#0284c7",
    secondary: "#bae6fd",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    family: "Enterprise Theme",
    bestFor: "Patient telemetry portals, telehealth tools, and medical charts",
    typography: "Nunito",
    motion: "Soft Fade",
    density: "Standard",
    whyItWorks: [
      "Aquamarine accents project clean, sterile safety and calmness.",
      "Pill-shaped badge items deliver rounded, comforting interfaces.",
      "Accessible high contrast levels support absolute reading accuracy."
    ],
    aliases: ["Enterprise", "Healthcare Clean", "Light Premium", "Clinical Slate"]
  },
  "Education Classic": {
    name: "Education Classic",
    description: "Ivy league forest green and crimson highlights, soft paper-white surfaces, and classical serif headers.",
    keywords: "academic education, serif headers, warm beige backdrop, forest green details",
    background: "#fafaf9",
    surface: "#fffbeb",
    primary: "#991b1b",
    secondary: "#f59e0b",
    textPrimary: "#1c1917",
    textSecondary: "#57534e",
    family: "Creative Theme",
    bestFor: "University portfolios, digital libraries, and academic reports",
    typography: "Sora",
    motion: "Static",
    density: "Standard",
    whyItWorks: [
      "Serif typefaces simulate classic high-status paper books.",
      "Ivy green highlights promote reading concentration.",
      "Soft beige backgrounds reduce white page screen glare."
    ],
    aliases: ["Retro", "Classic Education", "Academic Beige", "Book Layout"]
  },
  "Enterprise Slate": {
    name: "Enterprise Slate",
    description: "Professional slate gray containers, deep steel blue text headings, and high density grid spreadsheets.",
    keywords: "corporate slate, steel blue accents, high density grids, professional charts",
    background: "#ffffff",
    surface: "#f1f5f9",
    primary: "#475569",
    secondary: "#64748b",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    family: "Enterprise Theme",
    bestFor: "Industrial logs, supply chains, and standard administrative grids",
    typography: "DM Sans",
    motion: "Subtle Spring",
    density: "Compact",
    whyItWorks: [
      "Highly structured slate gray components suggest professional industrial trust.",
      "Dense spreadsheet matrices present maximum raw metrics on one fold.",
      "Clear grid alignments guide administrators through visual indices."
    ],
    aliases: ["Enterprise", "Atlassian", "Corporate Slate", "Compact Grid"]
  },
  "Cyberpunk Red": {
    name: "Cyberpunk Red",
    description: "Pitch black layouts styled with neon crimson accents, cybernetic grid alignments, and red command terminal indicators.",
    keywords: "cyberpunk red theme, neon crimson highlights, dark synthwave grids, red glows",
    background: "#050000",
    surface: "#1a0505",
    primary: "#ef4444",
    secondary: "#b91c1c",
    textPrimary: "#ef4444",
    textSecondary: "#b91c1c",
    family: "Visual Style",
    bestFor: "Intrusion detectors, firewalls, and server logs",
    typography: "JetBrains Mono",
    motion: "Instant Glitch",
    density: "Compact",
    whyItWorks: [
      "Crimson glowing lines direct visual attention to security warning priorities.",
      "Dense monospaced code aligns code structure logs beautifully.",
      "Low light dark interfaces minimize ocular strain during long system audits."
    ],
    aliases: ["Cyberpunk", "Terminal Console", "Hacker Sandbox", "Red Alert"]
  },
  "Nordic Forest": {
    name: "Nordic Forest",
    description: "Deep pine green surfaces, soft sage green metrics cards, and warm golden amber status alerts.",
    keywords: "nordic forest, sage green, pine green backdrops, warm amber badges",
    background: "#022c22",
    surface: "#064e3b",
    primary: "#34d399",
    secondary: "#6ee7b7",
    textPrimary: "#ecfdf5",
    textSecondary: "#a7f3d0",
    family: "Creative Theme",
    bestFor: "Agriculture hubs, nature apps, and carbon trackers",
    typography: "Urbanist",
    motion: "Soft Fade",
    density: "Standard",
    whyItWorks: [
      "Organic pine and sage greens provide comforting nature feelings.",
      "Highly readable geometric typefaces present statistical yields clearly.",
      "Warm golden alerts highlight priority metrics without looking aggressive."
    ],
    aliases: ["Creative", "Nordic Forest", "Sage Green", "Natural Theme"]
  },
  "Sunset Warmth": {
    name: "Sunset Warmth",
    description: "Warm peach and coral gradient backgrounds, amber orange CTA highlights, and soft card shadows.",
    keywords: "peach coral, sunset warmth, orange gradients, warm light mode",
    background: "#fff7ed",
    surface: "#ffedd5",
    primary: "#ea580c",
    secondary: "#f97316",
    textPrimary: "#431407",
    textSecondary: "#7c2d12",
    family: "Consumer Theme",
    bestFor: "Approach-friendly startups, recipes, and travel blogs",
    typography: "Poppins",
    motion: "Gentle Spring",
    density: "Standard",
    whyItWorks: [
      "Warm peach overlays create happy, sunshine-feeling canvas atmospheres.",
      "Bright sunset orange highlights invite immediate button clicks.",
      "Soft shadows layer layout sections elegantly."
    ],
    aliases: ["Consumer", "Stripe", "Airbnb", "Sunset Warmth", "Bright Startup"]
  },
  "Ocean Breeze": {
    name: "Ocean Breeze",
    description: "Soothing sky blue and aquamarine gradients, floating white container cards, and deep navy text details.",
    keywords: "aquamarine, sky blue breeze, floating cards, oceanic design",
    background: "#f0f9ff",
    surface: "#e0f2fe",
    primary: "#0284c7",
    secondary: "#bae6fd",
    textPrimary: "#0369a1",
    textSecondary: "#075985",
    family: "Consumer Theme",
    bestFor: "Clean water dashboards, summer stores, and user portfolios",
    typography: "Urbanist",
    motion: "Smooth Glide",
    density: "Standard",
    whyItWorks: [
      "Cool sky and water blue tones project calm, professional security.",
      "Floating pure white components look light and fresh.",
      "Deep ocean blue text provides outstanding contrast readability."
    ],
    aliases: ["Consumer", "Oceanic Breeze", "Clean Light", "Aquamarine Theme"]
  },
  "Cyber Grid": {
    name: "Cyber Grid",
    description: "Tech terminal style featuring dark gray backgrounds, grid overlay patterns, and neon cyan border rules.",
    keywords: "cyber grid, cyan details, tech terminal, grid patterns",
    background: "#020617",
    surface: "#0f172a",
    primary: "#06b6d4",
    secondary: "#22d3ee",
    textPrimary: "#06b6d4",
    textSecondary: "#0891b2",
    family: "Visual Style",
    bestFor: "Cloud monitors, AI command lines, and network portals",
    typography: "IBM Plex Sans",
    motion: "Fast Snap",
    density: "Compact",
    whyItWorks: [
      "Cyan perimeters highlight active terminal interfaces cleanly.",
      "Underlying grid overlay patterns structure dashboard telemetry grids.",
      "Technically dense font layouts provide rapid visual scanner-ability."
    ],
    aliases: ["Cyberpunk", "Raycast", "Developer Tool", "Cloud Portal", "Grid Neon"]
  }
};

