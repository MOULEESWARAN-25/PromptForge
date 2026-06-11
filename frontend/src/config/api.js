const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // If in the browser, check the hostname to determine the target API environment dynamically
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production frontend maps to production backend
    if (hostname === 'veyntra.vercel.app' || hostname === 'www.veyntra.vercel.app') {
      return 'https://veyntra-backend.vercel.app';
    }
  }

  // Local fallback
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();

if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window !== 'undefined') {
    console.warn(
      "⚠️ NEXT_PUBLIC_API_URL environment variable is not configured. Falling back to " + API_BASE_URL
    );
  }
}

