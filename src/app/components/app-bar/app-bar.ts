import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AppInfo, apps, isNotRedirect, WEBSITE_NAME } from '../../app.routes';
import { L10nText } from '../text/text';
import { MatSelect, MatSelectModule } from '@angular/material/select';
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
    MatSelect,
  ],
  templateUrl: './app-bar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  readonly website = WEBSITE_NAME;
  readonly apps = apps.filter(isNotRedirect);

  private readonly l10Service_ = inject(L10nService);
  readonly language = this.l10Service_.languageSignal;

  updateLanguage(lang: Language): void {
    this.l10Service_.setLanguage(lang);
  }

  isCurrentApp(app: AppInfo): boolean {
    return '/' + app.path == this.router.url;
  }

  navigateTo(app: AppInfo | string): void {
    this.router.navigateByUrl(typeof app === 'string' ? app : app.path);
  }
}
