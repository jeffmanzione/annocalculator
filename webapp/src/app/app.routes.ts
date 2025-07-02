import { Routes } from '@angular/router';
import { ProductionCalculatorPage } from './component/production-calculator/production-calculator';
import { AboutPage } from './component/about/about';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productionCalculator' },
  { path: 'productionCalculator', component: ProductionCalculatorPage },
  { path: 'about', component: AboutPage },
];
