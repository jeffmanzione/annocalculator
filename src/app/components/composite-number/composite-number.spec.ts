import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeZhHans from '@angular/common/locales/zh-Hans';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L10nService } from '../../services/l10n/l10n';
import { Language } from '../../shared/l10n/l10n';
import { CompositeNumber, NumberConstituent } from './composite-number';

// The app registers these in app.ts; specs never import that file.
registerLocaleData(localeDe);
registerLocaleData(localeZhHans);

describe('CompositeNumber', () => {
  let fixture: ComponentFixture<CompositeNumber>;
  const overlayText = () =>
    document
      .querySelector('.cdk-overlay-container .tooltip-container')
      ?.textContent?.replace(/\s+/g, ' ');

  const constituents: NumberConstituent[] = [
    { value: 1, description: 'Base Productivity' },
    { value: 0.3, description: 'Palace Trade Union Bonus' },
    { value: 2, description: 'Tractor Barn', detail: ['because', 'it is big'] },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [CompositeNumber],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(CompositeNumber);
    fixture.componentRef.setInput('constituentValues', constituents);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  const container = () =>
    fixture.nativeElement.querySelector('.container') as HTMLElement;

  it('sums its constituents', () => {
    expect(fixture.componentInstance.value()).toBeCloseTo(3.3);
    expect(container().textContent).toContain('3.3');
  });

  it('is zero with no constituents', () => {
    fixture.componentRef.setInput('constituentValues', []);
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('shows the breakdown tooltip only after hovering for half a second', () => {
    container().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(499);
    expect(overlayText()).toBeUndefined();
    vi.advanceTimersByTime(1);
    const text = overlayText()!;
    expect(text).toContain('Base Productivity');
    expect(text).toContain('Palace Trade Union Bonus');
    expect(text).toContain('Tractor Barn');
  });

  it('renders a constituent detail line only when it has one', () => {
    container().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    const details = document.querySelectorAll('.cdk-overlay-container .detail');
    expect([...details].map((d) => d.textContent!.trim())).toEqual([
      'because it is big',
    ]);
  });

  it('hides the tooltip on mouse leave', () => {
    container().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    expect(overlayText()).toBeDefined();
    container().dispatchEvent(new Event('mouseleave'));
    expect(overlayText()).toBeUndefined();
  });

  it('cancels a pending tooltip when the mouse leaves early', () => {
    container().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(300);
    container().dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(overlayText()).toBeUndefined();
  });

  describe('detail line localization', () => {
    const detail = [
      { value: 8 },
      '×',
      { value: 60, unit: 's' as const },
      '÷',
      '(',
      { value: 18.1818, unit: 's' as const },
      '÷',
      { value: 3.3, isPercent: true },
      ')',
      '=',
      { value: 26.4, unit: '/m' as const },
    ];
    const shownDetail = () => {
      container().dispatchEvent(new Event('mouseenter'));
      vi.advanceTimersByTime(500);
      return document
        .querySelector('.cdk-overlay-container .detail')!
        .textContent!.replace(/\s+/g, ' ')
        .trim();
    };

    beforeEach(() => {
      fixture.componentRef.setInput('constituentValues', [
        { value: 26.4, description: 'Base Production', detail },
      ]);
      fixture.detectChanges();
    });

    it('formats numbers and units for English', () => {
      expect(shownDetail()).toBe('8 × 60s ÷ (18.18s ÷ 330%) = 26.4/m');
    });

    it('uses German number formatting', () => {
      TestBed.inject(L10nService).setLanguage(Language.De);
      fixture.detectChanges();
      expect(shownDetail()).toBe('8 × 60s ÷ (18,18s ÷ 330 %) = 26,4/m');
    });

    it('localizes the units in Chinese', () => {
      TestBed.inject(L10nService).setLanguage(Language.Zh);
      fixture.detectChanges();
      expect(shownDetail()).toBe('8 × 60秒 ÷ (18.18秒 ÷ 330%) = 26.4/分');
    });

    it('re-renders when the language changes while the tooltip is open', () => {
      expect(shownDetail()).toContain('26.4/m');
      TestBed.inject(L10nService).setLanguage(Language.De);
      fixture.detectChanges();
      expect(
        document.querySelector('.cdk-overlay-container .detail')!.textContent,
      ).toContain('26,4/m');
    });
  });
});
