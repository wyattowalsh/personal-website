"use client";

// ---------- Types ----------

interface NavigatorExtended extends Navigator {
  connection?: { effectiveType?: string; downlink?: number };
  deviceMemory?: number;
  pdfViewerEnabled: boolean;
}

export interface DeviceContext {
  // Screen
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  colorDepth: number;
  touchPoints: number;

  // Browser & OS
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;

  // Connection
  connectionType: string | null;
  connectionDownlink: number | null;

  // Hardware
  hardwareConcurrency: number;
  deviceMemory: number | null;

  // Viewport
  viewportWidth: number;
  viewportHeight: number;
  orientation: string;

  // Timezone & locale
  timezone: string;
  timezoneOffset: number;

  // GPU
  webglRenderer: string | null;
  webglVendor: string | null;

  // Misc
  pdfViewerEnabled: boolean;
}

export interface VisitorInfo {
  visitorId: string;
  isReturning: boolean;
  visitCount: number;
  firstSeen: string; // ISO date
  daysSinceFirstVisit: number;
}

// ---------- Caches ----------

let cachedContext: DeviceContext | null = null;
let cachedFingerprint: string | null = null;

// ---------- Device context ----------

function getWebGLInfo(): { renderer: string | null; vendor: string | null } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return { renderer: null, vendor: null };
    const ext = (gl as WebGLRenderingContext).getExtension(
      'WEBGL_debug_renderer_info'
    );
    if (!ext) return { renderer: null, vendor: null };
    return {
      renderer: (gl as WebGLRenderingContext).getParameter(
        ext.UNMASKED_RENDERER_WEBGL
      ) as string,
      vendor: (gl as WebGLRenderingContext).getParameter(
        ext.UNMASKED_VENDOR_WEBGL
      ) as string,
    };
  } catch {
    return { renderer: null, vendor: null };
  }
}

export function getDeviceContext(): DeviceContext {
  if (cachedContext) return cachedContext;

  const nav = navigator as NavigatorExtended;
  const conn = nav.connection;

  const webgl = getWebGLInfo();

  cachedContext = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    touchPoints: navigator.maxTouchPoints,

    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: [...navigator.languages],
    cookieEnabled: navigator.cookieEnabled,

    connectionType: conn?.effectiveType ?? null,
    connectionDownlink: conn?.downlink ?? null,

    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: nav.deviceMemory ?? null,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    orientation:
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    webglRenderer: webgl.renderer,
    webglVendor: webgl.vendor,

    pdfViewerEnabled: nav.pdfViewerEnabled ?? false,
  };

  return cachedContext;
}

/** Trimmed version suitable for Vercel Analytics property limits. */
export function getDeviceContextSlim(): Record<string, string | number | boolean> {
  const ctx = getDeviceContext();
  return {
    screen: `${ctx.screenWidth}x${ctx.screenHeight}`,
    dpr: ctx.devicePixelRatio,
    viewport: `${ctx.viewportWidth}x${ctx.viewportHeight}`,
    orientation: ctx.orientation,
    language: ctx.language,
    timezone: ctx.timezone,
    touchPoints: ctx.touchPoints,
    cores: ctx.hardwareConcurrency,
    connection: ctx.connectionType ?? 'unknown',
    platform: ctx.platform,
  };
}

// ---------- Visitor ID ----------

const VISITOR_ID_KEY = 'analytics_visitor_id';

export function getVisitorId(): string {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const stored = localStorage.getItem(VISITOR_ID_KEY);
    if (stored) {
      cachedFingerprint = stored;
      return stored;
    }
  } catch {
    /* localStorage unavailable */
  }

  cachedFingerprint = crypto.randomUUID();

  try {
    localStorage.setItem(VISITOR_ID_KEY, cachedFingerprint);
  } catch {
    /* localStorage unavailable */
  }

  return cachedFingerprint;
}

// ---------- Returning visitor detection ----------

const VISITOR_STORAGE_PREFIX = 'v_';

export function getVisitorInfo(visitorId: string): VisitorInfo {
  const storageKey = `${VISITOR_STORAGE_PREFIX}${visitorId}`;
  const now = new Date();

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const data = JSON.parse(raw) as {
        firstSeen: string;
        visitCount: number;
        lastSession: string;
      };

      // Validate parsed dates — corrupted data resets to first-visit
      const firstSeenTime = new Date(data.firstSeen).getTime();
      const lastSessionTime = new Date(data.lastSession).getTime();
      if (
        !Number.isFinite(firstSeenTime) ||
        !Number.isFinite(lastSessionTime) ||
        typeof data.visitCount !== 'number' ||
        !Number.isFinite(data.visitCount)
      ) {
        localStorage.removeItem(storageKey);
        // Fall through to first-visit initialization below
      } else {

      // Only increment if last session was > 30 minutes ago
      const lastSession = new Date(data.lastSession);
      const minutesSinceLastSession =
        (now.getTime() - lastSession.getTime()) / 60_000;
      const isNewSession = minutesSinceLastSession > 30;

      const visitCount = isNewSession
        ? data.visitCount + 1
        : data.visitCount;

      // Persist updated data
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          firstSeen: data.firstSeen,
          visitCount,
          lastSession: now.toISOString(),
        })
      );

      const firstSeen = new Date(data.firstSeen);
      const daysSinceFirstVisit = Math.floor(
        (now.getTime() - firstSeen.getTime()) / 86_400_000
      );

      return {
        visitorId,
        isReturning: true,
        visitCount,
        firstSeen: data.firstSeen,
        daysSinceFirstVisit,
      };
    } // end else (valid data)
    } // end if (raw)
  } catch {
    // localStorage unavailable
  }

  // First visit — store initial data
  const firstSeen = now.toISOString();
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ firstSeen, visitCount: 1, lastSession: firstSeen })
    );
  } catch {
    // localStorage unavailable
  }

  return {
    visitorId,
    isReturning: false,
    visitCount: 1,
    firstSeen,
    daysSinceFirstVisit: 0,
  };
}

// ---------- Session ID ----------

let sessionId: string | null = null;

export function getSessionId(): string {
  if (sessionId) return sessionId;

  // Use sessionStorage so it's per-tab
  try {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) {
      sessionId = stored;
      return stored;
    }
  } catch {
    // sessionStorage unavailable
  }

  sessionId = crypto.randomUUID();

  try {
    sessionStorage.setItem('analytics_session_id', sessionId);
  } catch {
    // sessionStorage unavailable
  }

  return sessionId;
}
