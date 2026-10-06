export const CONSENT_KEY = "teramis-consent";
export const CONSENT_CHANGED = "teramis:consent-changed";
let storageWriteFailed = false;

export function hasAnalyticsConsent(): boolean {
  try {
    return !storageWriteFailed && typeof window !== "undefined" &&
      window.localStorage.getItem(CONSENT_KEY) === "all";
  } catch {
    return false;
  }
}

export function setCookieConsent(value: "all" | "essential"): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    storageWriteFailed = false;
  } catch {
    // A failed opt-out must not leave a previously saved opt-in active.
    storageWriteFailed = true;
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

// The SDK retains its callback after unmounting. Read the current choice for
// every event so revocation also blocks events already queued by the SDK.
export function filterAnalyticsEvent<T>(event: T): T | null {
  return hasAnalyticsConsent() ? event : null;
}
