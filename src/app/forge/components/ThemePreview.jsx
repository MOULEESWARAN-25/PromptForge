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

const LIGHT_THEMES = new Set(['Wes Anderson', 'Minimalist Typography']);

const row = (extra={}) => ({ display:'flex', alignItems:'center', gap:'0.35rem', ...extra });
const card = (accent, extra={}) => ({ background:`rgba(255,255,255,0.05)`, border:`1px solid rgba(255,255,255,0.08)`, borderRadius:'7px', padding:'0.32rem 0.5rem', ...extra });
const label = (sz='0.58rem', w=700, col='#fff') => ({ fontSize:sz, fontWeight:w, color:col, lineHeight:1.3 });
const muted = { fontSize:'0.48rem', color:'rgba(255,255,255,0.45)' };
const pill = (bg,col) => ({ fontSize:'0.46rem', fontWeight:700, padding:'1px 5px', borderRadius:'6px', background:bg, color:col });

function SaasPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', gap:'0.35rem', height:'100%' }}>
      <div style={{ width:'38px', background:'rgba(0,0,0,0.25)', borderRadius:'6px', padding:'0.4rem 0.3rem', display:'flex', flexDirection:'column', gap:'0.3rem', flexShrink:0 }}>
        <div style={{ width:'18px', height:'18px', borderRadius:'4px', background:p, margin:'0 auto 0.2rem' }} />
        {[1,1,0,0].map((a,i)=><div key={i} style={{ height:'5px', borderRadius:'3px', background: a ? p : 'rgba(255,255,255,0.1)' }} />)}
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.25rem' }}>
          {[['Revenue','$48.2k'],[' Users','2,847'],['Churn','2.1%']].map(([k,v])=>(
            <div key={k} style={card(p)}>
              <div style={label('0.45rem',600,'rgba(255,255,255,0.5)')}>{k}</div>
              <div style={label('0.7rem',800)}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card(p), flex:1 }}>
          <div style={label('0.45rem',600,'rgba(255,255,255,0.5)')}>Monthly Revenue</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'1.8rem', marginTop:'0.2rem' }}>
            {[45,60,38,75,55,90,70].map((h,i)=><div key={i} style={{ flex:1, height:`${h}%`, borderRadius:'2px 2px 0 0', background: i===5 ? p : `${p}40` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function EcomPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={row()}>{['All','👟 Shoes','👕 Tops','🔥 Sale'].map((f,i)=><span key={f} style={pill(i===0?p:'rgba(255,255,255,0.08)',i===0?'#fff':'rgba(255,255,255,0.5)')}>{f}</span>)}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem' }}>
        {[['Air Max','$149'],['Slim Tee','$39'],['Cargo','$89'],['Runner','$199']].map(([n,pr])=>(
          <div key={n} style={card(p)}>
            <div style={{ height:'1.4rem', background:`linear-gradient(135deg,${p}35,${s}20)`, borderRadius:'4px', marginBottom:'0.2rem' }} />
            <div style={label('0.55rem')}>{n}</div>
            <div style={label('0.52rem',700,s)}>{pr}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FitnessPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={row()}>
        <div style={{ position:'relative', width:'48px', height:'48px', flexShrink:0 }}>
          <svg viewBox="0 0 36 36" style={{ width:'48px', height:'48px', transform:'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" stroke="rgba(255,255,255,0.1)" />
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" stroke={p} strokeDasharray="70 94" strokeLinecap="round" />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', ...label('0.58rem',800) }}>74%</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={label()}>Today's Goal</div>
          <div style={muted}>1,847 / 2,200 kcal</div>
          <div style={{ height:'3px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', marginTop:'0.3rem' }}>
            <div style={{ width:'74%', height:'100%', background:p, borderRadius:'2px' }} />
          </div>
        </div>
      </div>
      {[['🏋️','Bench Press','3 × 8 reps'],['🚴','Cardio','20 min · 245 kcal'],['🧘','Cooldown','10 min']].map(([ic,n,d])=>(
        <div key={n} style={{ ...card(p), ...row() }}>
          <span style={{ fontSize:'0.6rem' }}>{ic}</span>
          <div style={{ flex:1 }}><div style={label()}>{n}</div><div style={muted}>{d}</div></div>
          <div style={{ width:'11px', height:'11px', borderRadius:'50%', border:`1.5px solid ${p}` }} />
        </div>
      ))}
    </div>
  );
}

function HealthPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.25rem' }}>
        {[['❤️','72','BPM'],['🌡️','98.6','°F'],['💤','7.4','hrs']].map(([ic,v,u])=>(
          <div key={u} style={{ ...card(p), textAlign:'center' }}>
            <div style={{ fontSize:'0.65rem' }}>{ic}</div>
            <div style={label('0.7rem',800)}>{v}</div>
            <div style={label('0.45rem',600,s)}>{u}</div>
          </div>
        ))}
      </div>
      {[['Dr. Kim · Cardiology','2:00 PM Today'],['Lab Blood Panel','Tomorrow 9 AM']].map(([n,t])=>(
        <div key={n} style={{ ...card(p), ...row() }}>
          <div style={{ width:'3px', height:'16px', borderRadius:'2px', background:p, flexShrink:0 }} />
          <div><div style={label()}>{n}</div><div style={muted}>{t}</div></div>
        </div>
      ))}
    </div>
  );
}

function BillingPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem' }}>
        {[['Total Billed','$12,840'],['Pending','$3,200']].map(([k,v])=>(
          <div key={k} style={card(p)}><div style={label('0.46rem',600,'rgba(255,255,255,0.5)')}>{k}</div><div style={label('0.72rem',800)}>{v}</div></div>
        ))}
      </div>
      {[['INV-047 · Acme Corp','$2,400','Paid'],['INV-048 · Figma Co.','$800','Pending'],['INV-049 · Linear','$1,200','Draft']].map(([inv,amt,st])=>(
        <div key={inv} style={{ ...card(p), ...row({ justifyContent:'space-between' }) }}>
          <div style={label('0.52rem')}>{inv}</div>
          <div style={row({ gap:'0.3rem' })}>
            <span style={label('0.52rem',700,s)}>{amt}</span>
            <span style={pill(st==='Paid'?`${p}25`:st==='Pending'?'rgba(251,191,36,0.15)':'rgba(255,255,255,0.06)', st==='Paid'?s:st==='Pending'?'#fbbf24':'rgba(255,255,255,0.4)')}>{st}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={row({ justifyContent:'space-between' })}>
        <span style={label()}>Class 10-B · Spring 2026</span>
        <span style={pill(`${p}20`, s)}>28 Students</span>
      </div>
      {[['A','Aiden Park','94%','A'],['P','Priya Nair','87%','B+'],['C','Carlos M.','78%','B']].map(([init,n,g,lt])=>(
        <div key={n} style={{ ...card(p), ...row() }}>
          <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:p, display:'flex', alignItems:'center', justifyContent:'center', ...label('0.48rem',800), flexShrink:0 }}>{init}</div>
          <div style={{ flex:1 }}><div style={label('0.56rem')}>{n}</div><div style={{ display:'flex', gap:'2px', marginTop:'1px' }}>{[1,2,3,4,5].map(d=><div key={d} style={{ width:'8px', height:'3px', borderRadius:'1px', background: d<=4?p:'rgba(255,255,255,0.1)' }} />)}</div></div>
          <span style={label('0.62rem',800,s)}>{lt}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.3rem' }}>
      <div style={{ ...card(p), background:`linear-gradient(135deg,${p}20,${s}10)`, ...row() }}>
        <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:p, flexShrink:0 }} />
        <div><div style={label()}>Creative Designer</div><div style={muted}>UI/UX · Motion · Brand</div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.2rem' }}>
        {[`${p}35`,`${s}25`,`${p}20`,`${s}30`,`${p}15`,'rgba(255,255,255,0.04)'].map((bg,i)=>(
          <div key={i} style={{ height:'1.4rem', borderRadius:'5px', background:bg, border:'1px solid rgba(255,255,255,0.06)' }} />
        ))}
      </div>
    </div>
  );
}

function RealEstatePreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.28rem' }}>
      <div style={row({ flexWrap:'wrap' })}>{['$200k–$500k','3+ Beds','Suburb'].map((f,i)=><span key={f} style={pill(i===0?`${p}30`:'rgba(255,255,255,0.07)',i===0?s:'rgba(255,255,255,0.5)')}>{f}</span>)}</div>
      {[['🏡','14 Oak Lane','3 bed · 2 bath','$320k'],['🏢','Central Loft','1 bed · 1 bath','$485k']].map(([ic,n,d,pr])=>(
        <div key={n} style={card(p)}>
          <div style={{ height:'1.2rem', background:`linear-gradient(90deg,${p}25,${s}15)`, borderRadius:'4px', marginBottom:'0.2rem', display:'flex', alignItems:'center', padding:'0 0.3rem' }}><span style={{ fontSize:'0.6rem' }}>{ic}</span></div>
          <div style={row({ justifyContent:'space-between' })}><div><div style={label('0.55rem')}>{n}</div><div style={muted}>{d}</div></div><span style={label('0.58rem',800,s)}>{pr}</span></div>
        </div>
      ))}
    </div>
  );
}

// ── Component Previews ──────────────────────────────────────────
function CommandPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
      <div style={{ ...card(p), ...row(), background:'rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize:'0.6rem', opacity:.5 }}>⌘</span>
        <span style={{ ...muted, flex:1 }}>Search commands...</span>
        <span style={pill('rgba(255,255,255,0.08)','rgba(255,255,255,0.4)')}>ESC</span>
      </div>
      {[['⬡','New Project','⌘N',true],['↗','Dashboard','⌘D',false],['⚙','Settings','⌘,',false],['?','Help','⌘?',false]].map(([ic,cmd,sc,act])=>(
        <div key={cmd} style={{ ...row(), padding:'0.25rem 0.5rem', borderRadius:'6px', background: act?`${p}18`:'transparent', border: act?`1px solid ${p}30`:'1px solid transparent' }}>
          <span style={{ fontSize:'0.58rem', width:'14px', textAlign:'center', color: act?s:'rgba(255,255,255,0.3)' }}>{ic}</span>
          <span style={{ flex:1, ...label('0.56rem', act?700:500, act?'#fff':'rgba(255,255,255,0.55)') }}>{cmd}</span>
          <span style={{ ...muted, fontFamily:'monospace' }}>{sc}</span>
        </div>
      ))}
    </div>
  );
}

function ModalPreview({ font }) {
  return (
    <div style={{ fontFamily:font }}>
      <div style={{ background:'rgba(12,12,18,0.92)', backdropFilter:'blur(16px)', borderRadius:'12px', padding:'0.9rem', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={row({ justifyContent:'space-between', marginBottom:'0.4rem' })}>
          <span style={label('0.62rem',800)}>Confirm Delete</span>
          <span style={{ ...muted, cursor:'pointer' }}>✕</span>
        </div>
        <div style={{ ...muted, lineHeight:1.6, marginBottom:'0.6rem' }}>This action cannot be undone. All project data will be permanently removed.</div>
        <div style={row()}>
          <div style={{ flex:1, padding:'0.32rem', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px', ...label('0.52rem',700,'#ef4444'), textAlign:'center' }}>Delete</div>
          <div style={{ flex:1, padding:'0.32rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', ...label('0.52rem',600,'rgba(255,255,255,0.55)'), textAlign:'center' }}>Cancel</div>
        </div>
      </div>
    </div>
  );
}

function PricingPreview({ p, s, font }) {
  return (
    <div style={{ fontFamily:font, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.25rem' }}>
      {[['Starter','$0',false],['Pro ✦','$19',true],['Team','$49',false]].map(([tier,price,hot])=>(
        <div key={tier} style={{ ...card(p), outline: hot?`1.5px solid ${p}`:'none', background: hot?`${p}12`:'rgba(255,255,255,0.04)' }}>
          <div style={label('0.52rem',700,hot?s:'rgba(255,255,255,0.6)')}>{tier}</div>
          <div style={label('0.78rem',800)}>{price}<span style={{ fontSize:'0.45rem', fontWeight:500 }}>/mo</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.18rem', marginTop:'0.3rem' }}>
            {[1,2,3].map(i=><div key={i} style={{ height:'3px', borderRadius:'2px', background: hot?`${p}60`:'rgba(255,255,255,0.1)' }} />)}
          </div>
          <div style={{ ...label('0.5rem',700,hot?'#fff':'rgba(255,255,255,0.5)'), background: hot?p:'rgba(255,255,255,0.06)', padding:'0.22rem', borderRadius:'5px', textAlign:'center', marginTop:'0.35rem' }}>Get started</div>
        </div>
      ))}
    </div>
  );
}

function SidebarPreview({ p, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', gap:'0.3rem', height:'6.5rem' }}>
      <div style={{ width:'36px', background:'rgba(0,0,0,0.25)', borderRadius:'6px', padding:'0.4rem 0.25rem', display:'flex', flexDirection:'column', gap:'0.35rem', alignItems:'center', flexShrink:0 }}>
        <div style={{ width:'16px', height:'16px', borderRadius:'4px', background:p }} />
        {[1,0,0,0].map((a,i)=><div key={i} style={{ width:'16px', height:'16px', borderRadius:'4px', background: a?`${p}30`:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:'8px', height:'2px', borderRadius:'1px', background: a?p:'rgba(255,255,255,0.2)' }} /></div>)}
      </div>
      <div style={{ flex:1, background:'rgba(255,255,255,0.02)', borderRadius:'6px', padding:'0.5rem 0.4rem', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
        {['Dashboard','Analytics','Projects','Settings'].map((l,i)=>(
          <div key={l} style={{ ...row(), padding:'0.2rem 0.35rem', borderRadius:'5px', background: i===0?`${p}18`:'transparent' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'2px', background: i===0?p:'rgba(255,255,255,0.15)', flexShrink:0 }} />
            <span style={label('0.52rem', i===0?700:500, i===0?'#fff':'rgba(255,255,255,0.5)')}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabsPreview({ p, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.35rem' }}>
      <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'3px', gap:'2px' }}>
        {['General','Security','Billing','API'].map((t,i)=>(
          <div key={t} style={{ flex:1, padding:'0.28rem', borderRadius:'6px', background: i===0?'rgba(255,255,255,0.08)':'transparent', ...label('0.5rem', i===0?700:500, i===0?'#fff':'rgba(255,255,255,0.4)'), textAlign:'center' }}>{t}</div>
        ))}
      </div>
      <div style={card(p)}>
        <div style={label('0.58rem')}>Account Settings</div>
        <div style={{ height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', marginTop:'0.35rem' }} />
        <div style={{ height:'3px', width:'70%', background:'rgba(255,255,255,0.08)', borderRadius:'2px', marginTop:'0.2rem' }} />
        <div style={{ height:'3px', width:'85%', background:'rgba(255,255,255,0.08)', borderRadius:'2px', marginTop:'0.2rem' }} />
      </div>
    </div>
  );
}

function WizardPreview({ p, font }) {
  return (
    <div style={{ fontFamily:font, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      <div style={row()}>
        {[1,2,3,4].map((s,i)=>(
          <React.Fragment key={s}>
            <div style={{ width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${i===0?p:'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', ...label('0.55rem',700,i===0?p:'rgba(255,255,255,0.3)'), flexShrink:0, background: i<1?`${p}15`:'transparent' }}>{s}</div>
            {i<3&&<div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.1)' }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={card(p)}>
        <div style={label('0.58rem')}>Personal Information</div>
        {['Full Name','Email Address'].map(f=><div key={f} style={{ height:'1.2rem', background:'rgba(255,255,255,0.06)', borderRadius:'5px', marginTop:'0.3rem' }} />)}
        <div style={{ width:'40%', height:'1.2rem', background:p, borderRadius:'6px', marginTop:'0.4rem', opacity:0.9 }} />
      </div>
    </div>
  );
}

const COMP_MAP = {
  'Interactive Command Palette': CommandPreview,
  'Glassmorphic Modal Dialog':   ModalPreview,
  'Pricing Card Matrix':         PricingPreview,
  'Collapsible Sidebar Navigation': SidebarPreview,
  'Settings Tab Navigator':      TabsPreview,
  'Multi-Step Form Wizard':      WizardPreview,
};

const CAT_MAP = {
  'SaaS Dashboard Admin Panel':  SaasPreview,
  'E-Commerce Marketplace':      EcomPreview,
  'Student Management Hub':      StudentPreview,
  'Freelancer Billing Platform': BillingPreview,
  'Digital Creative Portfolio':  PortfolioPreview,
  'Healthcare Tracker':          HealthPreview,
  'Fitness Planner':             FitnessPreview,
  'Real Estate Portal':          RealEstatePreview,
};

const FONT_MAP = {
  'Inter':    "'Inter', sans-serif",
  'Geist':    "'Geist', sans-serif",
  'Manrope':  "'Manrope', sans-serif",
  'Poppins':  "'Poppins', sans-serif",
  'DM Sans':  "'DM Sans', sans-serif",
  'Outfit':   "'Outfit', sans-serif",
};

export function ThemePreview({ selectedTheme, activeMode, appCategory, pageType, componentType, customCategory, customComponentType, selectedTypography }) {
  if (!selectedTheme) return null;

  const previewStyles = getThemeCardDynamicStyles(selectedTheme, true);
  const font = FONT_MAP[selectedTypography] || FONT_MAP['Inter'];
  const catAccent = CA[appCategory] || { p:'#7c3aed', s:'#a78bfa' };
  const compAccent = { p:'#ec4899', s:'#f9a8d4' };

  let Preview = null;
  let title = '';

  if (activeMode === 'application') {
    Preview = CAT_MAP[appCategory];
    title = appCategory === 'Custom' ? (customCategory || 'Custom App') : (appCategory || 'Application');
  } else if (activeMode === 'page') {
    title = pageType || 'Web Page';
  } else {
    Preview = componentType !== 'Custom Component' ? COMP_MAP[componentType] : null;
    title = componentType === 'Custom Component' ? (customComponentType || 'Custom Component') : (componentType || 'Component');
  }

  const isLight = LIGHT_THEMES.has(selectedTheme);

  return (
    <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem' }} className="animate-fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h4 style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--accent)', margin:0 }}>Live Preview</h4>
        {selectedTypography && <span style={{ fontSize:'0.62rem', color:'var(--muted-foreground)', fontStyle:'italic' }}>{selectedTypography} · {selectedTheme}</span>}
      </div>

      <div style={{ ...previewStyles, cursor:'default', padding:'0.9rem', minHeight:'9rem', filter: isLight ? 'brightness(0.95)' : 'none' }} className="noise-overlay">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
          <span style={{ fontSize:'0.65rem', fontWeight:700, color: isLight?'#111':'#fff', fontFamily:font }}>{title}</span>
          <span style={{ fontSize:'0.55rem', color: isLight?'#555':'rgba(255,255,255,0.45)', fontStyle:'italic' }}>{selectedTheme}</span>
        </div>

        {Preview
          ? <Preview p={catAccent.p} s={catAccent.s} font={font} accent={catAccent} />
          : <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
              {[1,2,3].map(i=><div key={i} style={{ height:i===1?'2rem':'1rem', background:'rgba(255,255,255,0.08)', borderRadius:'6px' }} />)}
            </div>
        }
      </div>
    </div>
  );
}
