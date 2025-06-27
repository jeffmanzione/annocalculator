

export function getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: () => V): V {
  if (map.has(key)) {
    return map.get(key)!;
  }
  const val = defaultValue();
  map.set(key, val);
  return val;
}

export interface ReadonlyMap<K, V> extends Iterable<[K, V]> {
  get(k: K): V | undefined;
  [Symbol.iterator](): SetIterable<[K, V]>;
  keys(): SetIterable<K>;
  values(): SetIterable<V>;
};

interface SetIterable<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): SetIterable<T>;
}

class ReadonlyMapDelegate<K, V> implements ReadonlyMap<K, V> {
  constructor(private readonly delegate: Map<K, V>) { }

  get(k: K): V | undefined {
    return this.delegate.get(k);
  }

  *[Symbol.iterator](): Generator<[K, V]> {
    yield* this.delegate;
  }

  *keys(): Generator<K> {
    yield* this.delegate.keys();
  }

  *values(): Generator<V> {
    yield* this.delegate.values();
  }
}

export interface ReadonlyMultiSet<K, V> extends Iterable<[K, Iterable<V>]> {
  get(k: K): SetIterable<V>;
  flatIterator(): SetIterable<[K, V]>;
  agg<Z>(aggFn: (k: K, vs: Iterable<V>) => Z): ReadonlyMap<K, Z>;
}

abstract class AbstractReadonlyMultiSet<K, V> implements ReadonlyMultiSet<K, V> {
  abstract get(k: K): SetIterable<V>;
  abstract [Symbol.iterator](): SetIterable<[K, Iterable<V>]>;
  abstract flatIterator(): SetIterable<[K, V]>;

  agg<Z>(aggFn: (k: K, vs: Iterable<V>) => Z): ReadonlyMap<K, Z> {
    const map = new Map<K, Z>();
    for (const [k, vs] of this) {
      map.set(k, aggFn(k, vs));
    }
    return new ReadonlyMapDelegate(map);
  }
}

interface MutableMultiSetMixin<K, V> {
  put(k: K, v: V): void;
}

interface MutableMultiSet<K, V>
  extends ReadonlyMultiSet<K, V>,
  MutableMultiSetMixin<K, V> { }

abstract class AbstractMutibleMultiSet<K, V>
  extends AbstractReadonlyMultiSet<K, V>
  implements MutableMultiSet<K, V> {

  abstract put(k: K, v: V): void;
}

export class MultiSet<K, V> extends AbstractMutibleMultiSet<K, V> {
  private readonly map = new Map<K, Set<V>>();

  override *get(k: K): Generator<V> {
    yield* (this.map.get(k) ?? []);
  }

  override *flatIterator(): Generator<[K, V]> {
    for (const [k, vs] of this.map) {
      for (const v of vs) {
        yield [k, v];
      }
    }
  }

  override *[Symbol.iterator](): Generator<[K, Iterable<V>]> {
    yield* this.map;
  }

  override put(k: K, v: V): void {
    getOrDefault(this.map, k, () => new Set()).add(v);
  }
}

class MultiSetTableDelegate<K1, K2, V> extends AbstractReadonlyMultiSet<K1, [K2, V]> {
  constructor(private readonly delegate: ReadonlyTable<K1, K2, V>) { super(); }

  override *get(k1: K1): Generator<[K2, V]> {
    yield* this.delegate.drill(k1);
  }

  override *[Symbol.iterator](): Generator<[K1, SetIterable<[K2, V]>]> {
    for (const k1 of this.delegate.keys()) {
      yield [k1, this.get(k1)];
    }
  }

  override *flatIterator(): Generator<[K1, [K2, V]]> {
    for (const [k1, k2v] of this) {
      for (const [k2, v] of k2v) {
        yield [k1, [k2, v]];
      }
    }
  }
}

