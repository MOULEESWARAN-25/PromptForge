import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Database, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

const FEATURES_DATA = {
  'prompt-builder': {
    title: 'Full SaaS Architect',
    icon: Monitor,
    desc: 'Deep multi-page structural blueprints for entire application suites.',
    detailedDesc: 'Translate brief user concepts into elaborate engineering definitions containing database designs, client-side routing structures, UI theme configs, state management solutions, and component checklists. The SaaS Architect outputs structured blueprints that AI models ingest to write production-grade multi-page code immediately.',
    benefits: [
      'Structured database design templates',
      'Layout structure scaffolding details',
      'Client-side state management mapping',
      'Direct copy-paste compatibility with v0 & Cursor'
    ]
  },
  'design-vocabulary': {
    title: 'Design Vocabulary Integration',
    icon: Database,
    desc: 'Local semantic vector database storing premium CSS, framer, and Tailwind tokens.',
    detailedDesc: 'PromptForge leverages a localized design dictionary containing CSS transition curves (spring physics, ease curves), layout grids (bento boxes, sidebars, complex columns), glassmorphism, gradients, and custom Tailwind config properties. It matches user prompts to vector elements to enrich system outputs with actual production UI styles.',
    benefits: [
      'Tailwind HSL color palette generation',
      'Framer Motion physics configurations',
      'Sleek glassmorphic CSS filters',
      'Layout shift protection variables'
    ]
  },
  'ai-refiner': {
    title: 'Interactive Code Catalog',
    icon: Code2,
    desc: 'Component-specific detailed prompts ready to yield high-fidelity designs.',
    detailedDesc: 'Focus prompt refinement down to individual elements. The Interactive Catalog lets you choose or describe standard interfaces like setting drawers, charts, calendars, navigation tabs, or OTP fields, then combines it with design tokens to export beautiful prompt snippets.',
    benefits: [
      'Component isolation principles',
      'Custom visual parameter configurations',
      'Accessibility ARIA guidelines embedded',
      'Zero layout shift animations'
    ]
  }
};

export async function generateStaticParams() {
  return [
    { slug: 'prompt-builder' },
    { slug: 'design-vocabulary' },
    { slug: 'ai-refiner' }
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = FEATURES_DATA[slug] || { title: 'Feature details' };
  return {
    title: `${data.title} - Features | PromptForge`,
    description: `${data.desc} - PromptForge SEO landing details page.`,
    alternates: {
      canonical: `https://promptforge.ai/features/${slug}`,
    },
  };
}

export default async function FeatureDetailPage({ params }) {
  const { slug } = await params;
  const feature = FEATURES_DATA[slug];

  if (!feature) {
    return (
      <div style={errorContainer}>
        <h2>Feature Not Found</h2>
        <Link href="/" style={backCta}>
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    );
  }

  const Icon = feature.icon;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": feature.title,
    "description": feature.detailedDesc,
    "brand": {
      "@type": "Brand",
      "name": "PromptForge"
    }
  };

  return (
    <div style={containerStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={backBtnWrap}>
        <Link href="/" style={backCta}>
          <ArrowLeft size={14} />
          <span>Back to Landing</span>
        </Link>
      </div>

      <div style={layoutGrid}>
        {/* Left Side details */}
        <div style={detailsCol}>
          <div style={headerRow}>
            <div style={iconBadgeStyle}>
              <Icon size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={headerText}>
              <span className="premium-badge">CORE CAPABILITY</span>
              <h1 style={pageTitle}>{feature.title}</h1>
            </div>
          </div>

          <p style={detailParagraph}>{feature.detailedDesc}</p>

          <div style={benefitsHeader}>Key Implementation Strengths</div>
          <div style={benefitsList}>
            {feature.benefits.map((benefit, i) => (
              <div key={i} style={benefitItem}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Visual Panel */}
        <div style={visualCol} className="glass-panel">
          <div style={visualHeader}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span>Interactive Output Demonstration</span>
          </div>
          <div style={visualBody}>
            <pre style={visualCodeBlock}>
{`[INSPECT_PIPELINE]
- Target: ${feature.title}
- Match Rating: 99.8% (Similarity Match)
- Output format: markdown-blueprint
- Status: READY TO RUN`}
            </pre>
            <div style={visualNote}>
              Every detail is generated statically for search indexers to easily extract metadata schemas and rich product information!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Styles ─────────────────────────────────────────────

const containerStyle = {
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  paddingTop: '2.5rem',
  paddingBottom: '4rem',
  position: 'relative',
  zIndex: 2,
};

const backBtnWrap = {
  marginBottom: '2rem',
};

const backCta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  textDecoration: 'none',
  fontWeight: '600',
};

const layoutGrid = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '2.5rem',
};

const detailsCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerRow = {
  display: 'flex',
  gap: '1.25rem',
  alignItems: 'center',
};

const iconBadgeStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '12px',
  background: 'var(--accent-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(25, 57, 141, 0.15)',
};

const headerText = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const pageTitle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  margin: 0,
};

const detailParagraph = {
  fontSize: '1.02rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.7',
};

const benefitsHeader = {
  fontSize: '0.9rem',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--foreground)',
  marginTop: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.5rem',
};

const benefitsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
};

const visualCol = {
  background: 'var(--card)',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  height: 'fit-content',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)',
};

const visualHeader = {
  padding: '0.85rem 1.25rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  background: 'rgba(255, 255, 255, 0.02)',
};

const visualBody = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const visualCodeBlock = {
  background: 'rgba(0, 0, 0, 0.15)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.85rem',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  lineHeight: '1.5',
  color: 'var(--foreground)',
  margin: 0,
};

const visualNote = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.45',
};

const errorContainer = {
  textAlign: 'center',
  padding: '4rem 2rem',
};
