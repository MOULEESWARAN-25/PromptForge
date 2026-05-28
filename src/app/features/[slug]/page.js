import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Database, Code2 } from 'lucide-react';
import FeatureDetailClient from '@/components/FeatureDetailClient';

const FEATURES_DATA = {
  'prompt-builder': {
    title: 'Full SaaS Architect',
    iconName: 'Monitor',
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
    iconName: 'Database',
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
    iconName: 'Code2',
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FeatureDetailClient feature={feature} slug={slug} />
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
