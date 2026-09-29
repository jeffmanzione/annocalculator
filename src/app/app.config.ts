import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// The app runs zoneless (no zone.js dependency) rather than falling back to
// it -- it already relies on OnPush change detection with explicit
// markForCheck() calls throughout, so zoneless is a natural fit and avoids
// pulling zone.js back in as a dependency.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
