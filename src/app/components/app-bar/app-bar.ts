import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppInfo, apps, isNotRedirect, WEBSITE_NAME } from '../../app.routes';
import { L10nText } from '../text/text';
import { MatSelectModule } from '@angular/material/select';
import { Language, languages } from '../../shared/l10n/l10n';
import { L10nService } from '../../services/l10n/l10n';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@Component({
  selector: 'app-bar',
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatSelectModule,
    L10nText,
  ],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
})
export class AppBar {
  readonly langauges = languages;
  readonly router = inject(Router);

  // router.url isn't reactive: without this, the bar would not re-render once a
  // navigation finishes (the app is zoneless) and the current tab would never
  // show as selected.
  private readonly currentUrl_ = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly website = WEBSITE_NAME;
  readonly apps = apps.filter(isNotRedirect);

  private readonly l10Service_ = inject(L10nService);
  readonly language = this.l10Service_.languageSignal;

  updateLanguage(lang: Language): void {
    this.l10Service_.setLanguage(lang);
  }

  isCurrentApp(app: AppInfo): boolean {
    return '/' + app.path == this.currentUrl_();
  }

  navigateTo(app: AppInfo | string): void {
    this.router.navigateByUrl(typeof app === 'string' ? app : app.path);
  }

  langDisplayName(lang: Language): string {
    if (lang === Language.Zh) return '中文';
    return lang;
  }
}
