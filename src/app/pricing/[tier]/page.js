import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PricingDetailClient from '@/components/PricingDetailClient';

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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingDetailClient plan={plan} tier={tier} />
    </div>
  );
}

const backCta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  textDecoration: 'none',
  fontWeight: '600',
};

const errorContainer = {
  textAlign: 'center',
  padding: '4rem 2rem',
};
