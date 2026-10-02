import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L10nService } from '../../services/l10n/l10n';
import { Language } from '../../shared/l10n/l10n';
import { EnumRow } from './enum-row';

describe('EnumRow', () => {
  let fixture: ComponentFixture<EnumRow<string>>;
  const el = () => fixture.nativeElement as HTMLElement;

  const render = async (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [EnumRow],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(EnumRow<string>);
  });

  afterEach(() => vi.useRealTimers());

  it('shows the placeholder when there are no values', async () => {
    await render({ values: [] });
    expect(el().textContent!.trim()).toBe('None');
  });

  it('localizes the placeholder', async () => {
    await render({ values: [] });
    TestBed.inject(L10nService).setLanguage(Language.De);
    await fixture.whenStable();
    expect(el().textContent!.trim()).toBe('Keine');
  });

  it('shows a custom placeholder as given when it has no localization', async () => {
    await render({ values: [], placeholderText: '-' });
    expect(el().textContent!.trim()).toBe('-');
  });

  it('shows a single value as text, localizing it when it has a localization', async () => {
    await render({ values: ['Bakery'] });
    expect(el().textContent!.trim()).toBe('Bakery');
    await render({ values: ['None'] });
    TestBed.inject(L10nService).setLanguage(Language.Nl);
    await fixture.whenStable();
    expect(el().textContent!.trim()).toBe('Geen');
  });

  it('applies the display text transformer', async () => {
    await render({
      values: ['Bakery'],
      displayTextTransformer: (v: string | null) => `<${v}>`,
    });
    expect(el().textContent!.trim()).toBe('<Bakery>');
  });

  it('shows only icons, no text, for several values', async () => {
    await render({
      values: ['a', 'b'],
      iconUrlLookupFn: (v: string | null) => `/icons/${v}.png`,
    });
    const imgs = [...el().querySelectorAll('img')].map((i) =>
      i.getAttribute('src'),
    );
    expect(imgs).toEqual(['/icons/a.png', '/icons/b.png']);
    expect(el().querySelector('.item-text-container')).toBeNull();
  });

  describe('glow', () => {
    const imgs = () => [...el().querySelectorAll('img')] as HTMLImageElement[];
    const lookup = (v: string | null) => `/icons/${v}.png`;

    it('puts no glow on any icon by default', async () => {
      await render({ values: ['a', 'b'], iconUrlLookupFn: lookup });
      expect(imgs().map((i) => i.classList.contains('glow'))).toEqual([
        false,
        false,
      ]);
    });

    it('puts a glow only on the values the callback selects', async () => {
      await render({
        values: ['a', 'b', 'c'],
        iconUrlLookupFn: lookup,
        iconGlowFn: (v: string | null) => v === 'b',
      });
      expect(imgs().map((i) => i.classList.contains('glow'))).toEqual([
        false,
        true,
        false,
      ]);
    });

    it('works for a single value shown with its name too', async () => {
      await render({
        values: ['a'],
        iconUrlLookupFn: lookup,
        iconGlowFn: () => true,
      });
      expect(imgs()[0].classList.contains('glow')).toBe(true);
      expect(el().textContent!.trim()).toBe('a');
    });
  });

  describe('tooltip state', () => {
    const shown = () =>
      fixture.componentInstance.showValues().map((v) => v.shouldShowOverlay);

    beforeEach(async () => {
      await render({ values: ['a', 'b'] });
      // Fake timers only after rendering: they stall Angular's stability checks.
      vi.useFakeTimers();
    });

    it('shows a value tooltip only after hovering for half a second', () => {
      fixture.componentInstance.showTooltipAt(0);
      vi.advanceTimersByTime(499);
      expect(shown()).toEqual([false, false]);
      vi.advanceTimersByTime(1);
      expect(shown()).toEqual([true, false]);
    });

    it('hides a value tooltip and cancels a pending one', () => {
      fixture.componentInstance.showTooltipAt(1);
      fixture.componentInstance.hideTooltipAt(1);
      vi.advanceTimersByTime(1000);
      expect(shown()).toEqual([false, false]);
    });

    it('hideAllTooltips hides every open tooltip', () => {
      fixture.componentInstance.showValues()[0].shouldShowOverlay = true;
      fixture.componentInstance.showValues()[1].shouldShowOverlay = true;
      fixture.componentInstance.hideAllTooltips();
      expect(shown()).toEqual([false, false]);
    });

    it('hideAllTooltips cancels a tooltip that is still waiting to appear', () => {
      // The dropdown can close within the 500ms hover delay.
      fixture.componentInstance.showTooltipAt(0);
      fixture.componentInstance.hideAllTooltips();
      vi.advanceTimersByTime(1000);
      expect(shown()).toEqual([false, false]);
    });
  });
});
