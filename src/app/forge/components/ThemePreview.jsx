import React from 'react';
import { getThemeCardDynamicStyles } from '../utils/themeStyles';

const CA = {
  'SaaS Dashboard Admin Panel':  { p: '#7c3aed', s: '#a78bfa' },
  'E-Commerce Marketplace':       { p: '#2563eb', s: '#60a5fa' },
  'Student Management Hub':       { p: '#0891b2', s: '#38bdf8' },
  'Freelancer Billing Platform':  { p: '#059669', s: '#34d399' },
  'Digital Creative Portfolio':   { p: '#db2777', s: '#f472b6' },
  'Healthcare Tracker':           { p: '#0d9488', s: '#2dd4bf' },
  'Fitness Planner':              { p: '#ea580c', s: '#fb923c' },
  'Real Estate Portal':           { p: '#ca8a04', s: '#fbbf24' },
};

const LIGHT_THEMES = new Set([
  'Wes Anderson',
  'Wes Anderson Retro',
  'Minimalist Typography',
  'Stripe Inspired',
  'Notion Style',
  'Apple Inspired',
  'Material Design',
  'Neo Brutalism',
  'Healthcare Clean',
  'Education Classic',
  'Enterprise Slate',
  'Sunset Warmth',
  'Ocean Breeze'
]);

