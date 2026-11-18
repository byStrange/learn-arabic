import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, defaultState, exportJson, importJson, load, saveNow } from '../src/lib/storage';

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('falls back to defaults on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(load()).toEqual(defaultState());
  });
  it('falls back to defaults on a wrong version or shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(load()).toEqual(defaultState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, settings: 5 }));
    expect(load()).toEqual(defaultState());
  });
  it('saves and loads', () => {
    const s = defaultState();
    s.settings.onboarded = true;
    s.days['2025-03-01'] = { items: 4, correct: 3 };
    expect(saveNow(s)).toBe(true);
    expect(load()).toEqual(s);
  });
  it('rejects malformed imports', () => {
    expect(importJson('nope').ok).toBe(false);
    expect(importJson('[]').ok).toBe(false);
    expect(importJson(JSON.stringify({ version: 1 })).ok).toBe(false);
    expect(importJson(JSON.stringify({ ...defaultState(), version: 2 })).ok).toBe(false);
    expect(importJson(JSON.stringify({ ...defaultState(), days: { 'not-a-date': { items: 1, correct: 1 } } })).ok).toBe(false);
  });
  it('round-trips export → import with identical state', () => {
    const s = defaultState();
    s.settings.knownSurahs = [112, 1];
    s.freezes = 1;
    s.lastSeen = '2025-03-02';
    s.lessons.l1 = { status: 'done', stepIndex: 7, correct: 4, total: 5, completedAt: '2025-03-01' };
    s.cards['v:112:1:1'] = { id: 'v:112:1:1', kind: 'vocab', box: 2, due: '2025-03-04', reps: 3, lapses: 1, last: '2025-03-02' };
    s.days['2025-03-01'] = { items: 5, correct: 4 };
    s.days['2025-03-02'] = { items: 0, correct: 0, frozen: true };
    const r = importJson(exportJson(s));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state).toEqual(s);
  });
});
