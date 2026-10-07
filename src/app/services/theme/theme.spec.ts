import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_KEY, ThemeService } from './theme';

const create = () => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  return TestBed.inject(ThemeService);
};

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  it('starts on the Anno 117 theme', async () => {
    const service = create();
    TestBed.tick();
    expect(service.themeSignal()).toBe('anno117');
    expect(document.documentElement.dataset['theme']).toBe('anno117');
  });

  it('remembers the choice and puts it on the page', () => {
    const service = create();
    service.setTheme('anno1800');
    TestBed.tick();
    expect(localStorage.getItem(THEME_KEY)).toBe('anno1800');
    expect(document.documentElement.dataset['theme']).toBe('anno1800');
  });

  it('starts on the theme chosen last time', () => {
    localStorage.setItem(THEME_KEY, 'anno1800');
    expect(create().themeSignal()).toBe('anno1800');
  });

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem(THEME_KEY, 'neon');
    expect(create().themeSignal()).toBe('anno117');
  });
});
