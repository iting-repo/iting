/**
 * Marketing analytics + UTM attribution utility.
 *
 * Captures UTM params on landing → persists in localStorage for 30 days → attaches to register payload.
 * Loads Google Analytics 4 + Microsoft Clarity on demand AFTER user accepts cookie consent.
 *
 * Env vars (configure in .env or webpack DefinePlugin):
 *   REACT_APP_GA4_ID      → e.g. "G-XXXXXXXXXX"
 *   REACT_APP_CLARITY_ID  → e.g. "q7y2x4j3a9"
 */

const UTM_STORAGE_KEY = 'iting_utm_attribution';
const UTM_TTL_DAYS = 30;
const COOKIE_KEY = 'iting_cookie_consent';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

/**
 * Capture UTM params from current URL on first landing.
 * Should be called once at app boot (App.jsx useEffect).
 */
export function captureUtmFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    let hasAny = false;
    UTM_PARAMS.forEach((key) => {
      const v = params.get(key);
      if (v) {
        utm[key] = v;
        hasAny = true;
      }
    });

    // Capture referral code (?ref=CODE)
    const ref = params.get('ref');
    if (ref) {
      utm.referralCode = ref.trim().toUpperCase();
      hasAny = true;
    }

    if (!hasAny) return; // no marketing params → do nothing

    // First-touch attribution: don't overwrite if already set
    const existing = getStoredUtm();
    if (existing && existing.utm_source) return;

    utm.capturedAt = new Date().toISOString();
    utm.landingPage = window.location.pathname + window.location.search;
    utm.referrerUrl = document.referrer || null;

    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    localStorage.setItem(`${UTM_STORAGE_KEY}_expires`,
        String(Date.now() + UTM_TTL_DAYS * 24 * 60 * 60 * 1000));
  } catch (e) {
    console.warn('UTM capture failed', e);
  }
}

/**
 * Retrieve stored UTM data — returns null if expired.
 * Frontend register form should call this and attach to RegisterRequest.
 */
export function getStoredUtm() {
  try {
    const exp = parseInt(localStorage.getItem(`${UTM_STORAGE_KEY}_expires`) || '0', 10);
    if (exp && Date.now() > exp) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      localStorage.removeItem(`${UTM_STORAGE_KEY}_expires`);
      return null;
    }
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Map stored UTM dict → backend RegisterRequest snake-case field names.
 */
export function buildAttributionPayload() {
  const utm = getStoredUtm() || {};
  return {
    utmSource: utm.utm_source || null,
    utmMedium: utm.utm_medium || null,
    utmCampaign: utm.utm_campaign || null,
    utmTerm: utm.utm_term || null,
    utmContent: utm.utm_content || null,
    referralCode: utm.referralCode || null,
    referrerUrl: utm.referrerUrl || null,
    landingPage: utm.landingPage || null,
  };
}

/**
 * Clear attribution after successful registration (so 2nd user on same device isn't attributed).
 */
export function clearUtm() {
  localStorage.removeItem(UTM_STORAGE_KEY);
  localStorage.removeItem(`${UTM_STORAGE_KEY}_expires`);
}

// ─── Google Analytics 4 ─────────────────────────────────────────────────────

let ga4Loaded = false;

export function initGA4() {
  const measurementId = process.env.REACT_APP_GA4_ID;
  if (!measurementId || ga4Loaded) return;

  // Only load if user accepted cookies
  if (localStorage.getItem(COOKIE_KEY) !== 'accepted') return;

  ga4Loaded = true;

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Init dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: true,
    anonymize_ip: true,
  });

  console.info('[Analytics] GA4 initialized:', measurementId);
}

/** Track a custom event. Safe to call even before GA4 is initialized. */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

/** Track page view (manual when routing changes — call from useEffect on route change). */
export function trackPageView(path) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

// ─── Microsoft Clarity (heatmap, session recording — free) ──────────────────

let clarityLoaded = false;

export function initClarity() {
  const projectId = process.env.REACT_APP_CLARITY_ID;
  if (!projectId || clarityLoaded) return;
  if (localStorage.getItem(COOKIE_KEY) !== 'accepted') return;

  clarityLoaded = true;

  // Official Clarity snippet (async)
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);

  console.info('[Analytics] Clarity initialized:', projectId);
}

/**
 * Initialize all analytics (call once at app startup AND when cookie consent changes).
 */
export function initAnalytics() {
  initGA4();
  initClarity();
}

// Re-init when consent changes
if (typeof window !== 'undefined') {
  window.addEventListener('cookie-consent-changed', (e) => {
    if (e.detail?.value === 'accepted') {
      initAnalytics();
    }
  });
}
