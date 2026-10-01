import { Language, languages, localizations } from './l10n';

describe('localizations', () => {
  const entries = Object.entries(localizations);

  it('has text for every key in every language', () => {
    for (const [key, localization] of entries) {
      for (const language of languages) {
        expect(
          localization[language]?.trim(),
          `${key} (${language})`,
        ).toBeTruthy();
      }
    }
  });

  it('has no leading/trailing whitespace', () => {
    for (const [key, localization] of entries) {
      for (const language of languages) {
        expect(localization[language], `${key} (${language})`).toBe(
          localization[language].trim(),
        );
      }
    }
  });

  it('translates every sentence-length text into every other language', () => {
    // Words and units can legitimately match English ("Boosts", "/m"), but a
    // sentence that is identical to the English text was never translated.
    for (const [key, localization] of entries) {
      if (localization[Language.En].split(' ').length < 5) continue;
      for (const language of languages.filter((l) => l !== Language.En)) {
        expect(localization[language], `${key} (${language})`).not.toBe(
          localization[Language.En],
        );
      }
    }
  });
});