export interface ReadonlyTable<K1, K2, V> extends Iterable<[K1, K2, V]> {
  get(k1: K1, k2: K2): V | undefined;
  keys(): SetIterable<K1>;
  drill(k1: K1): ReadonlyMap<K2, V>;
  [Symbol.iterator](): SetIterable<[K1, K2, V]>;
  agg<Z>(aggFn: (k1: K1, k2: K2, v: V, z: Z) => void, initFn: () => Z): Z;
  reduceLeft<Z>(reduceFn: (k2: K2, vs: Iterable<V>) => Z): ReadonlyMap<K2, Z>;
  asMultiSet(): ReadonlyMultiSet<K1, [K2, V]>;
}

abstract class AbstractReadonlyTable<K1, K2, V> implements ReadonlyTable<K1, K2, V> {
  abstract get(k1: K1, k2: K2): V | undefined;
  abstract keys(): SetIterable<K1>;
  abstract drill(k1: K1): ReadonlyMap<K2, V>;
  abstract [Symbol.iterator](): SetIterable<[K1, K2, V]>;

  agg<Z>(aggFn: (k1: K1, k2: K2, v: V, z: Z) => void, initFn: () => Z): Z {
    const z = initFn();
    for (const [k1, k2, v] of this) {
      aggFn(k1, k2, v, z);
    }
    return z;
  }

  reduceLeft<Z>(reduceFn: (k2: K2, vs: Iterable<V>) => Z): ReadonlyMap<K2, Z> {
    const multiSet = new MultiSet<K2, V>();
    for (const [_, k2, v] of this) {
      multiSet.put(k2, v);
    }
    return multiSet.agg(reduceFn);
  }

  asMultiSet(): ReadonlyMultiSet<K1, [K2, V]> {
    return new MultiSetTableDelegate(this);
  }
}

class ReadonlyTableDelegate<K1, K2, V> extends AbstractReadonlyTable<K1, K2, V> {
  constructor(private readonly delegate: ReadonlyTable<K1, K2, V>) { super(); }

  override get(k1: K1, k2: K2): V | undefined {
    return this.delegate.get(k1, k2);
  }

  override *keys(): Generator<K1> {
    yield* this.delegate.keys();
  }

  override drill(k1: K1): ReadonlyMap<K2, V> {
    return this.delegate.drill(k1);
  }

  override *[Symbol.iterator](): Generator<[K1, K2, V]> {
    yield* this.delegate;
  }
}

interface MutableTableMixin<K1, K2, V> {
  getOrDefault(k1: K1, k2: K2, defaultValue: () => V): V;
  set(k1: K1, k2: K2, v: V): void;
}

interface MutableTable<K1, K2, V>
  extends ReadonlyTable<K1, K2, V>,
  MutableTableMixin<K1, K2, V> { }

abstract class AbstractMutableTable<K1, K2, V>
  extends AbstractReadonlyTable<K1, K2, V>
  implements MutableTable<K1, K2, V> {

  abstract getOrDefault(k1: K1, k2: K2, defaultValue: () => V): V;
  abstract set(k1: K1, k2: K2, v: V): void;
  abstract asView(): ReadonlyTable<K1, K2, V>;
}

export class Table<K1, K2, V> extends AbstractMutableTable<K1, K2, V> {
  private readonly data: Map<K1, Map<K2, V>> = new Map();

  override set(k1: K1, k2: K2, v: V): void {
    getOrDefault(this.data, k1, () => new Map()).set(k2, v);
  }

  override get(k1: K1, k2: K2): V | undefined {
    return this.data.get(k1)?.get(k2);
  }

  override *keys(): Generator<K1> {
    yield* this.data.keys();
  }

  override getOrDefault(k1: K1, k2: K2, defaultValue: () => V): V {
    const map = getOrDefault(this.data, k1, () => new Map());
    return getOrDefault(map, k2, defaultValue);
  }

  override drill(k1: K1): ReadonlyMap<K2, V> {
    return new ReadonlyMapDelegate(this.data.get(k1) ?? new Map());
  }

  override *[Symbol.iterator](): Generator<[K1, K2, V]> {
    for (const [k1, map] of this.data) {
      for (const [k2, v] of map) {
        yield [k1, k2, v];
      }
    }
  }

  override asView(): ReadonlyTable<K1, K2, V> {
    return new ReadonlyTableDelegate(this);
  }
};