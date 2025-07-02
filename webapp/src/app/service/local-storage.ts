import { Injectable } from '@angular/core';
import { getOrDefault } from '../tools/table';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageManager {

  private readonly cache = new Map<string, StorageItem<any>>();

  clear(): void {
    localStorage.clear();
  }

  lookupItem<T>(key: string, converter: StorageItemConverter<any> = identityConverter): StorageItem<T> {
    return getOrDefault(this.cache, key, () => new StorageItemImpl<T>(key, converter));
  }

  lookupStringItem(key: string): StorageItem<string> {
    return this.lookupItem(key);
  }

  lookupObjectItem<T extends object>(key: string): StorageItem<T> {
    return this.lookupItem<T>(key, jsonConverter);
  }
};

export interface StorageItem<T> {
  clear(): void;
  get(): T | null;
  set(value: T): void;
};

export interface StorageItemConverter<T> {
  convertItemToStorage(value: T): string;
  convertStorageToItem(value: string): T;
};

const identityConverter: StorageItemConverter<string> = {
  convertItemToStorage: function (value: string): string {
    return value;
  },
  convertStorageToItem: function (value: string): string {
    return value;
  }
};

const jsonConverter: StorageItemConverter<object> = {
  convertItemToStorage: function (value: object): string {
    return JSON.stringify(value);
  },
  convertStorageToItem: function (value: string): object {
    return JSON.parse(value);
  }
};

class StorageItemImpl<T> implements StorageItem<T> {

  constructor(private readonly key: string, private readonly converter: StorageItemConverter<T>) { }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  get(): T | null {
    const item = localStorage.getItem(this.key);
    if (!item) {
      return null;
    }
    return this.converter.convertStorageToItem(item);
  }

  set(value: T): void {
    localStorage.setItem(this.key, this.converter.convertItemToStorage(value));
  }
}