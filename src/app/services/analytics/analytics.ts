import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Anonymous visit counting with GoatCounter (https://www.goatcounter.com): page
 * views and the visitor's country, with no cookies and no personal data. The
 * counts are on the dashboard at https://<GOATCOUNTER_CODE>.goatcounter.com.
 */
export const GOATCOUNTER_CODE = 'annocalculator';
const GOATCOUNTER_SCRIPT_URL = 'https://gc.zgo.at/count.js';
const TRACKED_HOST = 'annocalculator.com';

/** The slice of `window` and `navigator` the tracker uses (so tests can fake it). */
export interface TrackerEnvironment {
  location: { hostname: string };
  navigator: { doNotTrack?: string | null; globalPrivacyControl?: boolean };
  document: Document;
  goatcounter?: GoatCounter;
}

interface GoatCounter {
  no_onload?: boolean;
  endpoint?: string;
  count?: (vars?: { path?: string; title?: string }) => void;
}

/**
 * Only the live site counts visits: not local development, previews, or the
 * automated browser checks. Visitors who send Do Not Track or Global Privacy
 * Control are not counted either.
 */
export function shouldTrack(env: Pick<TrackerEnvironment, 'location' | 'navigator'>): boolean {
  const host = env.location.hostname;
  if (host !== TRACKED_HOST && host !== `www.${TRACKED_HOST}`) return false;
  const dnt = env.navigator.doNotTrack;
  if (dnt === '1' || dnt === 'yes') return false;
  return env.navigator.globalPrivacyControl !== true;
}

@Injectable({ providedIn: 'root' })
export class Analytics {
  private readonly router_ = inject(Router);
  private loaded_ = false;
  private pendingPath_: string | undefined;

  /** Loads the counter and reports each page the visitor navigates to. */
  start(env: TrackerEnvironment = globalThis as unknown as TrackerEnvironment): void {
    if (!shouldTrack(env)) return;

    // The app changes pages without reloading, so the counter must not count on
    // load by itself; every page is reported from the router instead.
    env.goatcounter = {
      no_onload: true,
      endpoint: `https://${GOATCOUNTER_CODE}.goatcounter.com/count`,
    };
    const script = env.document.createElement('script');
    script.async = true;
    script.src = GOATCOUNTER_SCRIPT_URL;
    script.onload = () => {
      this.loaded_ = true;
      if (this.pendingPath_ !== undefined) this.count_(env, this.pendingPath_);
    };
    env.document.head.appendChild(script);

    this.router_.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      if (this.loaded_) {
        this.count_(env, event.urlAfterRedirects);
      } else {
        this.pendingPath_ = event.urlAfterRedirects; // counted once the script has loaded
      }
    });
  }

  private count_(env: TrackerEnvironment, path: string): void {
    env.goatcounter?.count?.({ path });
  }
}
