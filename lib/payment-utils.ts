/**
 * Get the base URL for the application
 * Automatically handles production (HTTPS) vs development (HTTP)
 * This is for client-side usage
 */
export function getBaseUrl(): string {
  // If NEXT_PUBLIC_APP_URL is explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Client-side: use window.location for browser
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback
  return getServerBaseUrl();
}

/**
 * Get the base URL for server-side API calls
 * This ensures HTTPS in production and proper protocol handling
 */
export function getServerBaseUrl(): string {
  // If explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Vercel provides VERCEL_URL in all environments (preview, production, development)
  // VERCEL_URL is the deployment URL (e.g., your-app.vercel.app)
  if (process.env.VERCEL_URL) {
    // Vercel always uses HTTPS
    return `https://${process.env.VERCEL_URL}`;
  }

  // Check for VERCEL_ENV to determine production
  // VERCEL_ENV can be: 'production', 'preview', or 'development'
  if (process.env.VERCEL_ENV === 'production') {
    // In production, we need HTTPS
    // If NEXT_PUBLIC_APP_URL is not set, this will fail - user must set it
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.warn('WARNING: NEXT_PUBLIC_APP_URL is not set in production. Please set it in your environment variables.');
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  }

  // Check NODE_ENV for production
  if (process.env.NODE_ENV === 'production') {
    // In production, default to HTTPS
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.warn('WARNING: NEXT_PUBLIC_APP_URL is not set in production. Please set it in your environment variables.');
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  }

  // Development environment - use HTTP localhost
  return 'http://localhost:3000';
}

/**
 * Ensure URL uses HTTPS in production
 * This is critical for payment gateways which require HTTPS in production
 */
export function ensureHttps(url: string): string {
  // If already HTTPS, return as is
  if (url.startsWith('https://')) {
    return url;
  }

  // In production environments, convert HTTP to HTTPS
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview'; // Preview deployments also use HTTPS

  if (isProduction) {
    // Force HTTPS in production
    const httpsUrl = url.replace('http://', 'https://');
    if (httpsUrl !== url) {
      console.log(`Converted HTTP to HTTPS: ${url} -> ${httpsUrl}`);
    }
    return httpsUrl;
  }

  // In development, allow HTTP (localhost)
  return url;
}

