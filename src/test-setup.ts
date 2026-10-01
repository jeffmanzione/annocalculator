// Runs before every spec (see `setupFiles` in angular.json's `test` target).
//
// The app reads and writes `localStorage` directly. Under Vitest + jsdom on
// recent Node versions the global is missing or unusable (jsdom needs a
// non-opaque origin, and Node ships its own experimental `localStorage`), so
// install a small in-memory Storage whenever it isn't functional.

class MemoryStorage implements Storage {
  private readonly items_ = new Map<string, string>();

  get length(): number {
    return this.items_.size;
  }

  clear(): void {
    this.items_.clear();
  }

  getItem(key: string): string | null {
    return this.items_.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.items_.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.items_.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items_.set(key, String(value));
  }
}

function localStorageWorks(): boolean {
  try {
    localStorage.setItem('__probe__', '1');
    localStorage.removeItem('__probe__');
    return true;
  } catch {
    return false;
  }
}

if (!localStorageWorks()) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}
