import { Route, Routes } from '@angular/router';
import { Type } from '@angular/core';
import { AboutPage } from './pages/about/about';
import { L10nKey } from './shared/l10n/l10n';

export const WEBSITE_NAME = 'AnnoCalculator.com';

export interface AppInfo {
  path: string;
  /** The page, or the path to redirect to when this is a string. */
  target?: Type<any> | string;
  /** Loads the page's code only when someone opens it, keeping it out of the first download. */
  loadTarget?: () => Promise<Type<any>>;
  name?: L10nKey;
}

export const apps: AppInfo[] = [
  {
    path: 'anno-1800-calculator',
    loadTarget: () =>
      import('./games/anno1800/anno1800-page').then((m) => m.Anno1800Page),
    name: 'Anno 1800',
  },
  {
    path: 'anno-117-calculator',
    loadTarget: () =>
      import('./games/anno117/anno117-page').then((m) => m.Anno117Page),
    name: 'Anno 117',
  },
  { path: 'about', target: AboutPage, name: 'About' },
  // The Anno 1800 calculator used to live at /calculator: people have links to it.
  { path: 'calculator', target: 'anno-1800-calculator' },
  { path: '**', target: 'anno-1800-calculator' },
];

export const routes: Routes = apps.map(convertToRoute);

function convertToRoute(app: AppInfo): Route {
  if (typeof app.target === 'string') {
    return {
      path: app.path,
      pathMatch: 'full',
      redirectTo: app.target,
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

export function isRedirect(app: AppInfo): boolean {
  return typeof app.target === 'string';
}

export function isNotRedirect(app: AppInfo): boolean {
  return typeof app.target !== 'string';
}
