import { useState, useEffect } from 'react';

/**
 * Reusable hook to format a timestamp into a relative time string.
 * Keeps rendering deterministic during SSR hydration by returning a static representation
 * until mounted, then updating on an interval.
 */
export function useRelativeTime(timestamp, intervalMs = 60000) {
  const [mounted, setMounted] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');

  const getRelativeString = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(() => {
    setMounted(true);
    setRelativeTime(getRelativeString(timestamp));

    const interval = setInterval(() => {
      setRelativeTime(getRelativeString(timestamp));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [timestamp, intervalMs]);

  // Return static absolute date string during SSR / hydration to keep rendering deterministic.
  if (!mounted) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  }

  return relativeTime;
}
