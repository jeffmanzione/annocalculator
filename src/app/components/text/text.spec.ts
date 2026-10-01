import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { L10nService } from '../../services/l10n/l10n';
import { Language, L10nKey } from '../../shared/l10n/l10n';
import { L10nText } from './text';

@Component({
  imports: [L10nText],
  template: `
    <span [textLoc]="key()"></span>
  `,
})
class Host {
  readonly key = signal<L10nKey>('Summary');
}

describe('L10nText', () => {
  const setup = () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(Host);
    return {
      fixture,
      service: TestBed.inject(L10nService),
      el: fixture.nativeElement as HTMLElement,
    };
  };

  it('shows the English text by default', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    expect(el.textContent).toBe('Summary');
  });

  it('re-localizes when the language changes', async () => {
    const { fixture, service, el } = setup();
    await fixture.whenStable();
    service.setLanguage(Language.De);
    await fixture.whenStable();
    expect(el.textContent).toBe('Zusammenfassung');
    service.setLanguage(Language.Zh);
    await fixture.whenStable();
    expect(el.textContent).toBe('汇总');
  });

  it('follows its key input', async () => {
    const { fixture, el } = setup();
    fixture.componentInstance.key.set('Trade Routes');
    await fixture.whenStable();
    expect(el.textContent).toBe('Trade Routes');
  });

  it('shows the key itself when there is no localization', async () => {
    const { fixture, el } = setup();
    fixture.componentInstance.key.set('Alpaca Wool' as L10nKey);
    await fixture.whenStable();
    expect(el.textContent).toBe('Alpaca Wool');
  });
});
