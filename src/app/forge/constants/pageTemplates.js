export const PAGE_TYPES = [
  { id: 'Dashboard Panel', label: 'Dashboard Panel', desc: 'Sidebar admin dashboard grid, metric widgets, table structures.', image: '/pages/dashboard.png' },
  { id: 'Landing Homepage', label: 'Landing Homepage', desc: 'SaaS product presentation, CTA banners, pricing grids, FAQs.', image: '/pages/landing.png' },
  { id: 'Login Page', label: 'Login Page', desc: 'Glassmorphic login entry card with transitions.', image: '/pages/login.png' },
  { id: 'Signup Page', label: 'Signup Page', desc: 'Form wizards, secure validation checkmarks.', image: '/pages/login.png' },
  { id: 'Settings Page', label: 'Settings Page', desc: 'Vertical menu navigation tabs, settings forms.', image: '/pages/settings.png' },
  { id: 'Profile Page', label: 'Profile Page', desc: 'User information header grids, feed stream widgets.', image: '/pages/profile.png' }
];

export const PAGE_COMPONENTS = {
  'Dashboard Panel': ['Collapsible Sidebar', 'KPI Metric Cards', 'Sortable Data Table', 'Command Palette (Cmd+K)', 'Skeleton Shimmer Loaders', 'Toast Notifications', 'Quick Stats Charts'],
  'Landing Homepage': ['Hero CTA Section', 'Bento Grid Features', 'Client Logo Marquee Ticker', 'Testimonial Carousel', 'Accordion FAQ Collapsible', 'Floating Bottom Nav', 'Interactive Video Showcase'],
  'Login Page': ['Glassmorphism Entry Card', 'Floating Input Labels', 'OTP Verification Code Input', 'Spring Scale Checkmark Bounces', 'Switch Mode Toggle', 'Error Validation States'],
  'Signup Page': ['Multi-step Registration Form', 'Password Strength Estimator', 'Terms of Service Checkbox', 'Oauth Social Logins', 'Success Animation Screen', 'Email Verification Code'],
  'Settings Page': ['Vertical Tab Navigation', 'Profile Avatar Uploader', 'Toggle Notification Switches', 'API Key Management Board', 'Danger Zone Deactivation Card', 'Preferences Form'],
  'Profile Page': ['User Profile Header', 'Activity Stream Feed', 'Follower/Connection Stats', 'Editable Contact Details', 'Bio Summary Box', 'Recent Uploads Gallery', 'Social Media Links']
};