const FONT_MAP = {
  'Inter':    "'Inter', sans-serif",
  'Geist':    "'Geist', sans-serif",
  'Manrope':  "'Manrope', sans-serif",
  'Poppins':  "'Poppins', sans-serif",
  'DM Sans':  "'DM Sans', sans-serif",
  'Outfit':   "'Outfit', sans-serif",
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

// ── Older Static Component Mappings (For standalone component preview mode) ──
function CommandPreview({ p, font, isLight }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
      <div style={{ background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize:'0.65rem', opacity:.5, color: isLight?'#000':'#fff' }}>⌘</span>
        <span style={{ fontSize:'0.55rem', marginLeft:'6px', color: 'var(--muted-foreground)', flex:1 }}>Search commands...</span>
        <span style={{ fontSize:'0.45rem', padding: '1px 5px', borderRadius: '4px', background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>ESC</span>
      </div>
      {[['⬡','New Project','⌘N',true],['↗','Dashboard','⌘D',false],['⚙','Settings','⌘,',false],['?','Help','⌘?',false]].map(([ic,cmd,sc,act])=>(
        <div key={cmd} style={{ display:'flex', alignItems:'center', padding:'0.25rem 0.5rem', borderRadius:'6px', background: act?`${p}18`:'transparent' }}>
          <span style={{ fontSize:'0.58rem', width:'14px', textAlign:'center', color: act?p:'var(--muted-foreground)' }}>{ic}</span>
          <span style={{ flex:1, fontSize:'0.56rem', fontWeight: act?700:500, color: act?(isLight?'#000':'#fff'):'var(--muted-foreground)', marginLeft:'8px' }}>{cmd}</span>
          <span style={{ fontSize:'0.48rem', color:'var(--muted-foreground)', fontFamily:'monospace' }}>{sc}</span>
        </div>
      ))}
    </div>
  );
}

function ModalPreview({ font, isLight }) {
  return (
    <div style={{ fontFamily:font, padding:'0.2rem' }}>
      <div style={{ background: isLight ? '#ffffff' : 'rgba(12,12,18,0.92)', backdropFilter:'blur(16px)', borderRadius:'12px', padding:'0.9rem', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)', boxShadow:'0 10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
          <span style={{ fontSize:'0.62rem', fontWeight:800, color: isLight?'#0f172a':'#fff' }}>Confirm Delete Action</span>
          <span style={{ fontSize:'0.58rem', color:'var(--muted-foreground)', cursor:'pointer' }}>✕</span>
        </div>
        <div style={{ fontSize:'0.52rem', color:'var(--muted-foreground)', lineHeight:1.6, marginBottom:'0.6rem' }}>This action cannot be undone. All project blueprint files will be permanently deleted from the registry.</div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <div style={{ flex:1, padding:'0.32rem', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px', fontSize:'0.52rem', fontWeight:700, color:'#ef4444', textAlign:'center', cursor:'pointer' }}>Delete</div>
          <div style={{ flex:1, padding:'0.32rem', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius:'6px', fontSize:'0.52rem', fontWeight:600, color:'var(--foreground)', textAlign:'center', cursor:'pointer' }}>Cancel</div>
        </div>
      </div>
    </div>
  );
}

function PricingPreview({ p, font, isLight }) {
  return (
    <div style={{ fontFamily:font, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.25rem' }}>
      {[['Starter','$0',false],['Pro ✦','$19',true],['Team','$49',false]].map(([tier,price,hot])=>(
        <div key={tier} style={{ padding:'0.5rem', borderRadius:'8px', border: hot?`1.5px solid ${p}`:'1px solid var(--border)', background: hot?`${p}12`: (isLight?'#ffffff':'rgba(255,255,255,0.02)'), boxShadow: hot?'0 4px 12px rgba(0,0,0,0.05)':'none' }}>
          <div style={{ fontSize:'0.52rem', fontWeight:700, color: hot?p:'var(--muted-foreground)' }}>{tier}</div>
          <div style={{ fontSize:'0.72rem', fontWeight:800, color: isLight?'#0f172a':'#fff', marginTop:'2px' }}>{price}<span style={{ fontSize:'0.45rem', fontWeight:500, color:'var(--muted-foreground)' }}>/mo</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.18rem', marginTop:'0.3rem' }}>
            {[1,2,3].map(i=><div key={i} style={{ height:'3px', borderRadius:'2px', background: hot?`${p}60`:'var(--border)' }} />)}
          </div>
          <div style={{ fontSize:'0.5rem', fontWeight:700, color: hot?'#fff': 'var(--foreground)', background: hot?p:'var(--border)', padding:'0.22rem', borderRadius:'5px', textAlign:'center', marginTop:'0.35rem', cursor:'pointer' }}>Subscribe</div>
        </div>
      ))}
    </div>
  );
}

function SidebarPreview({ p, font, isLight }) {
  return (
    <div style={{ fontFamily:font, display:'flex', gap:'0.3rem', height:'5.5rem' }}>
      <div style={{ width:'36px', background: isLight?'#f1f5f9':'rgba(0,0,0,0.25)', borderRight:'1px solid var(--border)', padding:'0.4rem 0.25rem', display:'flex', flexDirection:'column', gap:'0.35rem', alignItems:'center', flexShrink:0 }}>
        <div style={{ width:'16px', height:'16px', borderRadius:'4px', background:p }} />
        {[1,0,0,0].map((a,i)=><div key={i} style={{ width:'16px', height:'16px', borderRadius:'4px', background: a?`${p}30`:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }} />)}
      </div>
      <div style={{ flex:1, padding:'0.5rem 0.4rem', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
        {['Dashboard','Analytics','Projects','Settings'].map((l,i)=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0.2rem 0.35rem', borderRadius:'5px', background: i===0?`${p}18`:'transparent' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: i===0?p:'var(--muted-foreground)', flexShrink:0 }} />
            <span style={{ fontSize:'0.52rem', fontWeight: i===0?700:500, color: i===0?(isLight?'#000':'#fff'):'var(--muted-foreground)' }}>{l}</span>
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

  const previewStyles = getThemeCardDynamicStyles(selectedTheme, true);
  const font = FONT_MAP[selectedTypography] || FONT_MAP['Inter'];
  const isLight = LIGHT_THEMES.has(selectedTheme);
  
  // Resolve core primary/secondary accent colors
  const catAccent = CA[appCategory] || { p: '#7c3aed', s: '#a78bfa' };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
            {title}
          </div>
          {hasSearch && (
            <div style={{ display: 'flex', alignItems: 'center', background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', width: '90px' }}>
              <span style={{ fontSize: '0.45rem', color: 'var(--muted-foreground)' }}>Search...</span>
            </div>
          )}
        </div>

        {/* Row 2: Form Interface (if selected, e.g. login pages/settings forms take priority layout) */}
        {hasForm && (
          <div style={{ padding: '0.5rem', background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.52rem', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff', marginBottom: '0.3rem' }}>Information Form</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ height: '10px', background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: '2px', width: '40%' }} />
              <div style={{ height: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '3px' }} />
              <div style={{ height: '10px', background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: '2px', width: '30%' }} />
              <div style={{ height: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '3px' }} />
              <div style={{ height: '16px', background: catAccent.p, borderRadius: '4px', color: '#fff', fontSize: '0.48rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2rem' }}>Save Settings</div>
            </div>
          </div>
        )}

        {/* Row 3: KPI Metrics Cards */}
        {hasKpi && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
            {mockData.metrics.map((m, idx) => (
              <div key={idx} style={{ padding: '0.35rem 0.5rem', background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.45rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{m.value}</span>
                  <span style={{ fontSize: '0.42rem', color: m.up ? '#10b981' : '#f43f5e' }}>{m.change}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Row 4: Chart panel */}
        {hasChart && (
          <div style={{ padding: '0.4rem 0.5rem', background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.45rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>{mockData.chartTitle}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '1.4rem', marginTop: '0.25rem' }}>
              {mockData.chartValues.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0', background: i === 5 ? catAccent.p : `${catAccent.p}35` }} />
              ))}
            </div>
          </div>
        )}

        {/* Row 5: Pricing Matrix */}
        {hasPricing && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
            {[['Starter', '$0'], ['Pro', '$29'], ['Premium', '$99']].map(([name, price], idx) => (
              <div key={idx} style={{ padding: '0.4rem', border: idx === 1 ? `1px solid ${catAccent.p}` : '1px solid var(--border)', borderRadius: '6px', background: idx === 1 ? `${catAccent.p}10` : 'transparent', textAlign: 'center' }}>
                <div style={{ fontSize: '0.46rem', fontWeight: 700, color: idx === 1 ? catAccent.p : 'var(--muted-foreground)' }}>{name}</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff', marginTop: '1px' }}>{price}</div>
                <div style={{ height: '2px', background: 'var(--border)', margin: '4px 0' }} />
                <div style={{ fontSize: '0.4rem', padding: '2px', background: idx === 1 ? catAccent.p : 'var(--border)', color: '#fff', borderRadius: '3px', marginTop: '4px' }}>Select</div>
              </div>
            ))}
          </div>
        )}

        {/* Row 6: Data Table */}
        {hasTable && (
          <div style={{ overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.48rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  {mockData.tableHeaders.map((h, i) => (
                    <th key={i} style={{ padding: '3px 6px', fontWeight: 700, color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockData.tableRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: rIdx < 2 ? '1px solid var(--border)' : 'none' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '4px 6px', color: cIdx === 0 ? (isLight ? '#0f172a' : '#ffffff') : 'var(--muted-foreground)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fallback if no components are selected yet */}
        {!hasKpi && !hasTable && !hasChart && !hasForm && !hasPricing && (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.52rem', border: '1px dashed var(--border)', borderRadius: '6px' }}>
            No components toggled. Add features or layout elements in the left panel to compose the preview.
          </div>
        )}
      </div>
    );

    if (hasSidebar) {
      return (
        <div style={{ display: 'flex', gap: '0.45rem', width: '100%', height: '100%' }}>
          {/* Left Mini Sidebar Column */}
          <div style={{ width: '38px', background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.18)', borderRight: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: catAccent.p }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: i === 1 ? `${catAccent.p}30` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '6px', height: '2px', background: i === 1 ? catAccent.p : 'var(--muted-foreground)' }} />
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
        <h4 style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', margin: 0 }}>Live Preview Config</h4>
        {selectedTypography && <span style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>{selectedTypography} · {selectedTheme}</span>}
      </div>

      <div style={{ ...previewStyles, cursor: 'default', padding: '0.8rem', minHeight: '10rem', filter: isLight ? 'brightness(0.98)' : 'none', fontFamily: font }} className="noise-overlay">
        {/* Top bar indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.5rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>{selectedTheme} style preview</span>
        </div>

        {activeMode === 'component' ? (
          StandalonePreview ? (
            <StandalonePreview p={catAccent.p} font={font} isLight={isLight} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: isLight ? '#0f172a' : '#ffffff' }}>
                {customComponentType || 'Custom Component Layout'}
              </div>
              {[1, 2].map(i => (
                <div key={i} style={{ height: '1.2rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px' }} />
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
