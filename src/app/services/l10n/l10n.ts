import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { L10nKey, Language, localizations } from '../../shared/l10n/l10n';
import {
  LocalStorageManager,
  StorageItem,
} from '../local-storage/local-storage';

const LANGUAGE_KEY = 'ANNOCALCULATOR_LANGUAGE';

@Injectable({
  providedIn: 'root',
})
export class L10nService {
  private readonly languageLocalStorage_: StorageItem<Language> =
    inject(LocalStorageManager).lookupItem(LANGUAGE_KEY);

  setLanguage(lang: Language): void {
    this.languageLocalStorage_.set(lang);
    this.languageSignal.update(() => lang);
  }

  readonly languageSignal = signal<Language>(
    this.languageLocalStorage_.get() ?? Language.En,
  );

  readonly localeSignal = computed(() => {
    switch (this.languageSignal()) {
      case Language.En:
        return 'en-US';
      case Language.De:
        return 'de-DE';
      case Language.Nl:
        return 'nl-NL';
      case Language.Zh:
        return 'zh-Hans';
    }
  });

  /** The BCP 47 tag for the current language, e.g. for the page's `lang`. */
  private readonly languageTagSignal_ = computed(() => {
    switch (this.languageSignal()) {
      case Language.En:
        return 'en';
      case Language.De:
        return 'de';
      case Language.Nl:
        return 'nl';
      case Language.Zh:
        return 'zh-Hans';
    }
  });

  constructor() {
    // Keep the document's language in step with the UI language: it drives
    // screen readers, hyphenation and per-language styling (`:lang(zh)`).
    effect(() => {
      document.documentElement.lang = this.languageTagSignal_();
    });
  }

  lookupLocalizedText(key: L10nKey): string {
    const lang = this.languageLocalStorage_.get() ?? Language.En;
    const loc = localizations[key];
    if (!loc) {
      return key;
    }
    const text = loc[lang];
    if (!text) {
      return key;
    }
    return text;
  }
}
