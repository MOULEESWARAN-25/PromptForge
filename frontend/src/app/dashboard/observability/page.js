"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Activity, Layers, Database, ShieldAlert, CheckCircle2,
  AlertTriangle, ChevronRight, Filter, HelpCircle,
  RefreshCw, TrendingUp, Calendar, Info, CornerDownRight,
  ListTodo, Layers3, Flame, Play, Eye
} from 'lucide-react';
import { track } from '@/lib/analytics';
import { API_BASE_URL } from '@/config/api';

export default function ObservabilityPage() {
  const { user, loading } = useApp();
  const router = useRouter();

  // Active Dashboard tab: 'coverage', 'gaps', 'trends', 'integrity', 'ab_test'
  const [activeTab, setActiveTab] = useState('coverage');

  // Stats Data
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [trends, setTrends] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [abComparison, setAbComparison] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Gaps Table Filters
  const [gapTypeFilter, setGapTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Integrity details modals/toggles
  const [showOrphansList, setShowOrphansList] = useState(false);
  const [showCyclesList, setShowCyclesList] = useState(false);

  // Fetch all dashboard data
  const fetchData = async () => {
    setFetching(true);
    try {
      const backendUrl = `${API_BASE_URL}/api/observability`;

      // 1. Fetch Summary
      const resSummary = await fetch(`${backendUrl}/summary`);
      if (resSummary.ok) setSummary(await resSummary.json());

      // 2. Fetch Analytics
      const resAnalytics = await fetch(`${backendUrl}/analytics`);
      if (resAnalytics.ok) setAnalytics(await resAnalytics.json());

      // 3. Fetch Trends
      const resTrends = await fetch(`${backendUrl}/trends`);
      if (resTrends.ok) setTrends(await resTrends.json());

      // 4. Fetch Integrity
      const resIntegrity = await fetch(`${backendUrl}/integrity`);
      if (resIntegrity.ok) setIntegrity(await resIntegrity.json());

      // 5. Fetch A/B Comparison
      const resAb = await fetch(`${backendUrl}/ab_comparison`);
      if (resAb.ok) setAbComparison(await resAb.json());

      // 6. Fetch Gaps list (initially unfiltered)
      await fetchGaps();

    } catch (err) {
      console.error("Failed to load observability data:", err);
      toast.error("Failed to sync metrics from RAG Server");
    } finally {
      setFetching(false);
    }
  };

  // Fetch gaps dynamically with filter parameters
  const fetchGaps = async () => {
    try {
      const params = new URLSearchParams();
      if (gapTypeFilter) params.append('type', gapTypeFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');

      const resGaps = await fetch(`${API_BASE_URL}/api/observability/gaps?${params.toString()}`);
      if (resGaps.ok) setGaps(await resGaps.json());
    } catch (err) {
      console.error("Gaps fetch error:", err);
    }
  };

  // Trigger gaps fetch whenever filters change
  useEffect(() => {
    if (user) {
      fetchGaps();
    }
  }, [gapTypeFilter, priorityFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchData();
      track('observability_dashboard_viewed');
    }
  }, [user, loading]);

  if (loading || !user || !summary) {
    return (
      <div style={S.loadingSkel}>
        <div style={S.skelLine('240px', '24px')} />
        <div style={S.skelLine('60%', '48px')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={S.skelLine('100%', '120px')} />
          <div style={S.skelLine('100%', '120px')} />
          <div style={S.skelLine('100%', '120px')} />
          <div style={S.skelLine('100%', '120px')} />
        </div>
      </div>
    );
  }

  // Priority and Gap type colors
  const getPriorityStyle = (p) => {
    switch (p) {
      case 'critical': return { bg: 'color-mix(in srgb, var(--destructive) 12%, transparent)', color: 'var(--destructive)', label: 'critical' };
      case 'high': return { bg: 'color-mix(in srgb, #f59e0b 12%, transparent)', color: '#f59e0b', label: 'high' };
      case 'medium': return { bg: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', label: 'medium' };
      default: return { bg: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)', color: 'var(--muted-foreground)', label: 'low' };
    }
  };

  const getGapTypeLabel = (t) => {
    switch (t) {
      case 'LOW_COVERAGE': return 'Low Coverage';
      case 'INCOMPLETE_ENTITY': return 'Incomplete Profile';
      case 'INVALID_RELATIONSHIP': return 'Broken Relationship';
      case 'STALE_ENTITY': return 'Stale Entity';
      default: return t;
    }
  };

  return (
    <div style={S.pageContainer}>
      {/* ─── PAGE HEADER ────────────────────────────────────────── */}
      <div style={S.headerWrapper}>
        <div style={S.headerSplit}>
          <div style={S.greetingArea}>
            <div style={S.breadcrumbs}>
              <span>{user?.username || 'Developer'}&apos;s Workspace</span>
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Observability</span>
            </div>

            <h1 style={S.pageTitle}>
              Graph <span style={S.titleGradient}>Observability</span> Panel
            </h1>
            <p style={S.pageSubtitle}>
              Monitor complete RAG semantic coverage metrics, gap logs, and real-time database integrity checks.
            </p>
          </div>

          <button style={S.refreshBtn} onClick={fetchData} disabled={fetching} title="Refresh Metrics">
            <RefreshCw size={14} className={fetching ? "spin-animation" : ""} />
            <span>{fetching ? 'Syncing...' : 'Sync Metrics'}</span>
          </button>
        </div>
      </div>

      {/* ─── OVERVIEW CARDS (Bento Grid) ────────────────────────── */}
      <div style={S.overviewGrid}>
        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Total Entities</span>
            <div style={{ ...S.statIconWrap, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <Layers size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.totalEntities}</div>
          <span style={S.statSubText}>Active nodes in Vector DB</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Total Relationships</span>
            <div style={{ ...S.statIconWrap, color: 'var(--success)', background: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
              <Database size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.totalRelationships}</div>
          <span style={S.statSubText}>Inter-entity directional links</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Active Applications</span>
            <div style={{ ...S.statIconWrap, color: '#f59e0b', background: 'color-mix(in srgb, #f59e0b 10%, transparent)' }}>
              <Activity size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.activeApplications}</div>
          <span style={S.statSubText}>Scoped RAG root targets</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Structural Coverage</span>
            <div style={{ ...S.statIconWrap, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <Layers3 size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.avgStructuralCoverage}%</div>
          <span style={S.statSubText}>Apps, Features, Pages & Models</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Leaf Coverage</span>
            <div style={{ ...S.statIconWrap, color: '#f43f5e', background: 'color-mix(in srgb, #f43f5e 10%, transparent)' }}>
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.avgLeafCoverage}%</div>
          <span style={S.statSubText}>Components, Themes & Tokens</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Telemetry Validity</span>
            <div style={{ ...S.statIconWrap, color: 'var(--success)', background: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
              <ShieldAlert size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.telemetryValidityRate}%</div>
          <span style={S.statSubText}>RAG data processing SLA</span>
        </div>

        <div style={S.statCard} className="card-glass">
          <div style={S.statHeader}>
            <span style={S.statLabel}>Open Knowledge Gaps</span>
            <div style={{ ...S.statIconWrap, color: '#ef4444', background: 'color-mix(in srgb, #ef4444 10%, transparent)' }}>
              <AlertTriangle size={13} />
            </div>
          </div>
          <div style={S.statValue}>{summary.openGapsCount}</div>
          <span style={S.statSubText}>Actionable backlog tickets</span>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ────────────────────────────────────── */}
      <div style={S.tabsContainer} className="card-glass">
        <button
          style={S.tabBtn(activeTab === 'coverage')}
          onClick={() => setActiveTab('coverage')}
        >
          <Layers size={14} />
          <span>Coverage Analytics</span>
        </button>

        <button
          style={S.tabBtn(activeTab === 'gaps')}
          onClick={() => setActiveTab('gaps')}
        >
          <ListTodo size={14} />
          <span>Gap Management</span>
        </button>

        <button
          style={S.tabBtn(activeTab === 'trends')}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={14} />
          <span>Historical Trends</span>
        </button>

        <button
          style={S.tabBtn(activeTab === 'integrity')}
          onClick={() => setActiveTab('integrity')}
        >
          <ShieldAlert size={14} />
          <span>Graph Integrity</span>
        </button>

        <button
          style={S.tabBtn(activeTab === 'ab_test')}
          onClick={() => setActiveTab('ab_test')}
        >
          <Activity size={14} />
          <span>A/B Evaluation</span>
        </button>
      </div>

      {/* ─── TAB CONTENTS ──────────────────────────────────────── */}
      <div style={S.tabContentArea}>
        <AnimatePresence mode="wait">
          {/* 1. COVERAGE ANALYTICS */}
          {activeTab === 'coverage' && analytics && (
            <motion.div
              key="coverage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={S.tabPaneGrid}
            >
              {/* Distribution SVG Chart */}
              <div style={S.paneCard} className="card-glass">
                <h3 style={S.cardTitle}>Entity Coverage Distribution</h3>
                <p style={S.cardSubTitle}>Count of knowledge graph entities grouped by coverage score</p>
                
                <div style={S.chartWrapper}>
                  {/* SVG Bar Chart */}
                  <svg width="100%" height="220" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
                    <line x1="40" y1="180" x2="480" y2="180" stroke="var(--border)" strokeWidth="1" />
                    {/* Y-Axis Grid Lines */}
                    <line x1="40" y1="40" x2="480" y2="40" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                    {/* Bar 1: <20% */}
                    <rect x="75" y={180 - (analytics.coverageDistribution.under20 * 1.2)} width="40" height={analytics.coverageDistribution.under20 * 1.2} rx="4" fill="var(--destructive)" opacity="0.85" className="glow-bar-dest" />
                    <text x="95" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">&lt; 20%</text>
                    <text x="95" y={172 - (analytics.coverageDistribution.under20 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.under20}</text>

                    {/* Bar 2: 20-40% */}
                    <rect x="155" y={180 - (analytics.coverageDistribution.under40 * 1.2)} width="40" height={analytics.coverageDistribution.under40 * 1.2} rx="4" fill="#f59e0b" opacity="0.85" />
                    <text x="175" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">20 - 40%</text>
                    <text x="175" y={172 - (analytics.coverageDistribution.under40 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.under40}</text>

                    {/* Bar 3: 40-60% */}
                    <rect x="235" y={180 - (analytics.coverageDistribution.under60 * 1.2)} width="40" height={analytics.coverageDistribution.under60 * 1.2} rx="4" fill="#d97706" opacity="0.85" />
                    <text x="255" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">40 - 60%</text>
                    <text x="255" y={172 - (analytics.coverageDistribution.under60 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.under60}</text>

                    {/* Bar 4: 60-80% */}
                    <rect x="315" y={180 - (analytics.coverageDistribution.under80 * 1.2)} width="40" height={analytics.coverageDistribution.under80 * 1.2} rx="4" fill="var(--accent)" opacity="0.85" />
                    <text x="335" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">60 - 80%</text>
                    <text x="335" y={172 - (analytics.coverageDistribution.under80 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.under80}</text>

                    {/* Bar 5: >80% */}
                    <rect x="395" y={180 - (analytics.coverageDistribution.over80 * 1.2)} width="40" height={analytics.coverageDistribution.over80 * 1.2} rx="4" fill="var(--success)" opacity="0.85" className="glow-bar-succ" />
                    <text x="415" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">&gt; 80%</text>
                    <text x="415" y={172 - (analytics.coverageDistribution.over80 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.over80}</text>
                  </svg>
                </div>
              </div>

              {/* Layer-by-layer bars */}
              <div style={S.paneCard} className="card-glass">
                <h3 style={S.cardTitle}>Coverage Score by Layer</h3>
                <p style={S.cardSubTitle}>Average performance across RAG query constraints</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                  {Object.keys(analytics.coverageByLayer).map(layer => {
                    const score = analytics.coverageByLayer[layer];
                    return (
                      <div key={layer} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                          <span style={{ textTransform: 'capitalize' }}>{layer.replace('_', ' ')}</span>
                          <span style={{ color: score < 60 ? 'var(--destructive)' : 'var(--success)' }}>{score}%</span>
                        </div>
                        <div style={S.progressTrack}>
                          <motion.div
                            style={{
                              ...S.progressFill,
                              width: `${score}%`,
                              background: score < 60 ? 'var(--destructive)' : 'var(--success)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lowest Coverage list */}
              <div style={{ ...S.paneCard, gridColumn: 'span 2' }} className="card-glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={S.cardTitle}>Application Coverage Ranking</h3>
                    <p style={S.cardSubTitle}>Completeness score mapped across structural RAG seeds</p>
                  </div>
                </div>

                <div style={S.rankingSplit}>
                  {/* Lowest Column */}
                  <div style={S.rankingColumn}>
                    <div style={S.rankingHeaderCol}>
                      <Flame size={14} style={{ color: 'var(--destructive)' }} />
                      <span style={{ color: 'var(--destructive)' }}>Lowest Coverage Applications</span>
                    </div>
                    <div style={S.rankingList}>
                      {analytics.lowestCoverageApps.map((app, idx) => (
                        <div key={app.id} style={S.rankingItem} className="noise-overlay">
                          <span style={S.rankingIdx}>{idx + 1}</span>
                          <span style={S.rankingName}>{app.name}</span>
                          <span style={{ ...S.rankingScore, color: 'var(--destructive)' }}>{app.coverage_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highest Column */}
                  <div style={S.rankingColumn}>
                    <div style={S.rankingHeaderCol}>
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--success)' }}>Highest Coverage Applications</span>
                    </div>
                    <div style={S.rankingList}>
                      {analytics.highestCoverageApps.map((app, idx) => (
                        <div key={app.id} style={S.rankingItem}>
                          <span style={S.rankingIdx}>{idx + 1}</span>
                          <span style={S.rankingName}>{app.name}</span>
                          <span style={{ ...S.rankingScore, color: 'var(--success)' }}>{app.coverage_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. GAP MANAGEMENT */}
          {activeTab === 'gaps' && (
            <motion.div
              key="gaps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={S.gapsTabContainer}
            >
              {/* Filter controls */}
              <div style={S.filtersRow} className="card-glass">
                <div style={S.filterCol}>
                  <Filter size={12} style={{ color: 'var(--accent)' }} />
                  <span style={S.filterLabel}>Filters</span>
                </div>

                <select
                  value={gapTypeFilter}
                  onChange={e => setGapTypeFilter(e.target.value)}
                  style={S.filterSelect}
                >
                  <option value="">All Gap Types</option>
                  <option value="LOW_COVERAGE">Low Coverage</option>
                  <option value="INCOMPLETE_ENTITY">Incomplete Profiles</option>
                  <option value="INVALID_RELATIONSHIP">Broken Links</option>
                  <option value="STALE_ENTITY">Stale Entries</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={S.filterSelect}
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={S.filterSelect}
                >
                  <option value="">All Statuses</option>
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Table */}
              <div style={S.paneCard} className="card-glass">
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={S.gapsTable}>
                    <thead>
                      <tr style={S.gapsHeaderRow}>
                        <th style={S.gapsTh}>Entity / Relationship Target</th>
                        <th style={S.gapsTh}>Gap Type</th>
                        <th style={S.gapsTh}>Priority</th>
                        <th style={S.gapsTh}>Source</th>
                        <th style={S.gapsTh}>First Logged</th>
                        <th style={S.gapsTh}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={S.tableEmptyCell}>
                            <CheckCircle2 size={24} style={{ color: 'var(--success)', opacity: 0.7, marginBottom: '0.5rem' }} />
                            <div>No matching backlog gaps found in active filters!</div>
                          </td>
                        </tr>
                      ) : (
                        gaps.map(gap => {
                          const pStyle = getPriorityStyle(gap.priority);
                          return (
                            <tr key={gap.id} style={S.gapsRow} className="gaps-table-row">
                              <td style={{ ...S.gapsTd, fontWeight: 700 }}>{gap.entity_name}</td>
                              <td style={S.gapsTd}>
                                <span style={S.typeBadge}>
                                  {getGapTypeLabel(gap.gap_type)}
                                </span>
                              </td>
                              <td style={S.gapsTd}>
                                <span style={{ ...S.priorityBadge, background: pStyle.bg, color: pStyle.color }}>
                                  {pStyle.label}
                                </span>
                              </td>
                              <td style={S.gapsTd}>
                                <code style={S.sourceCode}>{gap.source}</code>
                              </td>
                              <td style={S.gapsTd}>
                                {new Date(gap.first_seen_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td style={{ ...S.gapsTd, color: 'var(--muted-foreground)', fontSize: '0.74rem' }}>
                                {gap.resolution_notes || 'No resolution details compiled.'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. HISTORICAL TRENDS */}
          {activeTab === 'trends' && trends && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={S.tabPaneGrid}
            >
              {/* Coverage Over Time area chart */}
              <div style={{ ...S.paneCard, gridColumn: 'span 2' }} className="card-glass">
                <h3 style={S.cardTitle}>Average Structural Coverage over Time</h3>
                <p style={S.cardSubTitle}>Timeline tracking completeness metrics across RAG templates</p>

                {trends.insufficient_history ? (
                  <div style={S.insufficientTrendsWrapper} className="noise-overlay">
                    <Calendar size={32} style={{ color: 'var(--accent)', opacity: 0.7, marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>Collecting Trend History...</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                      Only **{trends.uniqueDatesCount} day** of snapshots is available in the database cache. 
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.72rem', color: 'var(--muted-foreground)', opacity: 0.8 }}>
                      Snapshots compile nightly. A minimum of 3 dates are required to plot the area timeline.
                    </p>

                    <div style={S.insufficientDataPointsGrid}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)' }}>Active Snapshots:</span>
                      {trends.points.map(p => (
                        <div key={p.date} style={S.dataPointBadge}>
                          <span>{p.date}</span>
                          <ChevronRight size={10} style={{ opacity: 0.5 }} />
                          <span style={{ fontWeight: 700 }}>{p.coverage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={S.chartWrapper}>
                    {/* Render dynamic SVG Line Chart with actual points */}
                    <svg width="100%" height="240" viewBox="0 0 600 240" style={{ overflow: 'visible' }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="200" x2="560" y2="200" stroke="var(--border)" strokeWidth="1" />
                      <line x1="40" y1="50" x2="560" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                      <line x1="40" y1="125" x2="560" y2="125" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                      {/* Area polygon & stroke path */}
                      {/* We will draw the coordinates dynamically based on points length */}
                      {(() => {
                        const width = 520;
                        const height = 150;
                        const startY = 200;
                        const pointsCount = trends.points.length;
                        const xStep = pointsCount > 1 ? width / (pointsCount - 1) : width;

                        const coordinates = trends.points.map((pt, i) => {
                          const x = 40 + (i * xStep);
                          // map 0-100 score to 50-200 Y range (inverted)
                          const y = startY - ((pt.coverage / 100) * height);
                          return { x, y, pt };
                        });

                        const pathStr = coordinates.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                        const areaStr = `${pathStr} L ${coordinates[coordinates.length - 1].x} 200 L 40 200 Z`;

                        return (
                          <>
                            {/* Area Gradient */}
                            <path d={areaStr} fill="url(#areaGrad)" opacity="0.25" />
                            {/* Line path */}
                            <path d={pathStr} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" className="sparkline-path" />
                            {/* Coordinates labels */}
                            {coordinates.map((c, idx) => (
                              <g key={idx}>
                                <circle cx={c.x} cy={c.y} r="5" fill="var(--background)" stroke="var(--accent)" strokeWidth="2.5" className="sparkline-dot" />
                                <text x={c.x} y={c.y - 12} fill="var(--foreground)" fontSize="9" fontWeight="700" textAnchor="middle">{c.pt.coverage}%</text>
                                <text x={c.x} y="215" fill="var(--muted-foreground)" fontSize="9" textAnchor="middle">{c.pt.date.split('-').slice(1).join('/')}</text>
                              </g>
                            ))}
                            <defs>
                              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. GRAPH INTEGRITY */}
          {activeTab === 'integrity' && integrity && (
            <motion.div
              key="integrity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={S.tabPaneGrid}
            >
              {/* Integrity summary blocks */}
              <div style={{ ...S.paneCard, gridColumn: 'span 2' }} className="card-glass">
                <h3 style={S.cardTitle}>Graph Integrity Audits</h3>
                <p style={S.cardSubTitle}>Last aggregation scan run at {new Date(integrity.last_run_at || Date.now()).toLocaleTimeString()}</p>

                <div style={S.integrityGrid}>
                  {/* Item 1: Orphans */}
                  <div style={S.integrityCard} className="noise-overlay">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <span style={S.integrityLabel}>Orphan Entities</span>
                      <div style={S.integrityDot(integrity.orphans.filter(o => !o.is_valid).length > 0)} />
                    </div>
                    <div style={S.integrityVal}>{integrity.orphans.length}</div>
                    
                    <button style={S.detailsBtn} onClick={() => setShowOrphansList(!showOrphansList)}>
                      <Eye size={12} />
                      <span>{showOrphansList ? 'Hide List' : 'View Details'}</span>
                    </button>
                  </div>

                  {/* Item 2: Duplicates */}
                  <div style={S.integrityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <span style={S.integrityLabel}>Duplicate Slugs</span>
                      <div style={S.integrityDot(integrity.duplicate_slugs_count > 0)} />
                    </div>
                    <div style={S.integrityVal}>{integrity.duplicate_slugs_count}</div>
                    <span style={S.integrityStatus(integrity.duplicate_slugs_count > 0)}>
                      {integrity.duplicate_slugs_count > 0 ? 'Duplicate IDs found' : 'Fully Unique'}
                    </span>
                  </div>

                  {/* Item 3: Broken Rels */}
                  <div style={S.integrityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <span style={S.integrityLabel}>Broken Links</span>
                      <div style={S.integrityDot(integrity.broken_relationships_count > 0)} />
                    </div>
                    <div style={S.integrityVal}>{integrity.broken_relationships_count}</div>
                    <span style={S.integrityStatus(integrity.broken_relationships_count > 0)}>
                      {integrity.broken_relationships_count > 0 ? 'Dangling references' : 'All Links Valid'}
                    </span>
                  </div>

                  {/* Item 4: Cycles */}
                  <div style={S.integrityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <span style={S.integrityLabel}>Circular Relationships</span>
                      <div style={S.integrityDot(integrity.circular_relationships.length > 0)} />
                    </div>
                    <div style={S.integrityVal}>{integrity.circular_relationships.length}</div>
                    
                    {integrity.circular_relationships.length > 0 ? (
                      <button style={S.detailsBtn} onClick={() => setShowCyclesList(!showCyclesList)}>
                        <Eye size={12} />
                        <span>{showCyclesList ? 'Hide List' : 'View Loops'}</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 500 }}>No Cycles Detected</span>
                    )}
                  </div>
                </div>

                {/* Toggled list: Orphans */}
                {showOrphansList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={S.collapsedContainer}
                  >
                    <div style={S.collapsedTitle}>Orphan entities breakdown (Degree 0)</div>
                    <div style={S.orphansBadgeWrapper}>
                      {integrity.orphans.map(orphan => (
                        <div
                          key={orphan.id}
                          style={{
                            ...S.orphanBadgeItem,
                            background: orphan.is_valid
                              ? 'color-mix(in srgb, var(--success) 8%, transparent)'
                              : 'color-mix(in srgb, #f59e0b 8%, transparent)',
                            color: orphan.is_valid ? 'var(--success)' : '#f59e0b',
                            border: `1px solid ${orphan.is_valid ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, #f59e0b 15%, transparent)'}`
                          }}
                        >
                          <code>{orphan.id}</code>
                          <span style={S.orphanTag(orphan.is_valid)}>
                            {orphan.is_valid ? 'valid_orphan' : 'integrity_leak'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
                      *Note: `valid_orphan` refers to items like typography files, themes, design token configs, or application wizard steps that are naturally standalone and do not require relationships in the graph.*
                    </p>
                  </motion.div>
                )}

                {/* Toggled list: Cycles */}
                {showCyclesList && integrity.circular_relationships.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={S.collapsedContainer}
                  >
                    <div style={S.collapsedTitle}>Detected circular references loops</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {integrity.circular_relationships.map((cycle, idx) => (
                        <div key={idx} style={S.cycleRow}>
                          <CornerDownRight size={11} style={{ opacity: 0.5 }} />
                          <code>{cycle}</code>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. A/B BENCHMARK EVALUATION */}
          {activeTab === 'ab_test' && abComparison && (
            <motion.div
              key="ab_test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={S.tabPaneGrid}
            >
              {/* Aggregate Comparison Bento Cards */}
              <div style={{ ...S.paneCard, gridColumn: 'span 2' }} className="card-glass">
                <h3 style={S.cardTitle}>Performance A/B Comparison</h3>
                <p style={S.cardSubTitle}>Aggregated outcomes comparing Legacy RAG with Blueprint-Guided Orchestration</p>
                
                <div style={S.abSummaryContainer}>
                  {/* Legacy Card */}
                  <div style={{ ...S.abPipelineCard, borderLeft: '4px solid var(--muted-foreground)' }} className="noise-overlay">
                    <div style={S.abCardHeader}>
                      <h4 style={S.abCardTitle}>Legacy RAG Pipeline</h4>
                      <span style={S.abBadgeLegacy}>Baseline</span>
                    </div>
                    <div style={S.abStatsGrid}>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>LLM Evaluation Score</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.legacy.avg_quality_score}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Structural Accuracy</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.legacy.avg_structural_accuracy_score}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Avg Latency</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.legacy.avg_latency_ms}ms</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Healing Patches</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.legacy.total_patches}</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Evaluated Runs</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.legacy.total_runs}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint Card */}
                  <div style={{ ...S.abPipelineCard, borderLeft: '4px solid var(--accent)' }} className="glow-border">
                    <div style={S.abCardHeader}>
                      <h4 style={S.abCardTitle}>Blueprint-Guided Pipeline</h4>
                      <span style={S.abBadgeBlueprint}>Active</span>
                    </div>
                    <div style={S.abStatsGrid}>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>LLM Evaluation Score</span>
                        <span style={{ ...S.abStatVal, color: 'var(--success)' }}>{abComparison.aggregates.blueprint.avg_quality_score}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Structural Accuracy</span>
                        <span style={{ ...S.abStatVal, color: abComparison.aggregates.blueprint.avg_structural_accuracy_score > abComparison.aggregates.legacy.avg_structural_accuracy_score ? 'var(--success)' : 'var(--foreground)' }}>{abComparison.aggregates.blueprint.avg_structural_accuracy_score}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Avg Latency</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.blueprint.avg_latency_ms}ms</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Healing Patches</span>
                        <span style={{ ...S.abStatVal, color: abComparison.aggregates.blueprint.total_patches === 0 ? 'var(--success)' : 'var(--foreground)' }}>
                          {abComparison.aggregates.blueprint.total_patches}
                        </span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Knowledge Utilization</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.blueprint.avg_utilization}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Node Completion</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.blueprint.avg_completion}%</span>
                      </div>
                      <div style={S.abStatItem}>
                        <span style={S.abStatLabel}>Evaluated Runs</span>
                        <span style={S.abStatVal}>{abComparison.aggregates.blueprint.total_runs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structural Accuracy Dimensions Comparison */}
              <div style={S.paneCard} className="card-glass">
                <h3 style={S.cardTitle}>Structural Accuracy Breakdown</h3>
                <p style={S.cardSubTitle}>Blueprint entity preservation measured against expected architecture</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                  {(() => {
                    const structDimensions = [
                      { key: 'feature_accuracy', label: 'Feature Accuracy' },
                      { key: 'page_accuracy', label: 'Page Accuracy' },
                      { key: 'component_accuracy', label: 'Component Accuracy' },
                      { key: 'backend_accuracy', label: 'Backend Accuracy' },
                      { key: 'database_accuracy', label: 'Database Accuracy' },
                      { key: 'constraint_accuracy', label: 'Constraint Accuracy' }
                    ];

                    const getStructAverage = (type, key) => {
                      let sum = 0;
                      let count = 0;
                      abComparison.pairwise.forEach(p => {
                        const item = p[type];
                        if (item && item.structural_accuracy && typeof item.structural_accuracy[key] === 'number') {
                          sum += item.structural_accuracy[key];
                          count++;
                        }
                      });
                      return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
                    };

                    return structDimensions.map(dim => {
                      const legacyScore = getStructAverage('legacy', dim.key);
                      const bpScore = getStructAverage('blueprint', dim.key);
                      const isImprovement = bpScore > legacyScore;

                      return (
                        <div key={dim.key} style={S.rubricDimRow}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={S.rubricLabel}>{dim.label}</span>
                            {isImprovement && bpScore - legacyScore > 0 && (
                              <span style={S.winnerBadge}>+{(bpScore - legacyScore).toFixed(1)}</span>
                            )}
                          </div>
                          <div style={S.rubricComparisonTrack}>
                            <div style={S.rubricBarGroup}>
                              <span style={S.rubricValueLabel}>Legacy: {legacyScore}</span>
                              <div style={S.progressTrack}>
                                <div style={{ ...S.progressFill, width: `${legacyScore}%`, background: 'var(--muted-foreground)' }} />
                              </div>
                            </div>
                            <div style={S.rubricBarGroup}>
                              <span style={{ ...S.rubricValueLabel, color: isImprovement ? 'var(--success)' : 'var(--accent)' }}>Blueprint: {bpScore}</span>
                              <div style={S.progressTrack}>
                                <div style={{ ...S.progressFill, width: `${bpScore}%`, background: isImprovement ? 'var(--success)' : 'var(--accent)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Structured Rubric Comparison */}
              <div style={S.paneCard} className="card-glass">
                <h3 style={S.cardTitle}>LLM Evaluation Rubric Comparison</h3>
                <p style={S.cardSubTitle}>6-dimensional systems architect evaluation averages</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                  {(() => {
                    const dimensions = [
                      { key: 'architecture_completeness', label: 'Architecture Completeness' },
                      { key: 'dependency_correctness', label: 'Dependency Correctness' },
                      { key: 'backend_alignment', label: 'Backend Alignment' },
                      { key: 'database_alignment', label: 'Database Alignment' },
                      { key: 'ui_alignment', label: 'UI Alignment' },
                      { key: 'constraint_compliance', label: 'Constraint Compliance' }
                    ];

                    const getDimAverage = (type, key) => {
                      let sum = 0;
                      let count = 0;
                      abComparison.pairwise.forEach(p => {
                        const item = p[type];
                        if (item && item.rubric && typeof item.rubric[key] === 'number') {
                          sum += item.rubric[key];
                          count++;
                        }
                      });
                      return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
                    };

                    return dimensions.map(dim => {
                      const legacyScore = getDimAverage('legacy', dim.key);
                      const bpScore = getDimAverage('blueprint', dim.key);

                      return (
                        <div key={dim.key} style={S.rubricDimRow}>
                          <span style={S.rubricLabel}>{dim.label}</span>
                          <div style={S.rubricComparisonTrack}>
                            <div style={S.rubricBarGroup}>
                              <span style={S.rubricValueLabel}>Legacy: {legacyScore}</span>
                              <div style={S.progressTrack}>
                                <div style={{ ...S.progressFill, width: `${legacyScore}%`, background: 'var(--muted-foreground)' }} />
                              </div>
                            </div>
                            <div style={S.rubricBarGroup}>
                              <span style={{ ...S.rubricValueLabel, color: 'var(--accent)' }}>Blueprint: {bpScore}</span>
                              <div style={S.progressTrack}>
                                <div style={{ ...S.progressFill, width: `${bpScore}%`, background: 'var(--accent)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* A/B Insights */}
              <div style={S.paneCard} className="card-glass">
                <h3 style={S.cardTitle}>Evidence of Blueprint Superiority</h3>
                <p style={S.cardSubTitle}>Key architectural findings from benchmark evaluation</p>
                <div style={S.insightsList}>
                  <div style={S.insightCard} className="noise-overlay">
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    <div>
                      <h4 style={S.insightHeading}>Determinism & Completeness</h4>
                      <p style={S.insightText}>
                        Blueprint-Guided prompts enforce schema checks (V104/V105) and resolve dependency relations (V112). 
                        This increases completion rates of expected assets compared to raw context dumping.
                      </p>
                    </div>
                  </div>
                  <div style={S.insightCard} className="noise-overlay">
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    <div>
                      <h4 style={S.insightHeading}>Zero Healing Patches</h4>
                      <p style={S.insightText}>
                        Pre-validation of compile outputs prevents LLM failures in code constraints, resulting in a dramatic reduction in patch loops.
                      </p>
                    </div>
                  </div>
                  <div style={S.insightCard} className="noise-overlay">
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    <div>
                      <h4 style={S.insightHeading}>Precision Knowledge Utilization</h4>
                      <p style={S.insightText}>
                        By mapping only explicitly required relationships rather than dumping the whole retrieved neighborhood, blueprinting achieves optimal knowledge utilization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pairwise Comparison Table */}
              <div style={{ ...S.paneCard, gridColumn: 'span 2' }} className="card-glass">
                <h3 style={S.cardTitle}>Pairwise Prompt Comparisons</h3>
                <p style={S.cardSubTitle}>Side-by-side prompt generation audit logs for each deterministic benchmark ID</p>
                
                <div style={{ overflowX: 'auto', width: '100%', marginTop: '1.25rem' }}>
                  <table style={S.gapsTable}>
                    <thead>
                      <tr style={S.gapsHeaderRow}>
                        <th style={S.gapsTh}>Benchmark ID</th>
                        <th style={S.gapsTh}>User Query</th>
                        <th style={S.gapsTh}>Legacy LLM</th>
                        <th style={S.gapsTh}>Blueprint LLM</th>
                        <th style={S.gapsTh}>Legacy Struct</th>
                        <th style={S.gapsTh}>Blueprint Struct</th>
                        <th style={S.gapsTh}>Latency Δ</th>
                        <th style={S.gapsTh}>Patches (L / B)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abComparison.pairwise.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={S.tableEmptyCell}>
                            <AlertTriangle size={24} style={{ color: '#f59e0b', opacity: 0.7, marginBottom: '0.5rem' }} />
                            <div>No benchmark run logs found in the database. Run `node scripts/run_ab_benchmark.js` first.</div>
                          </td>
                        </tr>
                      ) : (
                        abComparison.pairwise.map(item => {
                          const legacyScore = item.legacy?.quality_score || 0;
                          const bpScore = item.blueprint?.quality_score || 0;
                          const isBpWinner = bpScore > legacyScore;
                          const latencyDiff = (item.blueprint?.latency_ms || 0) - (item.legacy?.latency_ms || 0);
                          const legacyStruct = item.legacy?.structural_accuracy_score || 0;
                          const bpStruct = item.blueprint?.structural_accuracy_score || 0;
                          const isStructWinner = bpStruct > legacyStruct;

                          return (
                            <tr key={item.benchmark_id} style={S.gapsRow} className="gaps-table-row">
                              <td style={{ ...S.gapsTd, fontWeight: 700 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                  <code>{item.benchmark_id}</code>
                                  {item.blueprint?.expected_context?.source && (
                                    <span style={S.sourceBadge}>
                                      {item.blueprint.expected_context.source}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ ...S.gapsTd, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.query}>
                                {item.query}
                              </td>
                              <td style={S.gapsTd}>
                                <span style={{ textDecoration: isBpWinner ? 'line-through' : 'none', opacity: isBpWinner ? 0.6 : 1 }}>
                                  {legacyScore > 0 ? `${legacyScore}%` : 'N/A'}
                                </span>
                              </td>
                              <td style={{ ...S.gapsTd, fontWeight: isBpWinner ? 700 : 500, color: isBpWinner ? 'var(--success)' : 'var(--foreground)' }}>
                                <span>{bpScore > 0 ? `${bpScore}%` : 'N/A'}</span>
                                {isBpWinner && <span style={S.winnerBadge}>+{(bpScore - legacyScore).toFixed(1)}%</span>}
                              </td>
                              <td style={S.gapsTd}>
                                <span style={{ textDecoration: isStructWinner ? 'line-through' : 'none', opacity: isStructWinner ? 0.6 : 1 }}>
                                  {legacyStruct > 0 ? `${legacyStruct}%` : 'N/A'}
                                </span>
                              </td>
                              <td style={{ ...S.gapsTd, fontWeight: isStructWinner ? 700 : 500, color: isStructWinner ? 'var(--success)' : 'var(--foreground)' }}>
                                <span>{bpStruct > 0 ? `${bpStruct}%` : 'N/A'}</span>
                                {isStructWinner && <span style={S.winnerBadge}>+{(bpStruct - legacyStruct).toFixed(1)}%</span>}
                              </td>
                              <td style={{ ...S.gapsTd, color: latencyDiff > 0 ? 'var(--muted-foreground)' : 'var(--success)' }}>
                                {latencyDiff > 0 ? `+${latencyDiff}ms` : `${latencyDiff}ms`}
                              </td>
                              <td style={S.gapsTd}>
                                <code>{item.legacy?.patch_count || 0}</code> / <code>{item.blueprint?.patch_count || 0}</code>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Styled JSX for local animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes rotateCw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: rotateCw 1s linear infinite;
        }

        .gaps-table-row {
          transition: background 0.15s ease;
        }
        .gaps-table-row:hover {
          background: color-mix(in srgb, var(--foreground) 3%, transparent);
        }

        @keyframes fillAnimation {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        .glow-bar-succ:hover {
          filter: drop-shadow(0 0 8px var(--success));
          opacity: 1;
        }
        .glow-bar-dest:hover {
          filter: drop-shadow(0 0 8px var(--destructive));
          opacity: 1;
        }
        `
      }} />
    </div>
  );
}

// ─── PREMIUM STYLE SYSTEM ──────────────────────────────────────
const S = {
  pageContainer: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 2rem 4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    fontFamily: 'var(--font-sans)',
  },

  headerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.5rem',
  },

  headerSplit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    width: '100%',
  },

  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontWeight: '600',
    marginBottom: '0.4rem',
  },

  greetingArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },

  pageTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },

  titleGradient: {
    background: 'linear-gradient(135deg, var(--foreground) 30%, var(--accent) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  pageSubtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
    color: 'var(--muted-foreground)',
    margin: 0,
    fontWeight: '400',
  },

  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--input)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Overview Cards
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '1.25rem',
    width: '100%',
  },

  statCard: {
    padding: '1.25rem',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    position: 'relative',
  },

  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  statLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    letterSpacing: '0.04em',
  },

  statIconWrap: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginTop: '0.25rem',
  },

  statSubText: {
    fontSize: '0.68rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    marginTop: '0.25rem',
  },

  // Tabs
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.4rem',
    borderRadius: '12px',
    width: 'fit-content',
  },

  tabBtn: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 1rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    background: isActive ? 'var(--input)' : 'transparent',
    color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
    transition: 'all 0.15s ease',
  }),

  // Tab Contents
  tabContentArea: {
    width: '100%',
  },

  tabPaneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    width: '100%',
  },

  paneCard: {
    padding: '1.5rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },

  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    margin: 0,
  },

  cardSubTitle: {
    fontSize: '0.78rem',
    color: 'var(--muted-foreground)',
    margin: '0.15rem 0 0 0',
  },

  chartWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1.5rem',
    width: '100%',
  },

  progressTrack: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: '3px',
  },

  rankingSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginTop: '1.5rem',
  },

  rankingColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },

  rankingHeaderCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    paddingBottom: '0.35rem',
    borderBottom: '1px solid var(--border)',
  },

  rankingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  rankingItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--foreground) 3%, transparent)',
    fontSize: '0.8rem',
  },

  rankingIdx: {
    fontWeight: 700,
    opacity: 0.5,
    marginRight: '0.75rem',
  },

  rankingName: {
    fontWeight: 600,
    flex: 1,
  },

  rankingScore: {
    fontWeight: 800,
  },

  // Gaps Tab
  gapsTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
  },

  filtersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    width: '100%',
  },

  filterCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginRight: '0.5rem',
  },

  filterSelect: {
    background: 'var(--input)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
  },

  gapsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },

  gapsHeaderRow: {
    borderBottom: '1.5px solid var(--border)',
  },

  gapsTh: {
    padding: '0.75rem 1rem',
    fontSize: '0.74rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  gapsRow: {
    borderBottom: '1px solid var(--border)',
    cursor: 'default',
  },

  gapsTd: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    color: 'var(--foreground)',
  },

  typeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
    color: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },

  priorityBadge: {
    fontSize: '0.66rem',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  sourceCode: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    opacity: 0.8,
  },

  tableEmptyCell: {
    padding: '3rem 2rem',
    textAlign: 'center',
    color: 'var(--muted-foreground)',
    fontSize: '0.85rem',
  },

  // Trends Tab
  insufficientTrendsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    borderRadius: '16px',
    border: '1px dashed var(--border)',
    textAlign: 'center',
    background: 'color-mix(in srgb, var(--card) 40%, transparent)',
    marginTop: '1rem',
  },

  insufficientDataPointsGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '1.5rem',
    background: 'var(--input)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },

  dataPointBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
  },

  // Integrity Grid
  integrityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
    marginTop: '1.5rem',
    width: '100%',
  },

  integrityCard: {
    background: 'color-mix(in srgb, var(--foreground) 2.5%, transparent)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },

  integrityLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  integrityDot: (hasFailure) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: hasFailure ? 'var(--destructive)' : 'var(--success)',
    boxShadow: hasFailure ? '0 0 8px var(--destructive)' : '0 0 8px var(--success)',
  }),

  integrityVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--foreground)',
    lineHeight: 1,
    marginTop: '0.25rem',
  },

  integrityStatus: (hasFailure) => ({
    fontSize: '0.72rem',
    fontWeight: 500,
    color: hasFailure ? 'var(--destructive)' : 'var(--success)',
  }),

  detailsBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: 0,
    marginTop: '0.25rem',
    transition: 'opacity 0.15s ease',
    outline: 'none',
  },

  collapsedContainer: {
    marginTop: '1.5rem',
    padding: '1rem',
    borderRadius: '10px',
    background: 'color-mix(in srgb, var(--foreground) 3%, transparent)',
    border: '1px solid var(--border)',
    width: '100%',
  },

  collapsedTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    letterSpacing: '0.04em',
    marginBottom: '0.75rem',
  },

  orphansBadgeWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },

  orphanBadgeItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.74rem',
  },

  orphanTag: (isValid) => ({
    fontSize: '0.58rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    padding: '1px 4px',
    borderRadius: '3px',
    background: isValid ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, #f59e0b 15%, transparent)',
  }),

  cycleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.76rem',
    color: 'var(--foreground)',
  },

  // Skeletons
  loadingSkel: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
  },

  skelLine: (w, h) => ({
    width: w,
    height: h,
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }),

  // A/B tab
  abSummaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },

  abPipelineCard: {
    background: 'color-mix(in srgb, var(--foreground) 1.5%, transparent)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },

  abCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.75rem',
  },

  abCardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: 0,
  },

  abBadgeLegacy: {
    fontSize: '0.62rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    color: 'var(--muted-foreground)',
    padding: '2px 8px',
    borderRadius: '4px',
  },

  abBadgeBlueprint: {
    fontSize: '0.62rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
    color: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '4px',
    boxShadow: '0 0 6px color-mix(in srgb, var(--accent) 25%, transparent)',
  },

  abStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },

  abStatItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  abStatLabel: {
    fontSize: '0.72rem',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
  },

  abStatVal: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--foreground)',
  },

  rubricDimRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },

  rubricLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--foreground)',
  },

  rubricComparisonTrack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'color-mix(in srgb, var(--foreground) 1.5%, transparent)',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },

  rubricBarGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },

  rubricValueLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    width: '100px',
    flexShrink: 0,
  },

  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.25rem',
  },

  insightCard: {
    display: 'flex',
    gap: '0.85rem',
    alignItems: 'flex-start',
    background: 'color-mix(in srgb, var(--foreground) 2%, transparent)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '1rem',
  },

  insightHeading: {
    fontSize: '0.82rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0',
  },

  insightText: {
    fontSize: '0.74rem',
    color: 'var(--muted-foreground)',
    margin: 0,
    lineHeight: 1.45,
  },

  winnerBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    background: 'color-mix(in srgb, var(--success) 12%, transparent)',
    color: 'var(--success)',
    padding: '1px 5px',
    borderRadius: '4px',
    marginLeft: '0.5rem',
  },
  sourceBadge: {
    fontSize: '0.65rem',
    fontWeight: '600',
    background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
    color: 'var(--muted-foreground)',
    padding: '1px 4px',
    borderRadius: '4px',
    marginTop: '4px',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
};
