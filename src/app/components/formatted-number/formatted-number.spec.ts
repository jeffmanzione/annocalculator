import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Language } from '../../shared/l10n/l10n';
import {
  FormatFontSpec,
  FormattedNumber,
  GREEN_RED_FONT_SPEC,
} from './formatted-number';

// The app registers these in app.ts; specs never import that file.
registerLocaleData(localeDe);

describe('FormattedNumber', () => {
  let fixture: ComponentFixture<FormattedNumber>;

  const render = async (
    inputs: Record<string, unknown>,
  ): Promise<HTMLElement> => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };
  const text = (el: HTMLElement) => el.textContent!.replace(/\s+/g, ' ').trim();

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [FormattedNumber],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(FormattedNumber);
  });

  it('shows one decimal place by default, dropping a trailing zero', async () => {
    expect(text(await render({ value: 12.345 }))).toBe('12.3');
    expect(text(await render({ value: 12 }))).toBe('12');
  });

  it('formats percentages with no decimals by default', async () => {
    expect(text(await render({ value: 2.3, isPercent: true }))).toBe('230%');
  });

  it('honors an explicit format', async () => {
    expect(text(await render({ value: 1.23456, format: '1.3-3' }))).toBe(
      '1.235',
    );
  });

  it('adds a plus sign to positive numbers only when asked', async () => {
    expect(text(await render({ value: 5 }))).toBe('5');
    expect(text(await render({ value: 5, showPlusIfPositive: true }))).toBe(
      '+5',
    );
    expect(text(await render({ value: -5, showPlusIfPositive: true }))).toBe(
      '-5',
    );
    expect(text(await render({ value: 0, showPlusIfPositive: true }))).toBe(
      '0',
    );
  });

  it('replaces zero with the override text', async () => {
    expect(
      text(await render({ value: 0, zeroOverride: '-', suffix: '/m' })),
    ).toBe('-');
    expect(
      text(await render({ value: 3, zeroOverride: '-', suffix: '' })),
    ).toBe('3');
  });

  it('appends a suffix', async () => {
    expect(text(await render({ value: 4, suffix: '/m' }))).toBe('4/m');
  });

  it('localizes the suffix and the number format', async () => {
    localStorage.setItem('ANNOCALCULATOR_LANGUAGE', Language.De);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FormattedNumber],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(FormattedNumber);
    expect(text(await render({ value: 1234.5, suffix: '/s' }))).toBe(
      '1.234,5/s',
    );
  });

  describe('font spec', () => {
    const colorOf = async (value: number, spec?: FormatFontSpec) => {
      const el = await render({ value, formatFontSpec: spec });
      return (el.querySelector('div') as HTMLElement).style.color;
    };

    it('applies no color without a spec', async () => {
      expect(await colorOf(5)).toBe('');
    });

    it('picks the positive, negative and default font by sign', async () => {
      expect(await colorOf(5, GREEN_RED_FONT_SPEC)).toBe('rgb(54, 118, 24)');
      expect(await colorOf(-5, GREEN_RED_FONT_SPEC)).toBe('rgb(176, 55, 44)');
      expect(await colorOf(0, GREEN_RED_FONT_SPEC)).toBe('rgba(74, 47, 18, 0.7)');
    });

    it('falls back to the default font when a sign has no entry', async () => {
      const spec: FormatFontSpec = { default: { color: 'rgb(1, 2, 3)' } };
      expect(await colorOf(5, spec)).toBe('rgb(1, 2, 3)');
      expect(await colorOf(-5, spec)).toBe('rgb(1, 2, 3)');
    });
  });
});
