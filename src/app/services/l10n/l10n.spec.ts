import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Language } from '../../shared/l10n/l10n';
import { L10nService } from './l10n';

const LANGUAGE_KEY = 'ANNOCALCULATOR_LANGUAGE';

describe('L10nService', () => {
  const create = () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    return TestBed.inject(L10nService);
  };

  beforeEach(() => localStorage.clear());

  it('defaults to English', () => {
    const service = create();
    expect(service.languageSignal()).toBe(Language.En);
    expect(service.lookupLocalizedText('Summary')).toBe('Summary');
  });

  it('starts in the language saved in local storage', () => {
    localStorage.setItem(LANGUAGE_KEY, Language.De);
    const service = create();
    expect(service.languageSignal()).toBe(Language.De);
    expect(service.lookupLocalizedText('Summary')).toBe('Zusammenfassung');
  });

  it('switches language, updates the signal and persists the choice', () => {
    const service = create();
    service.setLanguage(Language.Nl);
    expect(service.languageSignal()).toBe(Language.Nl);
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe(Language.Nl);
    expect(service.lookupLocalizedText('Summary')).toBe('Samenvatting');
    service.setLanguage(Language.Zh);
    expect(service.lookupLocalizedText('Summary')).toBe('汇总');
  });

  it('maps each language to a locale', () => {
    const service = create();
    const locales = [Language.En, Language.De, Language.Nl, Language.Zh].map(
      (language) => {
        service.setLanguage(language);
        return service.localeSignal();
      },
    );
    expect(locales).toEqual(['en-US', 'de-DE', 'nl-NL', 'zh-Hans']);
  });

  it('falls back to the key for text it has no localization for', () => {
    const service = create();
    service.setLanguage(Language.De);
    expect(service.lookupLocalizedText('Alpaca Wool' as never)).toBe(
      'Alpaca Wool',
    );
  });

  it('keeps the document language in step with the UI language', () => {
    const service = create();
    TestBed.tick();
    expect(document.documentElement.lang).toBe('en');
    for (const [language, tag] of [
      [Language.De, 'de'],
      [Language.Nl, 'nl'],
      [Language.Zh, 'zh-Hans'],
    ] as const) {
      service.setLanguage(language);
      TestBed.tick();
      expect(document.documentElement.lang).toBe(tag);
    }
  });
});
