import { describe, expect, it } from 'vitest';
import { THEME_KEY, readStoredTheme, resolveTheme, storeTheme } from './theme';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('resolveTheme', () => {
  it('la preferencia guardada gana', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });
  it('sin preferencia guardada: modo claro (no sigue al sistema)', () => {
    expect(resolveTheme(null)).toBe('light');
  });
});

describe('preferencia guardada', () => {
  it('lee solo valores válidos', () => {
    expect(readStoredTheme(fakeStorage({ [THEME_KEY]: 'light' }))).toBe('light');
    expect(readStoredTheme(fakeStorage({ [THEME_KEY]: 'sepia' }))).toBeNull();
    expect(readStoredTheme(fakeStorage())).toBeNull();
  });
  it('guarda la elección', () => {
    const s = fakeStorage();
    storeTheme('dark', s);
    expect(s.data[THEME_KEY]).toBe('dark');
  });
  it('si el almacenamiento está bloqueado no rompe', () => {
    expect(readStoredTheme(throwing)).toBeNull();
    expect(() => storeTheme('light', throwing)).not.toThrow();
  });
});
