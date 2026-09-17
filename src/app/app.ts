import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBar } from './components/app-bar/app-bar';

import localeDe from '@angular/common/locales/de';
import localeNl from '@angular/common/locales/nl';
import localeZhHans from '@angular/common/locales/zh-Hans';
import { registerLocaleData } from '@angular/common';

const WWW_PREFIX = 'www.';

registerLocaleData(localeDe);
registerLocaleData(localeNl);
registerLocaleData(localeZhHans);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppBar],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  ngOnInit(): void {
    // Strip 'www.' from the URL. This is a personal preference of mine.
    const location = globalThis.location;
    if (location.hostname.startsWith(WWW_PREFIX)) {
      location.hostname = location.hostname.slice(WWW_PREFIX.length);
    }
  }
}
