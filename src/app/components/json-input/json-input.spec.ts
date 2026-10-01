import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonInput } from './json-input';

describe('JsonInput', () => {
  let fixture: ComponentFixture<JsonInput<{ a: number; list: string[] }>>;

  const textArea = () =>
    fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const edit = async (text: string) => {
    textArea().value = text;
    textArea().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [JsonInput],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(JsonInput<{ a: number; list: string[] }>);
    fixture.componentRef.setInput('value', { a: 1, list: ['x'] });
    await fixture.whenStable();
  });

  it('shows the value as indented JSON', () => {
    expect(textArea().value).toBe(
      JSON.stringify({ a: 1, list: ['x'] }, null, 2),
    );
  });

  it('updates its value from valid edited JSON', async () => {
    await edit('{"a": 2, "list": []}');
    expect(fixture.componentInstance.value()).toEqual({ a: 2, list: [] });
    expect(fixture.nativeElement.textContent).toBe('');
  });

  it('keeps the old value and shows the error for invalid JSON', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await edit('{"a": ');
    expect(fixture.componentInstance.value()).toEqual({ a: 1, list: ['x'] });
    expect(fixture.componentInstance.errorMessage).not.toBe('');
    expect(fixture.nativeElement.textContent).toContain(
      fixture.componentInstance.errorMessage,
    );
    error.mockRestore();
  });

  it('clears the error once the JSON is valid again', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await edit('nope');
    expect(fixture.componentInstance.errorMessage).not.toBe('');
    await edit('{"a": 3, "list": ["y"]}');
    expect(fixture.componentInstance.errorMessage).toBe('');
    expect(fixture.componentInstance.value()).toEqual({ a: 3, list: ['y'] });
    error.mockRestore();
  });
});
