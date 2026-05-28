import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react';

const PRICING_DATA = {
  'free': {
    name: 'Hobby',
    price: '$0',
    frequency: 'Forever Free',
    desc: 'Perfect for individual developers experimenting with AI prompts.',
    detailedDesc: 'Get started with PromptForge at zero cost. The Hobby tier offers full access to standard Universal Mode compilers, local storage fallback mechanics, and semantic design vocabulary search limits. Designed to make your local prompting experience smooth.',
    features: [
      'Local Storage database fallbacks',
      'Universal prompt mode compilers',
      'Standard vector design dictionary search',
      'Up to 3 concurrent active workspaces',
      'Community Slack support access'
    ],
    ctaText: 'Sign Up Free',
    isPro: false
  },
  'pro': {
    name: 'Professional',
    price: '$15',
    frequency: 'per month',
    desc: 'For professional engineers demanding premium SaaS frameworks.',
    detailedDesc: 'Unlock the full power of PromptForge. The Professional tier connects directly to Supabase cloud hosting for secure workspace synchronization, unlimited workspace log history, custom layout template configurations, and priority LLM token processing.',
    features: [
      'Supabase database cloud synchronization',
      'Unlimited workspace save history log',
      'Priority LLM execution queues (fast response)',
      'Custom Design System parameters',
      'Standard API key configurations',
      'E-mail support ticketing'
    ],
    ctaText: 'Start 14-Day Free Trial',
    isPro: true
  },
  'enterprise': {
    name: 'Enterprise',
    price: 'Custom',
    frequency: 'contracted yearly',
    desc: 'Designed for scaling engineering teams and design groups.',
    detailedDesc: 'Enterprise grade infrastructure for large scale AI code generation. The Enterprise tier allows your team to connect private vector databases, enforce organization-wide design systems, self-host workspaces locally, and enjoy dedicated SLA support.',
    features: [
      'Private dedicated team Vector databases',
      'Custom pre-injected Design System tokens',
      'Self-hosted Docker deployment options',
      'Dedicated Customer Success Manager',
      'SLA-backed uptime guarantees',
      'Custom invoice pricing'
    ],
    ctaText: 'Contact Enterprise Sales',
    isPro: false
  }
};

export async function generateStaticParams() {
  return [
    { tier: 'free' },
    { tier: 'pro' },
    { tier: 'enterprise' }
  ];
}

export async function generateMetadata({ params }) {
  const { tier } = await params;
  const data = PRICING_DATA[tier] || { name: 'Pricing details' };
  return {
    title: `${data.name} Plan - Pricing | PromptForge`,
    description: `${data.desc} Plan options - PromptForge SEO details page.`,
    alternates: {
      canonical: `https://promptforge.ai/pricing/${tier}`,
    },
  };
}

export default async function PricingDetailPage({ params }) {
  const { tier } = await params;
  const plan = PRICING_DATA[tier];

  if (!plan) {
    return (
      <div style={errorContainer}>
        <h2>Plan Not Found</h2>
        <Link href="/" style={backCta}>
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `PromptForge ${plan.name} Plan`,
    "description": plan.detailedDesc,
    "offers": {
      "@type": "Offer",
      "price": plan.price.replace('$', '') === 'Custom' ? '0' : plan.price.replace('$', ''),
      "priceCurrency": "USD",
      "valueAddedTaxIncluded": "true"
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
        {/* Left Side Details */}
        <div style={detailsCol}>
          <div style={headerText}>
            <span className="premium-badge">PRICING PLAN MATRIX</span>
            <h1 style={pageTitle}>{plan.name} Plan</h1>
            <div style={priceRow}>
              <span style={priceText}>{plan.price}</span>
              <span style={priceSub}>{plan.frequency}</span>
            </div>
          </div>

          <p style={detailParagraph}>{plan.detailedDesc}</p>

          <Link href="/auth" style={mainCtaBtn(plan.isPro)} className="shine-effect">
            {plan.ctaText}
          </Link>
        </div>

        {/* Right Side Features Checklist */}
        <div style={visualCol} className="glass-panel">
          <div style={visualHeader}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
            <span>Included Capabilities</span>
          </div>
          <div style={visualBody}>
            <div style={benefitsList}>
              {plan.features.map((feat, i) => (
                <div key={i} style={benefitItem}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={featText}>{feat}</span>
                </div>
              ))}
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
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '2.5rem',
};

const detailsCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerText = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const pageTitle = {
  fontSize: '2rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  margin: 0,
};

const priceRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.35rem',
  marginTop: '0.25rem',
};

const priceText = {
  fontSize: '2.5rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
};

const priceSub = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
};

const detailParagraph = {
  fontSize: '1.02rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.7',
};

const mainCtaBtn = (isPro) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.85rem 1.75rem',
  fontSize: '0.95rem',
  fontWeight: '700',
  borderRadius: '10px',
  textDecoration: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  background: isPro ? 'var(--accent)' : 'var(--primary)',
  color: isPro ? 'var(--accent-foreground)' : 'var(--primary-foreground)',
  boxShadow: 'var(--shadow-md)',
  transition: 'transform 0.2s, opacity 0.2s',
  width: 'fit-content',
});

const benefitsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const featText = {
  fontSize: '0.85rem',
  color: 'var(--foreground)',
  lineHeight: '1.4',
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
};

const errorContainer = {
  textAlign: 'center',
  padding: '4rem 2rem',
};
