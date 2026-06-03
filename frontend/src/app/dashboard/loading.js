"use client";

import React from 'react';

export default function DashboardLoading() {
  return (
    <div style={containerStyle}>
      {/* ── Hero Section Skeleton ── */}
      <div style={heroSection}>
        {/* Pulsing Badge */}
        <div className="skeleton" style={badgeSkeleton} />

        {/* Title Lines */}
        <div className="skeleton" style={titleSkeleton1} />
        <div className="skeleton" style={titleSkeleton2} />

        {/* Paragraph Lines */}
        <div className="skeleton" style={paragraphSkeleton1} />
        <div className="skeleton" style={paragraphSkeleton2} />

        {/* Console Search Input Box */}
        <div className="skeleton" style={inputSkeleton} />

        {/* Suggestion Chips */}
        <div style={chipsRow}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton" style={chipSkeleton} />
          ))}
        </div>
      </div>

      {/* ── Bento Grid Section Skeleton ── */}
      <div style={sectionHeader}>
        <div className="skeleton" style={sectionLabelSkeleton} />
        <div className="skeleton" style={sectionTitleSkeleton} />
      </div>

      <div style={gridStyle}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} style={cardStyle} className="glass-panel">
            <div style={cardHeaderStyle}>
              <div className="skeleton" style={iconSkeleton} />
              <div className="skeleton" style={badgePillSkeleton} />
            </div>
            <div className="skeleton" style={cardTitleSkeleton} />
            <div className="skeleton" style={cardDescSkeleton1} />
            <div className="skeleton" style={cardDescSkeleton2} />
            <div className="skeleton" style={cardFooterSkeleton} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline Styles ─────────────────────────────────────────────

const containerStyle = {
  width: '100%',
  position: 'relative',
  zIndex: 2,
};

const heroSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '3rem',
  paddingBottom: '4rem',
  maxWidth: '900px',
  margin: '0 auto',
};

const badgeSkeleton = {
  width: '150px',
  height: '24px',
  borderRadius: '999px',
  marginBottom: '1.5rem',
};

const titleSkeleton1 = {
  width: '80%',
  maxWidth: '600px',
  height: '44px',
  borderRadius: '8px',
  marginBottom: '0.75rem',
};

const titleSkeleton2 = {
  width: '60%',
  maxWidth: '450px',
  height: '44px',
  borderRadius: '8px',
  marginBottom: '1.5rem',
};

const paragraphSkeleton1 = {
  width: '90%',
  maxWidth: '520px',
  height: '16px',
  borderRadius: '4px',
  marginBottom: '0.5rem',
};

const paragraphSkeleton2 = {
  width: '70%',
  maxWidth: '400px',
  height: '16px',
  borderRadius: '4px',
  marginBottom: '2rem',
};

const inputSkeleton = {
  width: '100%',
  maxWidth: '640px',
  height: '60px',
  borderRadius: '14px',
  marginBottom: '1.25rem',
};

const chipsRow = {
  display: 'flex',
  gap: '0.625rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const chipSkeleton = {
  width: '90px',
  height: '28px',
  borderRadius: '999px',
};

const sectionHeader = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  marginBottom: '1.5rem',
};

const sectionLabelSkeleton = {
  width: '120px',
  height: '12px',
  borderRadius: '3px',
};

const sectionTitleSkeleton = {
  width: '200px',
  height: '22px',
  borderRadius: '6px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
  marginBottom: '3.5rem',
};

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  padding: '1.5rem',
  borderRadius: '16px',
  height: '220px',
  background: 'var(--card)',
  border: '1px solid var(--border)',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const iconSkeleton = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
};

const badgePillSkeleton = {
  width: '70px',
  height: '20px',
  borderRadius: '999px',
};

const cardTitleSkeleton = {
  width: '140px',
  height: '18px',
  borderRadius: '4px',
  marginTop: '0.5rem',
};

const cardDescSkeleton1 = {
  width: '100%',
  height: '12px',
  borderRadius: '3px',
};

const cardDescSkeleton2 = {
  width: '80%',
  height: '12px',
  borderRadius: '3px',
};

const cardFooterSkeleton = {
  width: '90px',
  height: '12px',
  borderRadius: '3px',
  marginTop: 'auto',
};
