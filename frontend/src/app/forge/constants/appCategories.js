export const APP_CATEGORIES = [
  { id: 'SaaS Dashboard Admin Panel', label: 'SaaS Dashboard', desc: 'Enterprise management dashboards, metrics widgets, analytics grids.', icon: 'LayoutGrid' },
  { id: 'E-Commerce Marketplace', label: 'E-Commerce', desc: 'Product grid catalog, cart, checkout checkout, client profiles.', icon: 'ShoppingCart' },
  { id: 'Student Management Hub', label: 'Student Hub', desc: 'Student databases, gradebooks, schedulers, parental analytics.', icon: 'GraduationCap' },
  { id: 'Freelancer Billing Platform', label: 'Billing Platform', desc: 'Invoice generators, payment integrations, client lists.', icon: 'Receipt' },
  { id: 'Digital Creative Portfolio', label: 'Creative Portfolio', desc: 'Grid galleries, lightboxes, timeline resumes, contact forms.', icon: 'Image' },
  { id: 'Healthcare Tracker', label: 'Healthcare Tracker', desc: 'Patient charts, vitals visualizers, logs, schedules.', icon: 'Activity' },
  { id: 'Fitness Planner', label: 'Fitness Planner', desc: 'Workout builders, calorie logs, weight progression widgets.', icon: 'Dumbbell' },
  { id: 'Real Estate Portal', label: 'Real Estate Portal', desc: 'Map search, property highlights, agent panels, pricing lists.', icon: 'Home' },
  { id: 'Custom', label: 'Custom Application', desc: 'Describe your own custom software structure.', icon: 'Code2' }
];

export const CATEGORY_FEATURES = {
  'SaaS Dashboard Admin Panel': ['KPI Metric Cards', 'Interactive Charts', 'Data Tables & Filters', 'User Role Permissions', 'Activity Logs', 'Dark Mode Toggle', 'CSV/PDF Data Export', 'Collapsible Sidebar'],
  'E-Commerce Marketplace': ['Product Search & Filter', 'Shopping Cart & Checkout', 'Product Detail Gallery', 'Customer Reviews', 'Order Tracking Dashboard', 'Stripe Payment Integration', 'Wishlist Page'],
  'Student Management Hub': ['Student Directory', 'Grades & Performance Analytics', 'Attendance Tracker', 'Course Scheduler', 'Teacher Portal', 'Parent Notifications', 'Assignment Submit Area'],
  'Freelancer Billing Platform': ['Invoice Generator', 'Client Contact Manager', 'Payment Status Dashboard', 'Time Tracker Widget', 'Recurring Subscriptions', 'Stripe/PayPal Integration', 'Expense Reports'],
  'Digital Creative Portfolio': ['Filterable Project Grid', 'Image/Video Lightbox', 'About Me Hero Page', 'Contact Form with Validation', 'Interactive Resume Timeline', 'Social Media Integration', 'Testimonial Slider'],
  'Healthcare Tracker': ['Appointment Scheduler', 'Patient Medical Records', 'Prescription Tracker', 'Vitals Metric Cards', 'Doctor Chat Interface', 'Wearable Sync Dashboard', 'Health Goals Tracker'],
  'Fitness Planner': ['Workout Builder', 'Calorie Counter Dashboard', 'Weight Progress Graph', 'Exercise Video Library', 'Weekly Routine Planner', 'Achievement Badges', 'Water Intake Tracker'],
  'Real Estate Portal': ['Interactive Map Search', 'Property Detail Carousel', 'Mortgage Calculator', 'Agent Contact Panel', 'Filter Criteria (Price, Beds)', 'Virtual Tour Link Showcase', 'Saved Searches'],
  'Custom': ['User Authentication', 'Database API Connect', 'CRUD Action Panel', 'Responsive Grid Layout', 'Dark Mode Toggle', 'Email Notifications', 'Interactive Dashboard Panels', 'Activity Stream Log']
};

export const AI_FEATURE_SUGGESTIONS = {
  'SaaS Dashboard Admin Panel': ['Multi-tenant Architecture', 'Webhook Integrations', 'Audit Logging', 'API Key Management', 'Custom Themes', 'Two-Factor Authentication (2FA)'],
  'E-Commerce Marketplace': ['Abandoned Cart Recovery', 'AI Product Recommendations', 'Dynamic Pricing', 'Social Proof Popups', 'Multi-currency Support', 'Subscription Orders'],
  'Student Management Hub': ['Automated Grading', 'Plagiarism Checker Integration', 'Video Classroom', 'Gamified Badges', 'Alumni Network', 'Behavioral Insights'],
  'Freelancer Billing Platform': ['Automated Tax Calculation', 'Contract E-Signatures', 'Multi-currency Invoicing', 'Client Portal', 'Late Fee Automation'],
  'Digital Creative Portfolio': ['3D Asset Viewer', 'Password Protected Galleries', 'Notion-like Blog', 'Client Feedback Comments', 'Custom Domain Setup'],
  'Healthcare Tracker': ['Telemedicine Video Chat', 'HL7/FHIR Integration', 'Symptom Checker AI', 'Medication Reminders', 'Secure Document Vault'],
  'Fitness Planner': ['Strava/Apple Health Sync', 'AI Workout Generator', 'Meal Plan Builder', 'Macro Calculator', 'Community Challenges'],
  'Real Estate Portal': ['3D Virtual Tours', 'Neighborhood Crime Stats', 'Automated Valuation Model', 'Agent Lead Routing', 'Rent Payment Portal'],
  'Custom': ['AI Content Generation', 'Real-time WebSockets', 'OAuth2 Social Login', 'Stripe Subscriptions', 'Analytics Dashboard', 'File Upload AWS S3']
};
