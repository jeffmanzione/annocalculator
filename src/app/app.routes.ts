import { Route, Routes } from '@angular/router';
import { ProductionCalculatorPage } from './component/production-calculator/production-calculator';
import { AboutPage } from './component/about/about';
import { Type } from '@angular/core';


export const WEBSITE_NAME = 'AnnoCalculator.com';

export interface AppInfo {
  path: string;
  target: Type<any> | string;
  name?: string;
}

export const apps: AppInfo[] = [
  { path: '', target: 'calculator' },
  { path: 'calculator', target: ProductionCalculatorPage, name: 'Calculator' },
  { path: 'about', target: AboutPage, name: 'About' },
];

export const routes: Routes = apps.map(convertToRoute);

function convertToRoute(app: AppInfo): Route {
  if (typeof app.target === 'string') {
    return {
      path: app.path,
      pathMatch: 'full',
      redirectTo: app.target
    };
  }
  return {
    path: app.path,
    component: app.target,
    title: `${WEBSITE_NAME} - ${app.name}`
  };
}

export function isRedirect(app: AppInfo): boolean {
  return typeof app.target === 'string';
}

export function isNotRedirect(app: AppInfo): boolean {
  return typeof app.target !== 'string';
}