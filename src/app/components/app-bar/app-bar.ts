import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AppInfo, apps, isNotRedirect, WEBSITE_NAME } from '../../app.routes';

@Component({
  selector: 'app-bar',
  imports: [CommonModule, MatButtonModule, MatToolbarModule],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
})
export class AppBar {
  readonly router = inject(Router);
  readonly website = WEBSITE_NAME;
  readonly apps = apps.filter(isNotRedirect);

  isCurrentApp(app: AppInfo): boolean {
    return '/' + app.path == this.router.url;
  }

  navigateTo(app: AppInfo | string): void {
    this.router.navigateByUrl(typeof app === 'string' ? app : app.path);
  }
}
