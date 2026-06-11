export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window !== 'undefined') {
    console.warn(
      "⚠️ NEXT_PUBLIC_API_URL environment variable is not configured. Falling back to http://localhost:8000"
    );
  }
}
