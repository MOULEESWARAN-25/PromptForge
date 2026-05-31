import React from 'react';
import { getThemeCardDynamicStyles } from '../utils/themeStyles';
import { themeStyles } from '@/data/designVocabulary';

const FONT_MAP = {
  'Inter':             "var(--font-inter)",
  'Geist':             "var(--font-display)",
  'Manrope':           "var(--font-manrope)",
  'Poppins':           "var(--font-poppins)",
  'DM Sans':           "var(--font-dm-sans)",
  'Outfit':            "var(--font-outfit)",
  'Plus Jakarta Sans': "var(--font-plus-jakarta-sans)",
  'Space Grotesk':     "var(--font-space-grotesk)",
  'Sora':              "var(--font-sora)",
  'Nunito':            "var(--font-nunito)",
  'Urbanist':          "var(--font-urbanist)",
  'IBM Plex Sans':     "var(--font-ibm-plex-sans)",
  'JetBrains Mono':    "var(--font-jetbrains-mono)",
  'Recursive':         "var(--font-recursive)",
  'Syne':              "var(--font-syne)",
  'Playfair Display':  "var(--font-playfair-display)",
  'Lexend':            "var(--font-lexend)"
};

// ── Mock Data for Domain Categories ──
const DOMAIN_DATA = {
  saas: {
    metrics: [
      { label: 'MRR', value: '$42,580', change: '+12.3%', up: true },
      { label: 'Active Users', value: '3,248', change: '+8.4%', up: true },
      { label: 'Churn Rate', value: '1.8%', change: '-0.3%', up: false }
    ],
    tableHeaders: ['User', 'Role', 'Status', 'Activity'],
    tableRows: [
      ['Aiden Park', 'Admin', 'Active', '2m ago'],
      ['Priya Nair', 'Member', 'Active', '1h ago'],
      ['Carlos Mendez', 'Member', 'Inactive', '2d ago']
    ],
    chartTitle: 'Monthly Recurring Revenue',
    chartValues: [35, 48, 62, 55, 78, 92, 85]
  },
  ecom: {
    metrics: [
      { label: 'Daily Sales', value: '$12,480', change: '+24.1%', up: true },
      { label: 'Conversion', value: '3.4%', change: '+0.5%', up: true },
      { label: 'Pending Orders', value: '42', change: '-5', up: false }
    ],
    tableHeaders: ['Product', 'Price', 'Stock', 'Sales'],
    tableRows: [
      ['Air Max Sneakers', '$149', '88 in stock', '124 sold'],
      ['Classic Cotton Tee', '$39', '142 in stock', '310 sold'],
      ['Cargo Pants Slim', '$89', '12 in stock', '98 sold']
    ],
    chartTitle: 'Daily Sales Conversion Curve',
    chartValues: [40, 58, 35, 68, 82, 95, 75]
  },
  student: {
    metrics: [
      { label: 'Active Students', value: '1,247', change: '+12', up: true },
      { label: 'Attendance', value: '94.2%', change: '+1.1%', up: true },
      { label: 'Average GPA', value: '3.65', change: '+0.04', up: true }
    ],
    tableHeaders: ['Student Name', 'Grade', 'Attendance', 'Status'],
    tableRows: [
      ['Aiden Park', 'A (94%)', '96.5%', 'Excellent'],
      ['Priya Nair', 'B+ (87%)', '92.1%', 'On Track'],
      ['Carlos Mendez', 'B (78%)', '88.4%', 'Needs Review']
    ],
    chartTitle: 'Average Grade Progression',
    chartValues: [68, 74, 71, 83, 79, 88, 86]
  },
  healthcare: {
    metrics: [
      { label: 'Appointments Today', value: '24', change: '+4 vs yesterday', up: true },
      { label: 'Occupied Beds', value: '88%', change: '+2%', up: true },
      { label: 'Vitals Alerts', value: '0', change: 'Normal', up: false }
    ],
    tableHeaders: ['Patient', 'Vitals', 'Status', 'Doctor'],
    tableRows: [
      ['Sarah Jenkins', 'Pulse 72 / Temp 98.6', 'Stable', 'Dr. Kim'],
      ['David Miller', 'Pulse 94 / Temp 100.2', 'Warning', 'Dr. Chen'],
      ['Emma Watson', 'Pulse 64 / Temp 97.9', 'Stable', 'Dr. Kim']
    ],
    chartTitle: 'Admissions & Patient Flow',
    chartValues: [22, 36, 42, 28, 52, 45, 58]
  },
  fitness: {
    metrics: [
      { label: 'Workouts Completed', value: '342', change: '+14%', up: true },
      { label: 'Daily Calorie Avg', value: '2,150 kcal', change: '-120 kcal', up: false },
      { label: 'Active Minutes', value: '120m', change: '+15m', up: true }
    ],
    tableHeaders: ['Exercise Name', 'Sets x Reps', 'Target Weight', 'Status'],
    tableRows: [
      ['Bench Press', '3 sets x 8 reps', '185 lbs', 'Completed'],
      ['Squat Progress', '4 sets x 6 reps', '225 lbs', 'In Progress'],
      ['Dumbbell Curl', '3 sets x 12 reps', '35 lbs', 'Completed']
    ],
    chartTitle: 'Weekly Calorie Expenditure',
    chartValues: [30, 42, 54, 48, 62, 75, 68]
  },
  portfolio: {
    metrics: [
      { label: 'Page Views', value: '1,840', change: '+45%', up: true },
      { label: 'Active Inquiries', value: '12', change: '+3 new', up: true },
      { label: 'Project Count', value: '28', change: 'Published', up: true }
    ],
    tableHeaders: ['Project Title', 'Category', 'Year', 'Status'],
    tableRows: [
      ['SaaS Dashboard Redesign', 'UI/UX Design', '2026', 'Featured'],
      ['E-Commerce App Mobile', 'Product Design', '2025', 'Completed'],
      ['Interactive Mesh BG', 'Creative Coding', '2026', 'WIP']
    ],
    chartTitle: 'Referral Web Traffic Sources',
    chartValues: [28, 38, 52, 32, 58, 76, 70]
  },
  billing: {
    metrics: [
      { label: 'Billed This Month', value: '$12,840', change: '+18.5%', up: true },
      { label: 'Pending Payments', value: '$3,200', change: '-$400', up: false },
      { label: 'Overdue Invoices', value: '$1,200', change: '1 Invoice', up: true }
    ],
    tableHeaders: ['Invoice ID', 'Client', 'Amount', 'Status'],
    tableRows: [
      ['INV-0047', 'Acme Corp', '$2,400', 'Paid'],
      ['INV-0048', 'Figma Co', '$800', 'Pending'],
      ['INV-0049', 'Linear App', '$1,200', 'Overdue']
    ],
    chartTitle: 'Monthly Billing & Collections',
    chartValues: [38, 28, 52, 62, 78, 92, 82]
  },
  realestate: {
    metrics: [
      { label: 'Listed Properties', value: '148', change: '+12 new', up: true },
      { label: 'Open Houses', value: '12', change: 'This Weekend', up: true },
      { label: 'Avg Days on Market', value: '18', change: '-4 days', up: false }
    ],
    tableHeaders: ['Address', 'Price', 'Beds/Baths', 'Status'],
    tableRows: [
      ['14 Oak Lane', '$320,000', '3 Bed / 2 Bath', 'Active'],
      ['72 Central Loft', '$485,000', '1 Bed / 1 Bath', 'Pending'],
      ['5 Pine Crest Rd', '$650,000', '4 Bed / 3.5 Bath', 'Active']
    ],
    chartTitle: 'Median Real Estate Value Trend',
    chartValues: [48, 52, 56, 60, 58, 65, 70]
  }
};

