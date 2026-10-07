import { Route, Routes } from '@angular/router';
import { Type } from '@angular/core';
import { AboutPage } from './pages/about/about';
import {
  WORLD_KEY_1800,
  WORLD_KEY_117,
} from './services/local-storage/world-keys';
import { L10nKey } from './shared/l10n/l10n';

export const WEBSITE_NAME = 'AnnoCalculator.com';

export interface AppInfo {
  path: string;
  /** The page. */
  target?: Type<any>;
  /** Loads the page's code only when someone opens it, keeping it out of the first download. */
  loadTarget?: () => Promise<Type<any>>;
  /** For an address that is not a page: the path to go to instead (or a function that picks it). */
  redirectTo?: string | (() => string);
  name?: L10nKey;
}

const hasSavedWorld = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

/**
 * Where an address that is not a page (the old /calculator, or one that does not exist) leads: the Anno 117
 * calculator, the newest game, unless this visitor has only ever used the Anno 1800 one (they have a saved
 * Anno 1800 world and no Anno 117 one), who is taken back to it.
 */
export function defaultCalculator(): string {
  return hasSavedWorld(WORLD_KEY_1800) && !hasSavedWorld(WORLD_KEY_117)
    ? 'anno-1800-calculator'
    : 'anno-117-calculator';
}

export const apps: AppInfo[] = [
  // Newest game first.
  {
    path: 'anno-117-calculator',
    loadTarget: () =>
      import('./games/anno117/anno117-page').then((m) => m.Anno117Page),
    name: 'Anno 117',
  },
  {
    path: 'anno-1800-calculator',
    loadTarget: () =>
      import('./games/anno1800/anno1800-page').then((m) => m.Anno1800Page),
    name: 'Anno 1800',
  },
  { path: 'about', target: AboutPage, name: 'About' },
  // The Anno 1800 calculator used to live at /calculator: people have links to it.
  { path: 'calculator', redirectTo: defaultCalculator },
  { path: '**', redirectTo: defaultCalculator },
];

export const routes: Routes = apps.map(convertToRoute);

function convertToRoute(app: AppInfo): Route {
  if (app.redirectTo !== undefined) {
    return {
      path: app.path,
      pathMatch: 'full',
      redirectTo: app.redirectTo,
    };
  }
  if (app.loadTarget) {
    return {
      path: app.path,
      loadComponent: app.loadTarget,
      title: `${WEBSITE_NAME} - ${app.name}`,
    };
  }
  return {
    path: app.path,
    component: app.target as Type<any>,
    title: `${WEBSITE_NAME} - ${app.name}`,
  };
}

export function isNotRedirect(app: AppInfo): boolean {
  return app.redirectTo === undefined;
}
