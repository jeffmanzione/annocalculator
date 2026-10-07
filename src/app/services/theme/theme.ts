import { effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageManager } from '../local-storage/local-storage';

/** The looks the app can have: Anno 1800's parchment, or Anno 117's marble. */
export type Theme = 'anno1800' | 'anno117';

export const themes: readonly Theme[] = ['anno1800', 'anno117'];

/** Where the choice is kept. index.html reads the same key before the app starts, to avoid a flash of the other look. */
export const THEME_KEY = 'ANNOCALCULATOR_THEME';

const isTheme = (value: unknown): value is Theme =>
  themes.includes(value as Theme);

/** The look the visitor chose, kept in the browser and put on the page as `data-theme` for the styles to follow. */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage_ =
    inject(LocalStorageManager).lookupItem<string>(THEME_KEY);

  readonly themeSignal = signal<Theme>(this.initialTheme_());

  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.themeSignal();
    });
  }

  setTheme(theme: Theme): void {
    this.storage_.set(theme);
    this.themeSignal.set(theme);
  }

  private initialTheme_(): Theme {
    const stored = this.storage_.get();
    return isTheme(stored) ? stored : 'anno1800';
  }
}
