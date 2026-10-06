import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { L10nService } from '../../../services/l10n/l10n';
import { Language } from '../../../shared/l10n/l10n';
import { SaveData, SaveDialog } from './save-dialog';

describe('SaveDialog', () => {
  const setup = async (data: SaveData<{ n: number }> = { obj: { n: 1 } }) => {
    localStorage.clear();
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [SaveDialog],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(SaveDialog<{ n: number }>);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, close };
  };

  it('shows the title, instructions and the current JSON', async () => {
    const { el } = await setup();
    expect(el.querySelector('h2')!.textContent!.trim()).toBe(
      'Manual JSON Input',
    );
    expect(el.querySelector('h3')!.textContent).toContain(
      'Paste or edit the calculator input JSON',
    );
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe(
      JSON.stringify({ n: 1 }, null, 2),
    );
  });

  it('has Cancel and Apply Changes buttons', async () => {
    const { el } = await setup();
    const buttons = [...el.querySelectorAll('button')].map((b) =>
      b.textContent!.trim(),
    );
    expect(buttons).toEqual(['Cancel', 'Apply Changes']);
  });

  it('localizes its title and instructions', async () => {
    const { fixture, el } = await setup();
    TestBed.inject(L10nService).setLanguage(Language.De);
    await fixture.whenStable();
    expect(el.querySelector('h2')!.textContent!.trim()).toBe(
      'Manuelle JSON-Eingabe',
    );
    expect(el.querySelector('h3')!.textContent).toContain(
      'Füge hier das Eingabe-JSON',
    );
    expect(
      [...el.querySelectorAll('button')].map((b) => b.textContent!.trim()),
    ).toEqual(['Abbrechen', 'Änderungen übernehmen']);
  });

  it('applies edited JSON to the dialog result', async () => {
    const { fixture, el } = await setup();
    const textArea = el.querySelector('textarea') as HTMLTextAreaElement;
    textArea.value = '{"n": 7}';
    textArea.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.obj()).toEqual({ n: 7 });
  });

  it('ignores invalid JSON', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fixture, el } = await setup();
    const textArea = el.querySelector('textarea') as HTMLTextAreaElement;
    textArea.value = '{oops';
    textArea.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.obj()).toEqual({ n: 1 });
    error.mockRestore();
  });
});
