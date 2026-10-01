import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompositeNumber, NumberConstituent } from './composite-number';

describe('CompositeNumber', () => {
  let fixture: ComponentFixture<CompositeNumber>;
  const overlayText = () =>
    document
      .querySelector('.cdk-overlay-container .tooltip-container')
      ?.textContent?.replace(/\s+/g, ' ');

  const constituents: NumberConstituent[] = [
    { value: 1, description: 'Base Productivity' },
    { value: 0.3, description: 'Palace Trade Union Bonus' },
    { value: 2, description: 'Tractor Barn', detail: 'because it is big' },
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
});