// ── Theme-aware Component Previews ──
function CommandPreview({ theme, font }) {
  const borderStyle = `1px solid ${theme.textSecondary}33`;
  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ background: theme.surface, border: borderStyle, borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', opacity: 0.6, color: theme.textPrimary }}>⌘</span>
        <span style={{ fontSize: '0.55rem', marginLeft: '6px', color: theme.textSecondary, flex: 1 }}>Search commands...</span>
        <span style={{ fontSize: '0.45rem', padding: '1px 5px', borderRadius: '4px', background: `${theme.textSecondary}22`, color: theme.textSecondary }}>ESC</span>
      </div>
      {[
        ['⬡', 'New Project', '⌘N', true],
        ['↗', 'Dashboard', '⌘D', false],
        ['⚙', 'Settings', '⌘,', false],
        ['?', 'Help', '⌘?', false]
      ].map(([ic, cmd, sc, act]) => (
        <div key={cmd} style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '6px', background: act ? `${theme.primary}22` : 'transparent' }}>
          <span style={{ fontSize: '0.58rem', width: '14px', textAlign: 'center', color: act ? theme.primary : theme.textSecondary }}>{ic}</span>
          <span style={{ flex: 1, fontSize: '0.56rem', fontWeight: act ? 700 : 500, color: act ? theme.textPrimary : theme.textSecondary, marginLeft: '8px' }}>{cmd}</span>
          <span style={{ fontSize: '0.48rem', color: theme.textSecondary, fontFamily: 'monospace' }}>{sc}</span>
        </div>
      ))}
    </div>
  );
}

