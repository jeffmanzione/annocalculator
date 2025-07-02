import { Routes } from '@angular/router';
import { ProductionCalculatorPage } from './component/production-calculator/production-calculator';
import { AboutPage } from './component/about/about';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'production-calculator' },
  { path: 'production-calculator', component: ProductionCalculatorPage },
  { path: 'about', component: AboutPage },
];
