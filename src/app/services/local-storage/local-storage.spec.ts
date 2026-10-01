import { LocalStorageManager } from './local-storage';

describe('LocalStorageManager', () => {
  let manager: LocalStorageManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new LocalStorageManager();
  });

  it('returns null for a key that was never set', () => {
    expect(manager.lookupStringItem('missing').get()).toBeNull();
  });

  it('round-trips a string', () => {
    const item = manager.lookupStringItem('greeting');
    item.set('hello');
    expect(item.get()).toBe('hello');
    expect(localStorage.getItem('greeting')).toBe('hello');
  });

  it('round-trips an object as JSON', () => {
    const item = manager.lookupObjectItem<{ a: number; b: string[] }>('obj');
    item.set({ a: 1, b: ['x', 'y'] });
    expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({
      a: 1,
      b: ['x', 'y'],
    });
    expect(item.get()).toEqual({ a: 1, b: ['x', 'y'] });
  });

  it('reads back what another item for the same key wrote', () => {
    manager.lookupStringItem('shared').set('value');
    expect(new LocalStorageManager().lookupStringItem('shared').get()).toBe(
      'value',
    );
  });

  it('treats an empty stored string as missing', () => {
    localStorage.setItem('empty', '');
    expect(manager.lookupStringItem('empty').get()).toBeNull();
  });

  it('clears a single item', () => {
    const item = manager.lookupStringItem('one');
    item.set('1');
    manager.lookupStringItem('two').set('2');
    item.clear();
    expect(item.get()).toBeNull();
    expect(manager.lookupStringItem('two').get()).toBe('2');
  });

  it('clears everything', () => {
    manager.lookupStringItem('one').set('1');
    manager.lookupStringItem('two').set('2');
    manager.clear();
    expect(localStorage.length).toBe(0);
  });

  it('returns the same item object for the same key', () => {
    expect(manager.lookupStringItem('same')).toBe(
      manager.lookupStringItem('same'),
    );
    expect(manager.lookupStringItem('same')).not.toBe(
      manager.lookupStringItem('other'),
    );
  });

  it('throws on stored text that is not valid JSON for an object item', () => {
    localStorage.setItem('broken', '{not json');
    expect(() => manager.lookupObjectItem('broken').get()).toThrow();
  });
});