function ModalPreview({ theme, font }) {
  const borderStyle = `1px solid ${theme.textSecondary}33`;
  return (
    <div style={{ fontFamily: font, padding: '0.2rem' }}>
      <div style={{ background: theme.surface, borderRadius: '12px', padding: '0.9rem', border: borderStyle, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: theme.textPrimary }}>Confirm Delete Action</span>
          <span style={{ fontSize: '0.58rem', color: theme.textSecondary, cursor: 'pointer' }}>✕</span>
        </div>
        <div style={{ fontSize: '0.52rem', color: theme.textSecondary, lineHeight: 1.6, marginBottom: '0.6rem' }}>This action cannot be undone. All project blueprint files will be permanently deleted from the registry.</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, padding: '0.32rem', background: '#dc2626', border: '1px solid #b91c1c', borderRadius: '6px', fontSize: '0.52rem', fontWeight: 700, color: '#ffffff', textAlign: 'center', cursor: 'pointer' }}>Delete</div>
          <div style={{ flex: 1, padding: '0.32rem', background: 'transparent', border: `1px solid ${theme.textSecondary}88`, borderRadius: '6px', fontSize: '0.52rem', fontWeight: 600, color: theme.textPrimary, textAlign: 'center', cursor: 'pointer' }}>Cancel</div>
        </div>
      </div>
    </div>
  );
}

function PricingPreview({ theme, font }) {
  const borderStyle = `1px solid ${theme.textSecondary}33`;
  return (
    <div style={{ fontFamily: font, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
      {[
        ['Starter', '$0', false],
        ['Pro ✦', '$19', true],
        ['Team', '$49', false]
      ].map(([tier, price, hot]) => (
        <div key={tier} style={{ padding: '0.5rem', borderRadius: '8px', border: hot ? `1.5px solid ${theme.primary}` : borderStyle, background: hot ? `${theme.primary}12` : theme.surface, boxShadow: hot ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, color: hot ? theme.primary : theme.textSecondary }}>{tier}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: theme.textPrimary, marginTop: '2px' }}>{price}<span style={{ fontSize: '0.45rem', fontWeight: 500, color: theme.textSecondary }}>/mo</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem', marginTop: '0.3rem' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '3px', borderRadius: '2px', background: hot ? `${theme.primary}60` : `${theme.textSecondary}33` }} />)}
          </div>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, color: hot ? '#ffffff' : theme.textPrimary, background: hot ? theme.primary : `${theme.textSecondary}22`, padding: '0.22rem', borderRadius: '5px', textAlign: 'center', marginTop: '0.35rem', cursor: 'pointer' }}>Subscribe</div>
        </div>
      ))}
    </div>
  );
}

