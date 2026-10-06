import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { L10nService } from '../../services/l10n/l10n';
import { Language } from '../../shared/l10n/l10n';
import { AboutPage } from './about';

describe('AboutPage', () => {
  const setup = async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AboutPage);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('has the eight sections, each with a heading', async () => {
    const { el } = await setup();
    expect(
      [...el.querySelectorAll('h2')].map((h) =>
        h.textContent!.trim().replace(/^\S+\s+/, ''),
      ),
    ).toEqual([
      'About This Tool',
      'What This Tool Does',
      'Why It Exists',
      'Save Your Work',
      'Credits',
      'Privacy',
      'Feedback',
    ]);
    expect(el.textContent).toContain('GoatCounter');
    expect(el.querySelector('.disclaimer')!.textContent).toContain(
      'not affiliated with',
    );
  });

  it('lists the features', async () => {
    const { el } = await setup();
    expect(el.querySelectorAll('li').length).toBe(8);
  });

  it('keeps a space between the disclaimer label and its text', async () => {
    const { el } = await setup();
    expect(el.querySelector('.disclaimer')!.textContent).toMatch(
      /Disclaimer: This is a fan-made/,
    );
  });

  it('links to the GitHub issue tracker with spaces around the link', async () => {
    const { el } = await setup();
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe(
      'https://github.com/jeffmanzione/annocalculator/issues/new',
    );
    expect(link.textContent).toBe('Create an issue');
    expect(link.parentElement!.textContent).toMatch(
      /feature\? Create an issue on GitHub\./,
    );
  });

  it('is fully translated, not just the headings', async () => {
    const { fixture, el } = await setup();
    const english = el.textContent!;
    for (const language of [Language.De, Language.Nl, Language.Zh]) {
      TestBed.inject(L10nService).setLanguage(language);
      await fixture.whenStable();
      const translated = el.textContent!;
      expect(translated, language).not.toBe(english);
      // A leftover English sentence would mean a missed key.
      expect(translated, language).not.toContain('This calculator is designed');
      expect(translated, language).not.toContain('Hopefully it will');
    }
  });
});
