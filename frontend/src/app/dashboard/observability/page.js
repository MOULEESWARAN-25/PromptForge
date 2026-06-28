"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
import { apiUrl } from '@/config/api';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export default function WorkspaceQualityPanel() {
  const { user, loading } = useApp();
  const router = useRouter();

  // Active Panel Tab: 'coverage', 'gaps', 'trends', 'integrity', 'ab_test'
  const [activeTab, setActiveTab] = useState('coverage');

  // Stats and Metrics Data
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [trends, setTrends] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [abComparison, setAbComparison] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Backlog Gap Filters
  const [gapTypeFilter, setGapTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Quality details view toggles
  const [showOrphansList, setShowOrphansList] = useState(false);
  const [showCyclesList, setShowCyclesList] = useState(false);

  const fetchGaps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (gapTypeFilter) params.append('type', gapTypeFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');

      const resGaps = await fetch(apiUrl(`/observability/gaps?${params.toString()}`));
      if (resGaps.ok) {
        const gapsEnvelope = await resGaps.json();
        setGaps(gapsEnvelope?.data ?? gapsEnvelope);
      }
    } catch (err) {
      console.error("Gaps fetch error:", err);
    }
  }, [gapTypeFilter, priorityFilter, statusFilter]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      // 1. Fetch Summary
      const resSummary = await fetch(apiUrl('/observability/summary'));
      if (!resSummary.ok) throw new Error(`Summary API returned status ${resSummary.status}`);
      const summaryEnvelope = await resSummary.json();
      setSummary(summaryEnvelope?.data ?? summaryEnvelope);

      // 2. Fetch Analytics
      const resAnalytics = await fetch(apiUrl('/observability/analytics'));
      if (!resAnalytics.ok) throw new Error(`Analytics API returned status ${resAnalytics.status}`);
      const analyticsEnvelope = await resAnalytics.json();
      setAnalytics(analyticsEnvelope?.data ?? analyticsEnvelope);

      // 3. Fetch Trends
      const resTrends = await fetch(apiUrl('/observability/trends'));
      if (!resTrends.ok) throw new Error(`Trends API returned status ${resTrends.status}`);
      const trendsEnvelope = await resTrends.json();
      setTrends(trendsEnvelope?.data ?? trendsEnvelope);

      // 4. Fetch Integrity Validation
      const resIntegrity = await fetch(apiUrl('/observability/integrity'));
      if (!resIntegrity.ok) throw new Error(`Integrity API returned status ${resIntegrity.status}`);
      const integrityEnvelope = await resIntegrity.json();
      setIntegrity(integrityEnvelope?.data ?? integrityEnvelope);

      // 5. Fetch A/B Benchmark Comparison
      const resAb = await fetch(apiUrl('/observability/ab_comparison'));
      if (!resAb.ok) throw new Error(`A/B Comparison API returned status ${resAb.status}`);
      const abEnvelope = await resAb.json();
      setAbComparison(abEnvelope?.data ?? abEnvelope);

      // 6. Fetch Gaps list (initially unfiltered)
      await fetchGaps();

    } catch (err) {
      console.error("Failed to load quality metrics:", err);
      toast.error("Failed to sync workspace health metrics");
    } finally {
      setFetching(false);
    }
  }, [fetchGaps]);

  // Trigger gaps fetch whenever filters change
  useEffect(() => {
    if (user) {
      fetchGaps();
    }
  }, [fetchGaps, user]);

  // Initial load
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      if (!FEATURE_FLAGS.QUALITY_PANEL_ENABLED) {
        router.replace('/dashboard');
        return;
      }
      fetchData();
      track('quality_panel_viewed');
    }
  }, [user, loading, router, fetchData]);

  if (loading || !user || !summary) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-8 py-16 flex flex-col gap-6">
        <div className="w-[240px] h-[24px] rounded-lg bg-foreground/5 animate-pulse" />
        <div className="w-[60%] h-[48px] rounded-lg bg-foreground/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="w-full h-[120px] rounded-lg bg-foreground/5 animate-pulse" />
          <div className="w-full h-[120px] rounded-lg bg-foreground/5 animate-pulse" />
          <div className="w-full h-[120px] rounded-lg bg-foreground/5 animate-pulse" />
          <div className="w-full h-[120px] rounded-lg bg-foreground/5 animate-pulse" />
        </div>
      </div>
    );
  }

  // Priority and Gap type colors
  const getPriorityStyle = (p) => {
    switch (p) {
      case 'critical': return { bg: 'bg-destructive/10', color: 'text-destructive', label: 'critical' };
      case 'high': return { bg: 'bg-amber-500/10', color: 'text-amber-500', label: 'high' };
      case 'medium': return { bg: 'bg-primary/10', color: 'text-primary', label: 'medium' };
      default: return { bg: 'bg-muted-foreground/15', color: 'text-muted-foreground', label: 'low' };
    }
  };

  const getGapTypeLabel = (t) => {
    switch (t) {
      case 'LOW_COVERAGE': return 'Low Coverage';
      case 'INCOMPLETE_ENTITY': return 'Incomplete Profile';
      case 'INVALID_RELATIONSHIP': return 'Dangling Link';
      case 'STALE_ENTITY': return 'Stale Entity';
      default: return t;
    }
  };

  const integrityLabels = integrity?.labels || {
    orphans: "Independent Design Elements",
    duplicate_slugs_count: "Duplicate Identifiers",
    broken_relationships_count: "Dangling References",
    circular_relationships: "Recursive Reference Loops",
    invalid_relationship_types_count: "Invalid Reference Types"
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 pb-16 flex flex-col gap-10 font-sans">
      
      {/* ─── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex items-center justify-between gap-8 w-full">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
              <span>{user?.username || 'User'}&apos;s Workspace</span>
              <ChevronRight size={12} className="opacity-40" />
              <span className="text-primary font-semibold">Workspace Health</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold m-0 tracking-tight leading-none text-foreground">
              Workspace <span className="bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">Health</span>
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground m-0 font-normal">
              Track content coverage, identify knowledge gaps, and verify workspace consistency at a glance.
            </p>
          </div>

          <button 
            className="flex items-center gap-2 bg-input text-foreground border border-border rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-muted/80 transition-all duration-200"
            onClick={fetchData} 
            disabled={fetching} 
            title="Refresh Metrics"
          >
            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            <span>{fetching ? 'Syncing...' : 'Sync Metrics'}</span>
          </button>
        </div>
      </div>

      {/* ─── OVERVIEW CARDS (Bento Grid) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5 w-full">
        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Total Elements</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-primary bg-primary/10">
              <Layers size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.totalEntities}</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Active design structures</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Total Links</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-emerald-500 bg-emerald-500/10">
              <Database size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.totalRelationships}</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Inter-element connections</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Active Apps</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-amber-500 bg-amber-500/10">
              <Activity size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.activeApplications}</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Configured app targets</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">App Layout Coverage</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-primary bg-primary/10">
              <Layers3 size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.avgStructuralCoverage}%</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Pages, features & modules</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Style Coverage</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-rose-500 bg-rose-500/10">
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.avgLeafCoverage}%</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Components & tokens</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Sync Validity</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-emerald-500 bg-emerald-500/10">
              <ShieldAlert size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.telemetryValidityRate}%</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Workspace SLA index</span>
        </div>

        <div className="p-5 rounded-xl flex flex-col gap-1 relative card-glass bg-muted/10 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[0.72rem] font-bold uppercase text-muted-foreground tracking-wider">Identified Gaps</span>
            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-red-500 bg-red-500/10">
              <AlertTriangle size={13} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none mt-1">{summary.openGapsCount}</div>
          <span className="text-[0.68rem] text-muted-foreground font-medium mt-1">Pending design enhancements</span>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 rounded-xl w-fit card-glass bg-muted/20 border border-border">
        <button
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 ${
            activeTab === 'coverage' ? 'bg-input text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('coverage')}
        >
          <Layers size={14} />
          <span>Content Coverage</span>
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 ${
            activeTab === 'gaps' ? 'bg-input text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('gaps')}
        >
          <ListTodo size={14} />
          <span>Gap Management</span>
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 ${
            activeTab === 'trends' ? 'bg-input text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={14} />
          <span>Health Trends</span>
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 ${
            activeTab === 'integrity' ? 'bg-input text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('integrity')}
        >
          <ShieldAlert size={14} />
          <span>Consistency Audits</span>
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 ${
            activeTab === 'ab_test' ? 'bg-input text-primary font-bold' : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('ab_test')}
        >
          <Activity size={14} />
          <span>Benchmark Comparison</span>
        </button>
      </div>

      {/* ─── TAB CONTENTS ──────────────────────────────────────── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* 1. COVERAGE ANALYTICS */}
          {activeTab === 'coverage' && analytics && (
            <motion.div
              key="coverage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
            >
              {/* Distribution SVG Chart */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Element Coverage Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Count of workspace design elements grouped by coverage score</p>
                
                <div className="flex justify-center items-center mt-6 w-full">
                  <svg width="100%" height="220" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
                    <line x1="40" y1="180" x2="480" y2="180" stroke="var(--border)" strokeWidth="1" />
                    <line x1="40" y1="40" x2="480" y2="40" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                    {/* Bar 1: <20% */}
                    <rect x="75" y={180 - (analytics.coverageDistribution.under20 * 1.2)} width="40" height={analytics.coverageDistribution.under20 * 1.2} rx="4" fill="var(--destructive)" opacity="0.85" />
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
                    <rect x="395" y={180 - (analytics.coverageDistribution.over80 * 1.2)} width="40" height={analytics.coverageDistribution.over80 * 1.2} rx="4" fill="var(--success)" opacity="0.85" />
                    <text x="415" y="196" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">&gt; 80%</text>
                    <text x="415" y={172 - (analytics.coverageDistribution.over80 * 1.2)} fill="var(--foreground)" fontSize="11" fontWeight="700" textAnchor="middle">{analytics.coverageDistribution.over80}</text>
                  </svg>
                </div>
              </div>

              {/* Layer-by-layer bars */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Coverage Score by Layer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average completeness across active system layers</p>
                
                <div className="flex flex-col gap-5 mt-6">
                  {Object.keys(analytics.coverageByLayer).map(layer => {
                    const score = analytics.coverageByLayer[layer];
                    return (
                      <div key={layer} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize">{layer.replace('_', ' ')}</span>
                          <span className={score < 60 ? 'text-destructive' : 'text-success'}>{score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${score < 60 ? 'bg-destructive' : 'bg-success'}`}
                            style={{ width: `${score}%` }}
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

              {/* Application Ranking */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-extrabold m-0">Project Blueprint Quality Ranking</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Completeness scores across active project blueprints</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  {/* Lowest Column */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-1.5 border-b border-border text-destructive">
                      <Flame size={14} />
                      <span>Blueprints Requiring Attention</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {analytics.lowestCoverageApps.map((app, idx) => (
                        <div key={app.id} className="flex items-center px-3 py-2 rounded-lg bg-foreground/3 text-xs">
                          <span className="font-bold opacity-50 mr-3">{idx + 1}</span>
                          <span className="font-semibold flex-1">{app.name}</span>
                          <span className="font-extrabold text-destructive">{app.coverage_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highest Column */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-1.5 border-b border-border text-success">
                      <CheckCircle2 size={14} />
                      <span>Fully Complete Blueprints</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {analytics.highestCoverageApps.map((app, idx) => (
                        <div key={app.id} className="flex items-center px-3 py-2 rounded-lg bg-foreground/3 text-xs">
                          <span className="font-bold opacity-50 mr-3">{idx + 1}</span>
                          <span className="font-semibold flex-1">{app.name}</span>
                          <span className="font-extrabold text-success">{app.coverage_score}%</span>
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
              className="flex flex-col gap-5 w-full"
            >
              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl w-full card-glass bg-muted/10 border border-border">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary mr-2">
                  <Filter size={12} />
                  <span>Filters</span>
                </div>

                <select
                  value={gapTypeFilter}
                  onChange={e => setGapTypeFilter(e.target.value)}
                  className="bg-input text-foreground border border-border rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer outline-none hover:bg-muted/80"
                >
                  <option value="">All Gap Types</option>
                  <option value="LOW_COVERAGE">Low Coverage</option>
                  <option value="INCOMPLETE_ENTITY">Incomplete Profiles</option>
                  <option value="INVALID_RELATIONSHIP">Dangling Links</option>
                  <option value="STALE_ENTITY">Stale Entries</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="bg-input text-foreground border border-border rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer outline-none hover:bg-muted/80"
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
                  className="bg-input text-foreground border border-border rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer outline-none hover:bg-muted/80"
                >
                  <option value="">All Statuses</option>
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Table */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Target Element</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Gap Type</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">First Seen</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 px-8 text-center text-muted-foreground text-xs">
                            <CheckCircle2 size={24} className="text-success opacity-75 mx-auto mb-2" />
                            <div>All design gaps cleared in current filters!</div>
                          </td>
                        </tr>
                      ) : (
                        gaps.map(gap => {
                          const pStyle = getPriorityStyle(gap.priority);
                          return (
                            <tr key={gap.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                              <td className="px-4 py-3.5 text-xs text-foreground font-bold">{gap.entity_name}</td>
                              <td className="px-4 py-3.5 text-xs">
                                <span className="text-[0.7rem] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">
                                  {getGapTypeLabel(gap.gap_type)}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-xs">
                                <span className={`text-[0.66rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${pStyle.bg} ${pStyle.color}`}>
                                  {pStyle.label}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-mono opacity-80">{gap.source}</td>
                              <td className="px-4 py-3.5 text-xs">
                                {new Date(gap.first_seen_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                {gap.resolution_notes || 'No notes compiled.'}
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
              className="grid grid-cols-1 gap-6 w-full"
            >
              {/* Coverage Over Time area chart */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Average Workspace Health Score over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Timeline tracking aggregate completeness across app definitions</p>

                {trends.insufficient_history ? (
                  <div className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl border border-dashed border-border text-center bg-card/10 mt-4">
                    <Calendar size={32} className="text-primary opacity-70 mb-3" />
                    <h4 className="margin-0 text-sm font-bold text-foreground">Collecting Trend History...</h4>
                    <p className="margin-0 text-xs text-muted-foreground max-w-sm mt-1">
                      Only **{trends.uniqueDatesCount} day** of snapshot data is stored in the database cache.
                    </p>
                    <p className="text-[0.72rem] text-muted-foreground/80 mt-2">
                      Workspace metrics compile daily. A minimum of 3 separate dates are required to plot the line chart.
                    </p>

                    <div className="flex items-center gap-3 mt-6 bg-input px-4 py-2 rounded-lg border border-border">
                      <span className="text-[0.72rem] font-bold text-primary">Active Snapshots:</span>
                      {trends.points.map(p => (
                        <div key={p.date} className="flex items-center gap-1.5 bg-foreground/5 px-2 py-0.5 rounded text-[0.72rem] font-mono">
                          <span>{p.date}</span>
                          <ChevronRight size={10} className="opacity-50" />
                          <span className="font-extrabold">{p.coverage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center mt-6 w-full">
                    <svg width="100%" height="240" viewBox="0 0 600 240" style={{ overflow: 'visible' }}>
                      <line x1="40" y1="200" x2="560" y2="200" stroke="var(--border)" strokeWidth="1" />
                      <line x1="40" y1="50" x2="560" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                      <line x1="40" y1="125" x2="560" y2="125" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                      {(() => {
                        const width = 520;
                        const height = 150;
                        const startY = 200;
                        const pointsCount = trends.points.length;
                        const xStep = pointsCount > 1 ? width / (pointsCount - 1) : width;

                        const coordinates = trends.points.map((pt, i) => {
                          const x = 40 + (i * xStep);
                          const y = startY - ((pt.coverage / 100) * height);
                          return { x, y, pt };
                        });

                        const pathStr = coordinates.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                        const areaStr = `${pathStr} L ${coordinates[coordinates.length - 1].x} 200 L 40 200 Z`;

                        return (
                          <>
                            <path d={areaStr} fill="url(#areaGrad)" opacity="0.15" />
                            <path d={pathStr} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                            {coordinates.map((c, idx) => (
                              <g key={idx}>
                                <circle cx={c.x} cy={c.y} r="5" fill="var(--background)" stroke="var(--accent)" strokeWidth="2.5" />
                                <text x={c.x} y={c.y - 12} fill="var(--foreground)" fontSize="9" fontWeight="700" textAnchor="middle">{c.pt.coverage}%</text>
                                <text x={c.x} y="215" fill="var(--muted-foreground)" fontSize="9" textAnchor="middle">{c.pt.date.split('-').slice(1).join('/')}</text>
                              </g>
                            ))}
                            <defs>
                              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
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
              className="grid grid-cols-1 gap-6 w-full"
            >
              {/* Integrity audits */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Workspace Integrity Audits</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last automated consistency scan run at {new Date(integrity.last_run_at || 1782476684000).toLocaleTimeString()}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 w-full">
                  {/* Orphan Entities */}
                  <div className="bg-foreground/2 px-5 py-4 border border-border rounded-xl flex flex-col gap-2 items-start">
                    <div className="flex justify-between items-flex-start w-full">
                      <span className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider">{integrityLabels.orphans}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${integrity.orphans.filter(o => !o.is_valid).length > 0 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-success shadow-[0_0_8px_var(--success)]'}`} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground leading-none mt-1">{integrity.orphans.length}</div>
                    
                    <button 
                      className="bg-transparent border-none text-primary text-[0.72rem] font-bold cursor-pointer flex items-center gap-1 p-0 mt-1 hover:opacity-80 transition-opacity outline-none"
                      onClick={() => setShowOrphansList(!showOrphansList)}
                    >
                      <Eye size={12} />
                      <span>{showOrphansList ? 'Hide List' : 'View Elements'}</span>
                    </button>
                  </div>

                  {/* Duplicate Slugs */}
                  <div className="bg-foreground/2 px-5 py-4 border border-border rounded-xl flex flex-col gap-2 items-start">
                    <div className="flex justify-between items-flex-start w-full">
                      <span className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider">{integrityLabels.duplicate_slugs_count}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${integrity.duplicate_slugs_count > 0 ? 'bg-destructive shadow-[0_0_8px_var(--destructive)]' : 'bg-success shadow-[0_0_8px_var(--success)]'}`} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground leading-none mt-1">{integrity.duplicate_slugs_count}</div>
                    <span className={`text-[0.72rem] font-medium ${integrity.duplicate_slugs_count > 0 ? 'text-destructive' : 'text-success'}`}>
                      {integrity.duplicate_slugs_count > 0 ? 'Duplicate IDs found' : 'Fully Unique'}
                    </span>
                  </div>

                  {/* Broken Relationships */}
                  <div className="bg-foreground/2 px-5 py-4 border border-border rounded-xl flex flex-col gap-2 items-start">
                    <div className="flex justify-between items-flex-start w-full">
                      <span className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider">{integrityLabels.broken_relationships_count}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${integrity.broken_relationships_count > 0 ? 'bg-destructive shadow-[0_0_8px_var(--destructive)]' : 'bg-success shadow-[0_0_8px_var(--success)]'}`} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground leading-none mt-1">{integrity.broken_relationships_count}</div>
                    <span className={`text-[0.72rem] font-medium ${integrity.broken_relationships_count > 0 ? 'text-destructive' : 'text-success'}`}>
                      {integrity.broken_relationships_count > 0 ? 'Dangling references' : 'All Links Valid'}
                    </span>
                  </div>

                  {/* Circular Relationships */}
                  <div className="bg-foreground/2 px-5 py-4 border border-border rounded-xl flex flex-col gap-2 items-start">
                    <div className="flex justify-between items-flex-start w-full">
                      <span className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider">{integrityLabels.circular_relationships}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${integrity.circular_relationships.length > 0 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-success shadow-[0_0_8px_var(--success)]'}`} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground leading-none mt-1">{integrity.circular_relationships.length}</div>
                    
                    {integrity.circular_relationships.length > 0 ? (
                      <button 
                        className="bg-transparent border-none text-primary text-[0.72rem] font-bold cursor-pointer flex items-center gap-1 p-0 mt-1 hover:opacity-80 transition-opacity outline-none"
                        onClick={() => setShowCyclesList(!showCyclesList)}
                      >
                        <Eye size={12} />
                        <span>{showCyclesList ? 'Hide List' : 'View Loops'}</span>
                      </button>
                    ) : (
                      <span className="text-[0.72rem] font-medium text-success">No Loops Detected</span>
                    )}
                  </div>
                </div>

                {/* Expanded list: Orphans */}
                {showOrphansList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-6 p-4 rounded-lg bg-foreground/3 border border-border w-full"
                  >
                    <div className="text-[0.78rem] font-bold uppercase text-muted-foreground tracking-wider mb-3">Independent Elements Breakdown</div>
                    <div className="flex flex-wrap gap-2">
                      {integrity.orphans.map(orphan => (
                        <div
                          key={orphan.id}
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[0.74rem] ${
                            orphan.is_valid 
                              ? 'bg-success/5 text-success border border-success/15' 
                              : 'bg-amber-500/5 text-amber-500 border border-amber-500/15'
                          }`}
                        >
                          <code>{orphan.id}</code>
                          <span className={`text-[0.58rem] font-extrabold uppercase px-1 rounded ${
                            orphan.is_valid ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-500'
                          }`}>
                            {orphan.is_valid ? 'standalone' : 'unlinked'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 mb-0 text-[0.7rem] text-muted-foreground leading-relaxed">
                      *Note: standalone elements represent naturally independent configuration entities (such as typography variables, global theme choices, or checklist items) that compile correctly without active links.*
                    </p>
                  </motion.div>
                )}

                {/* Expanded list: Cycles */}
                {showCyclesList && integrity.circular_relationships.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-6 p-4 rounded-lg bg-foreground/3 border border-border w-full"
                  >
                    <div className="text-[0.78rem] font-bold uppercase text-muted-foreground tracking-wider mb-3">Recursive References List</div>
                    <div className="flex flex-col gap-2">
                      {integrity.circular_relationships.map((cycle, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[0.76rem] text-foreground">
                          <CornerDownRight size={11} className="opacity-50" />
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
            >
              {/* Performance Comparison Bento Cards */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border lg:col-span-2">
                <h3 className="text-base font-extrabold m-0">Performance A/B Comparison</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Aggregated evaluation outcomes comparing legacy vs. blueprint-guided pipeline</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Legacy Card */}
                  <div className="bg-foreground/1.5 border border-border rounded-xl p-6 flex flex-col gap-5 border-l-4 border-l-muted-foreground">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <h4 className="text-[0.95rem] font-bold m-0 text-foreground">Legacy Pipeline</h4>
                      <span className="text-[0.62rem] font-extrabold uppercase tracking-wider bg-foreground/10 text-muted-foreground px-2 py-0.5 rounded">Baseline</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Evaluation Score</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.legacy.avg_quality_score}%</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Structural Accuracy</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.legacy.avg_structural_accuracy_score}%</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Avg Latency</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.legacy.avg_latency_ms}ms</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Healing Patches</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.legacy.total_patches}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Evaluated Runs</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.legacy.total_runs}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint Card */}
                  <div className="bg-foreground/1.5 border border-border rounded-xl p-6 flex flex-col gap-5 border-l-4 border-l-primary">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <h4 className="text-[0.95rem] font-bold m-0 text-foreground">Blueprint-Guided Pipeline</h4>
                      <span className="text-[0.62rem] font-extrabold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Evaluation Score</span>
                        <span className="text-lg font-extrabold text-success">{abComparison.aggregates.blueprint.avg_quality_score}%</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Structural Accuracy</span>
                        <span className="text-lg font-extrabold text-success">{abComparison.aggregates.blueprint.avg_structural_accuracy_score}%</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Avg Latency</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.blueprint.avg_latency_ms}ms</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Healing Patches</span>
                        <span className={`text-lg font-extrabold ${abComparison.aggregates.blueprint.total_patches === 0 ? 'text-success' : 'text-foreground'}`}>
                          {abComparison.aggregates.blueprint.total_patches}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Knowledge Utilization</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.blueprint.avg_utilization}%</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Node Completion</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.blueprint.avg_completion}%</span>
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-[0.72rem] text-muted-foreground font-medium">Evaluated Runs</span>
                        <span className="text-lg font-extrabold text-foreground">{abComparison.aggregates.blueprint.total_runs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structural Accuracy Breakdown */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Structural Accuracy Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Blueprint element preservation measured against expected schema</p>
                
                <div className="flex flex-col gap-4 mt-5">
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
                        <div key={dim.key} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                            <span>{dim.label}</span>
                            {isImprovement && bpScore - legacyScore > 0 && (
                              <span className="text-[0.65rem] font-extrabold bg-success/12 text-success px-1.5 py-0.5 rounded ml-2">
                                +{(bpScore - legacyScore).toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 bg-foreground/1.5 p-3 rounded-lg border border-border">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[0.7rem] font-bold text-muted-foreground w-[100px] shrink-0">Legacy: {legacyScore}</span>
                              <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                                <div className="h-full rounded-full bg-muted-foreground" style={{ width: `${legacyScore}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className={`text-[0.7rem] font-bold w-[100px] shrink-0 ${isImprovement ? 'text-success' : 'text-primary'}`}>
                                Blueprint: {bpScore}
                              </span>
                              <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                                <div className={`h-full rounded-full ${isImprovement ? 'bg-success' : 'bg-primary'}`} style={{ width: `${bpScore}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Evaluation Rubric */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border">
                <h3 className="text-base font-extrabold m-0">Evaluation Rubric Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Multi-dimensional quality metrics audit results</p>
                
                <div className="flex flex-col gap-4 mt-5">
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
                        <div key={dim.key} className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{dim.label}</span>
                          <div className="flex flex-col gap-2 bg-foreground/1.5 p-3 rounded-lg border border-border">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[0.7rem] font-bold text-muted-foreground w-[100px] shrink-0">Legacy: {legacyScore}</span>
                              <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                                <div className="h-full rounded-full bg-muted-foreground" style={{ width: `${legacyScore}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[0.7rem] font-bold text-primary w-[100px] shrink-0">Blueprint: {bpScore}</span>
                              <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${bpScore}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Key findings */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border lg:col-span-2">
                <h3 className="text-base font-extrabold m-0">Key Quality Findings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Evaluation metrics and blueprint pipeline insights</p>
                <div className="flex flex-col gap-4 mt-5">
                  <div className="flex gap-3 items-start bg-foreground/2 border border-border rounded-lg p-4">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold m-0 mb-1">Determinism & Schema Validation</h4>
                      <p className="text-[0.74rem] text-muted-foreground m-0 leading-relaxed">
                        Blueprint-Guided prompts enforce strict schema checks and automatically resolve dependent components.
                        This increases completion rates of expected items compared to raw context retrieval.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-foreground/2 border border-border rounded-lg p-4">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold m-0 mb-1">Zero Healing Patches</h4>
                      <p className="text-[0.74rem] text-muted-foreground m-0 leading-relaxed">
                        Pre-validation of compiler outputs prevents AI errors in code constraints, resulting in a dramatic reduction in patch recovery loops.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-foreground/2 border border-border rounded-lg p-4">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold m-0 mb-1">Precision Knowledge Mapping</h4>
                      <p className="text-[0.74rem] text-muted-foreground m-0 leading-relaxed">
                        By mapping only explicitly related terms rather than retrieving arbitrary neighborhoods, blueprinting achieves optimal knowledge utilization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pairwise comparisons table */}
              <div className="p-6 rounded-2xl flex flex-col w-full card-glass bg-card/40 border border-border lg:col-span-2">
                <h3 className="text-base font-extrabold m-0">Pairwise Prompt Evaluations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Side-by-side prompt generation audit logs for each deterministic benchmark</p>
                
                <div className="overflow-x-auto w-full mt-5">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Benchmark ID</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Query Description</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Legacy LLM</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Blueprint LLM</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Legacy Struct</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Blueprint Struct</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Latency Δ</th>
                        <th className="px-4 py-3 text-[0.74rem] font-bold text-muted-foreground uppercase tracking-wider">Patches (L/B)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abComparison.pairwise.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 px-8 text-center text-muted-foreground text-xs">
                            <AlertTriangle size={24} className="text-amber-500 opacity-75 mx-auto mb-2" />
                            <div>No benchmark run logs found in the database.</div>
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
                            <tr key={item.benchmark_id} className="border-b border-border hover:bg-muted/5 transition-colors">
                              <td className="px-4 py-3.5 text-xs text-foreground font-bold">
                                <div className="flex flex-col items-start gap-1">
                                  <code>{item.benchmark_id}</code>
                                  {item.blueprint?.expected_context?.source && (
                                    <span className="text-[0.65rem] font-semibold bg-foreground/6 text-muted-foreground px-1 rounded mt-1 inline-block uppercase tracking-wider">
                                      {item.blueprint.expected_context.source}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-xs maxWidth-[220px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.query}>
                                {item.query}
                              </td>
                              <td className="px-4 py-3.5 text-xs">
                                <span className={isBpWinner ? 'line-through opacity-60' : ''}>
                                  {legacyScore > 0 ? `${legacyScore}%` : 'N/A'}
                                </span>
                              </td>
                              <td className={`px-4 py-3.5 text-xs ${isBpWinner ? 'font-bold text-success' : 'font-medium'}`}>
                                <span>{bpScore > 0 ? `${bpScore}%` : 'N/A'}</span>
                                {isBpWinner && (
                                  <span className="text-[0.65rem] font-extrabold bg-success/12 text-success px-1.5 py-0.5 rounded ml-1.5">
                                    +{(bpScore - legacyScore).toFixed(1)}%
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-xs">
                                <span className={isStructWinner ? 'line-through opacity-60' : ''}>
                                  {legacyStruct > 0 ? `${legacyStruct}%` : 'N/A'}
                                </span>
                              </td>
                              <td className={`px-4 py-3.5 text-xs ${isStructWinner ? 'font-bold text-success' : 'font-medium'}`}>
                                <span>{bpStruct > 0 ? `${bpStruct}%` : 'N/A'}</span>
                                {isStructWinner && (
                                  <span className="text-[0.65rem] font-extrabold bg-success/12 text-success px-1.5 py-0.5 rounded ml-1.5">
                                    +{(bpStruct - legacyStruct).toFixed(1)}%
                                  </span>
                                )}
                              </td>
                              <td className={`px-4 py-3.5 text-xs ${latencyDiff > 0 ? 'text-muted-foreground' : 'text-success'}`}>
                                {latencyDiff > 0 ? `+${latencyDiff}ms` : `${latencyDiff}ms`}
                              </td>
                              <td className="px-4 py-3.5 text-xs">
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
    </div>
  );
}