function SidebarPreview({ theme, font }) {
  const borderStyle = `1px solid ${theme.textSecondary}33`;
  return (
    <div style={{ fontFamily: font, display: 'flex', gap: '0.3rem', height: '5.5rem' }}>
      <div style={{ width: '36px', background: theme.surface, borderRight: borderStyle, padding: '0.4rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: theme.primary }} />
        {[1, 0, 0, 0].map((a, i) => (
          <div key={i} style={{ width: '16px', height: '16px', borderRadius: '4px', background: a ? `${theme.primary}30` : `${theme.textSecondary}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '6px', height: '2px', background: a ? theme.primary : theme.textSecondary }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '0.5rem 0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {['Dashboard', 'Analytics', 'Projects', 'Settings'].map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.2rem 0.35rem', borderRadius: '5px', background: i === 0 ? `${theme.primary}18` : 'transparent' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? theme.primary : theme.textSecondary, flexShrink: 0 }} />
            <span style={{ fontSize: '0.52rem', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? theme.textPrimary : theme.textSecondary }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATIC_COMP_MAP = {
  'Interactive Command Palette': CommandPreview,
  'Glassmorphic Modal Dialog':   ModalPreview,
  'Pricing Card Matrix':         PricingPreview,
  'Collapsible Sidebar Navigation': SidebarPreview,
};

export function ThemePreview({ 
  selectedTheme, 
  activeMode, 
  appCategory, 
  pageType, 
  componentType, 
  customCategory, 
  customComponentType, 
  selectedTypography,
  selectedComponents = [],
  selectedFeatures = []
}) {
  if (!selectedTheme) return null;

  // Resolve theme object (Single Source of Truth)
  const theme = themeStyles[selectedTheme] || {
    background: "rgba(10, 5, 22, 0.95)",
    surface: "rgba(255, 255, 255, 0.05)",
    primary: "#7c3aed",
    secondary: "#a78bfa",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa"
  };

  const previewStyles = getThemeCardDynamicStyles(selectedTheme, true);
  const font = FONT_MAP[selectedTypography] || FONT_MAP['Inter'];
  const borderStyle = `1px solid ${theme.textSecondary}33`;

  // Parse active selection components list
  const activeComponents = activeMode === 'application' ? selectedFeatures : selectedComponents;

  // Layout detection rules
  const hasSidebar = activeComponents.some(c => c.toLowerCase().includes('sidebar'));
  const hasKpi = activeComponents.some(c => c.toLowerCase().includes('kpi') || c.toLowerCase().includes('metric') || c.toLowerCase().includes('stats') || c.toLowerCase().includes('cards'));
  const hasTable = activeComponents.some(c => c.toLowerCase().includes('table') || c.toLowerCase().includes('directory') || c.toLowerCase().includes('logs') || c.toLowerCase().includes('list'));
  const hasChart = activeComponents.some(c => c.toLowerCase().includes('chart') || c.toLowerCase().includes('graph') || c.toLowerCase().includes('progress'));
  const hasSearch = activeComponents.some(c => c.toLowerCase().includes('search') || c.toLowerCase().includes('filter') || c.toLowerCase().includes('palette'));
  const hasForm = activeComponents.some(c => c.toLowerCase().includes('form') || c.toLowerCase().includes('auth') || c.toLowerCase().includes('login') || c.toLowerCase().includes('signup') || c.toLowerCase().includes('input') || c.toLowerCase().includes('preferences') || c.toLowerCase().includes('settings'));
  const hasPricing = activeComponents.some(c => c.toLowerCase().includes('pricing') || c.toLowerCase().includes('tier') || c.toLowerCase().includes('matrix'));

  // Resolve application category domain
  let domain = 'saas';
  const categoryStr = (appCategory || pageType || '').toLowerCase();
  if (categoryStr.includes('e-commerce') || categoryStr.includes('ecom') || categoryStr.includes('market')) {
    domain = 'ecom';
  } else if (categoryStr.includes('student') || categoryStr.includes('education') || categoryStr.includes('school')) {
    domain = 'student';
  } else if (categoryStr.includes('health') || categoryStr.includes('medical') || categoryStr.includes('clinic')) {
    domain = 'healthcare';
  } else if (categoryStr.includes('fitness') || categoryStr.includes('workout') || categoryStr.includes('gym')) {
    domain = 'fitness';
  } else if (categoryStr.includes('portfolio') || categoryStr.includes('creative') || categoryStr.includes('gallery')) {
    domain = 'portfolio';
  } else if (categoryStr.includes('billing') || categoryStr.includes('invoice') || categoryStr.includes('freelance')) {
    domain = 'billing';
  } else if (categoryStr.includes('real estate') || categoryStr.includes('property') || categoryStr.includes('house')) {
    domain = 'realestate';
  }

  const mockData = DOMAIN_DATA[domain] || DOMAIN_DATA['saas'];
  const title = activeMode === 'application' 
    ? (appCategory === 'Custom' ? (customCategory || 'Custom SaaS App') : (appCategory || 'Application Workspace'))
    : (pageType || 'Web Page Design');

  // Renders the composed layout components based on user selection checkboxes
  const renderComposedLayout = () => {
    const mainContentArea = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: 0 }}>
        {/* Row 1: Header + Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderBottom: borderStyle, paddingBottom: '0.35rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: theme.textPrimary }}>
            {title}
          </div>
          {hasSearch && (
            <div style={{ display: 'flex', alignItems: 'center', background: theme.surface, border: borderStyle, borderRadius: '4px', padding: '1px 6px', width: '90px' }}>
              <span style={{ fontSize: '0.45rem', color: theme.textSecondary }}>Search...</span>
            </div>
          )}
        </div>

        {/* Row 2: Form Interface */}
        {hasForm && (
          <div style={{ padding: '0.5rem', background: theme.surface, border: borderStyle, borderRadius: '6px' }}>
            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '0.3rem' }}>Information Form</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ height: '10px', background: `${theme.textSecondary}22`, borderRadius: '2px', width: '40%' }} />
              <div style={{ height: '14px', background: 'transparent', border: borderStyle, borderRadius: '3px' }} />
              <div style={{ height: '10px', background: `${theme.textSecondary}22`, borderRadius: '2px', width: '30%' }} />
              <div style={{ height: '14px', background: 'transparent', border: borderStyle, borderRadius: '3px' }} />
              <div style={{ height: '16px', background: theme.primary, borderRadius: '4px', color: '#ffffff', fontSize: '0.48rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2rem' }}>Save Settings</div>
            </div>
          </div>
        )}

        {/* Row 3: KPI Metrics Cards */}
        {hasKpi && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
            {mockData.metrics.map((m, idx) => (
              <div key={idx} style={{ padding: '0.35rem 0.5rem', background: theme.surface, border: borderStyle, borderRadius: '6px' }}>
                <div style={{ fontSize: '0.45rem', color: theme.textSecondary, fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: theme.textPrimary, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{m.value}</span>
                  <span style={{ fontSize: '0.42rem', color: m.up ? '#10b981' : '#f43f5e' }}>{m.change}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Row 4: Chart panel */}
        {hasChart && (
          <div style={{ padding: '0.4rem 0.5rem', background: theme.surface, border: borderStyle, borderRadius: '6px' }}>
            <div style={{ fontSize: '0.45rem', color: theme.textSecondary, fontWeight: 600 }}>{mockData.chartTitle}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '1.4rem', marginTop: '0.25rem' }}>
              {mockData.chartValues.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0', background: i === 5 ? theme.primary : `${theme.primary}35` }} />
              ))}
            </div>
          </div>
        )}

        {/* Row 5: Pricing Matrix */}
        {hasPricing && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
            {[['Starter', '$0'], ['Pro', '$29'], ['Premium', '$99']].map(([name, price], idx) => (
              <div key={idx} style={{ padding: '0.4rem', border: idx === 1 ? `1px solid ${theme.primary}` : borderStyle, borderRadius: '6px', background: idx === 1 ? `${theme.primary}10` : 'transparent', textAlign: 'center' }}>
                <div style={{ fontSize: '0.46rem', fontWeight: 700, color: idx === 1 ? theme.primary : theme.textSecondary }}>{name}</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, color: theme.textPrimary, marginTop: '1px' }}>{price}</div>
                <div style={{ height: '2px', background: `${theme.textSecondary}33`, margin: '4px 0' }} />
                <div style={{ fontSize: '0.4rem', padding: '2px', background: idx === 1 ? theme.primary : `${theme.textSecondary}22`, color: idx === 1 ? '#ffffff' : theme.textPrimary, borderRadius: '3px', marginTop: '4px' }}>Select</div>
              </div>
            ))}
          </div>
        )}

        {/* Row 6: Data Table */}
        {hasTable && (
          <div style={{ overflow: 'hidden', border: borderStyle, borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.48rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: theme.surface, borderBottom: borderStyle }}>
                  {mockData.tableHeaders.map((h, i) => (
                    <th key={i} style={{ padding: '3px 6px', fontWeight: 700, color: theme.textPrimary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockData.tableRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: rIdx < 2 ? borderStyle : 'none' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '4px 6px', color: cIdx === 0 ? theme.textPrimary : theme.textSecondary }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fallback if no components are selected yet */}
        {!hasKpi && !hasTable && !hasChart && !hasForm && !hasPricing && (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: theme.textSecondary, fontSize: '0.52rem', border: `1px dashed ${theme.textSecondary}55`, borderRadius: '6px' }}>
            No components toggled. Add features or layout elements in the left panel to compose the preview.
          </div>
        )}
      </div>
    );

    if (hasSidebar) {
      return (
        <div style={{ display: 'flex', gap: '0.45rem', width: '100%', height: '100%' }}>
          {/* Left Mini Sidebar Column */}
          <div style={{ width: '38px', background: theme.surface, borderRight: borderStyle, borderRadius: '6px', padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: theme.primary }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: i === 1 ? `${theme.primary}30` : `${theme.textSecondary}11`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '6px', height: '2px', background: i === 1 ? theme.primary : theme.textSecondary }} />
              </div>
            ))}
          </div>
          {/* Right Main Content */}
          {mainContentArea}
        </div>
      );
    }

    return mainContentArea;
  };

  // Standalone component preview routing (for Component Mode)
  let StandalonePreview = null;
  if (activeMode === 'component') {
    StandalonePreview = componentType !== 'Custom Component' ? STATIC_COMP_MAP[componentType] : null;
  }

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }} className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.primary, margin: 0 }}>Live Preview Config</h4>
        {selectedTypography && <span style={{ fontSize: '0.62rem', color: theme.textSecondary, fontStyle: 'italic' }}>{selectedTypography} · {selectedTheme}</span>}
      </div>

      <div style={{ ...previewStyles, background: theme.background, color: theme.textPrimary, border: borderStyle, cursor: 'default', padding: '0.8rem', minHeight: '10rem', fontFamily: font }} className="noise-overlay">
        {/* Top bar indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: borderStyle, paddingBottom: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.5rem', color: theme.textSecondary, fontStyle: 'italic' }}>{selectedTheme} style preview</span>
        </div>

        {activeMode === 'component' ? (
          StandalonePreview ? (
            <StandalonePreview theme={theme} font={font} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: theme.textPrimary }}>
                {customComponentType || 'Custom Component Layout'}
              </div>
              {[1, 2].map(i => (
                <div key={i} style={{ height: '1.2rem', background: theme.surface, border: borderStyle, borderRadius: '6px' }} />
              ))}
            </div>
          )
        ) : (
          renderComposedLayout()
        )}
      </div>
    </div>
  );
}
