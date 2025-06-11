import { Routes } from '@angular/router';
import { ProductionCalculatorPage } from './component/production-calculator/production-calculator';
import { HomePage } from './component/home/home';
import { AboutPage } from './component/about/about';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'productionCalculator', component: ProductionCalculatorPage },
  { path: 'about', component: AboutPage },
];
