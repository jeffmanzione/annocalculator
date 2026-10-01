import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Good, Region } from '../../../shared/game/enums';
import { GoodSummaryCell, GoodSummaryRow } from './summary-panel-store';
import { SummaryWarning } from './summary-warning';

const island = (id: number, name: string) => ({
  id,
  name,
  region: Region.OldWorld,
  productionLines: [],
});

const cell = (
  id: number,
  name: string,
  produced: number,
  consumed: number,
): GoodSummaryCell => ({
  island: island(id, name),
  good: Good.Grain,
  localProductionPerMin: produced,
  localConsumptionPerMin: consumed,
  importedPerMin: 0,
  exportedPerMin: 0,
});

const row: GoodSummaryRow = {
  good: Good.Grain,
  totalProductionPerMin: 5,
  netProductionPerMin: 1,
  islandSummaries: [cell(1, 'Farm Island', 5, 0), cell(2, 'Mill Island', 0, 4)],
  showIslandSummary: false,
  showIslandSummaryIcon: 'arrow_drop_down',
  hasIssue: true,
};

describe('SummaryWarning', () => {
  let fixture: ComponentFixture<SummaryWarning>;
  const tooltip = () =>
    document.querySelector(
      '.cdk-overlay-container .tooltip-container',
    ) as HTMLElement | null;
  const trigger = () =>
    fixture.nativeElement.querySelector('.warning-format') as HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [SummaryWarning],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(SummaryWarning);
    fixture.componentRef.setInput('row', row);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('shows the net production with a warning icon', () => {
    expect(trigger().textContent).toContain('1/m');
    expect(trigger().querySelector('mat-icon')).not.toBeNull();
  });

  it('explains the issue after hovering for half a second', () => {
    trigger().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(499);
    expect(tooltip()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(tooltip()!.textContent).toContain('no trade route covers');
  });

  it('lists each island with its net production', () => {
    trigger().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    const rows = [...tooltip()!.querySelectorAll('tr')].map((tr) =>
      [...tr.querySelectorAll('th, td')].map((c) => c.textContent!.trim()),
    );
    expect(rows).toEqual([
      ['Island', 'Production (Net)'],
      ['Farm Island', '5/m'],
      ['Mill Island', '-4/m'],
    ]);
  });

  it('colors surplus green and deficit red', () => {
    trigger().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    const numbers = [
      ...tooltip()!.querySelectorAll('formatted-number div'),
    ] as HTMLElement[];
    expect(numbers[0].style.color).toBe('rgb(0, 185, 56)');
    expect(numbers[1].style.color).toBe('rgb(217, 48, 37)');
  });

  it('hides on mouse leave and cancels a pending show', () => {
    trigger().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    trigger().dispatchEvent(new Event('mouseleave'));
    expect(tooltip()).toBeNull();
    trigger().dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(300);
    trigger().dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(tooltip()).toBeNull();
  });
});
