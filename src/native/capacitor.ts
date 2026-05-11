import { Capacitor } from '@capacitor/core';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

export const isNative = Capacitor.isNativePlatform();

const SITE_HOSTS = ['ruckus.goodertechs.com', 'ruckus.pages.dev'];
const PRODUCTION_URL = 'https://ruckus.goodertechs.com';

/**
 * Origin to use for outbound links (email redirects, share URLs). On native
 * `window.location.origin` is `capacitor://localhost` / `https://localhost`,
 * which won't route back to the app — return the production host instead.
 */
export function siteUrl(): string {
  return isNative ? PRODUCTION_URL : window.location.origin;
}

/**
 * Configures status bar + listens for deep link openings. Call once at boot,
 * before React mounts. No-ops on web.
 */
export async function initNative() {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('StatusBar config failed', err);
  }

  // Universal Links / App Links → push the path into React Router.
  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    try {
      const url = new URL(event.url);
      if (!SITE_HOSTS.includes(url.host)) return;
      const path = `${url.pathname}${url.search}${url.hash}` || '/';
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      console.warn('Bad deep link', event.url, err);
    }
  });

  // Android hardware back: only collapse the app at root, otherwise let the
  // WebView walk its own history stack.
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

/** Light tactile feedback. Silent on web. */
export async function tapHaptic() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* unsupported on this device */
  }
}

/**
 * Native share sheet on iOS/Android, navigator.share() on web (which
 * pops the OS sheet on most mobile browsers), or a clipboard fallback.
 */
export async function shareNative(opts: { title: string; text?: string; url: string }) {
  if (isNative) {
    try {
      await Share.share(opts);
      return true;
    } catch (err) {
      console.warn('Share failed', err);
      return false;
    }
  }
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share(opts);
      return true;
    } catch {
      return false;
    }
  }
  if (nav.clipboard) {
    await nav.clipboard.writeText(opts.url);
    return true;
  }
  return false;
}
