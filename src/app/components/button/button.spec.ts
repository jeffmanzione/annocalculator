import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { L10nService } from '../../services/l10n/l10n';
import { Language } from '../../shared/l10n/l10n';
import { AcButton } from './button';

describe('AcButton', () => {
  let fixture: ComponentFixture<AcButton>;

  const render = async (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AcButton],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(AcButton);
  });

  it('renders a text button', async () => {
    const el = await render({ text: 'Cancel' });
    expect(el.querySelector('button')!.textContent!.trim()).toBe('Cancel');
    expect(el.querySelector('mat-icon')).toBeNull();
  });

  it('renders an icon-only button', async () => {
    const el = await render({ icon: 'delete' });
    expect(el.querySelector('button mat-icon')).not.toBeNull();
    expect(el.querySelector('[textLoc]')).toBeNull();
  });

  it('renders an icon with text', async () => {
    const el = await render({ icon: 'add', text: 'Add Island' });
    const button = el.querySelector('button')!;
    expect(button.querySelector('mat-icon')).not.toBeNull();
    expect(button.textContent).toContain('Add Island');
  });

  it('localizes its text when the language changes', async () => {
    const el = await render({ text: 'Cancel' });
    TestBed.inject(L10nService).setLanguage(Language.De);
    await fixture.whenStable();
    expect(el.querySelector('button')!.textContent!.trim()).toBe('Abbrechen');
  });

  it('emits the action when clicked', async () => {
    const el = await render({ text: 'Cancel' });
    const actions: Event[] = [];
    fixture.componentInstance.action.subscribe((e) => actions.push(e));
    el.querySelector('button')!.click();
    expect(actions.length).toBe(1);
  });

  it('shows a localized tooltip', async () => {
    await render({ icon: 'delete', tooltip: 'Completely clear the inputs.' });
    const tooltip = fixture.debugElement
      .query(By.directive(MatTooltip))
      .injector.get(MatTooltip);
    expect(tooltip.message).toBe('Completely clear the inputs.');
    TestBed.inject(L10nService).setLanguage(Language.De);
    await fixture.whenStable();
    expect(tooltip.message).toBe('Löscht alle Eingaben vollständig.');
  });

  it('has no tooltip directive without a tooltip', async () => {
    await render({ icon: 'delete' });
    expect(fixture.debugElement.query(By.directive(MatTooltip))).toBeNull();
  });

  it('complains when given neither text nor icon', async () => {
    const el = await render({});
    expect(el.textContent).toContain('Invalid button parameters');
  });
});
