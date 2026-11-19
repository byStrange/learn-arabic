import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/content/lessons';
import { defaultState, exportJson, importJson, parseState } from '../src/lib/storage';
import { introduceCards } from '../src/lib/srs';
import { reducer } from '../src/state/reducer';

const at = '2025-03-01T10:00:00.000Z';

describe('notes', () => {
  it('parseState accepts a missing notes field and drops bad entries', () => {
    const { notes: _n, ...old } = defaultState();
    void _n;
    expect(parseState(old)?.notes).toEqual({});
    const s = parseState({
      ...old,
      notes: { 'lesson:l1': { text: 'hi', updatedAt: at }, 'bad key': { text: 'x', updatedAt: at }, 'ayah:1:2': { text: '', updatedAt: at }, 'sheet:l1': { text: 'y'.repeat(25000), updatedAt: at, source: 'ai' } },
    })!;
    expect(Object.keys(s.notes).sort()).toEqual(['lesson:l1', 'sheet:l1']);
    expect(s.notes['sheet:l1'].text.length).toBe(20000);
    expect(s.notes['sheet:l1'].source).toBe('ai');
  });
  it('setNote saves and a blank text deletes', () => {
    let s = reducer(defaultState(), { type: 'setNote', key: 'ayah:112:1', text: 'mine', at });
    expect(s.notes['ayah:112:1'].text).toBe('mine');
    s = reducer(s, { type: 'setNote', key: 'ayah:112:1', text: '   ', at });
    expect(s.notes).toEqual({});
    expect(reducer(s, { type: 'setNote', key: 'nope', text: 'x', at })).toBe(s);
  });
  it('round-trips through export and import', () => {
    const s = reducer(defaultState(), { type: 'setNote', key: 'lesson:l3', text: 'sun letters', at });
    const r = importJson(exportJson(s));
    expect(r.ok && r.state.notes).toEqual(s.notes);
  });
  it('reconcile gives a finished lesson its missing cards and clamps started lessons', () => {
    const s = defaultState();
    s.lessons.l1 = { status: 'done', stepIndex: 7, correct: 1, total: 1 };
    s.lessons.l2 = { status: 'started', stepIndex: 99, correct: 0, total: 0 };
    s.cards['v:112:1:1'] = { id: 'v:112:1:1', kind: 'vocab', box: 2, due: '2025-03-01', reps: 1, lapses: 0 };
    const r = reducer(s, { type: 'reconcile', today: '2025-03-05' });
    for (const c of introduceCards(LESSONS[0], '2025-03-05')) expect(r.cards[c.id]).toBeDefined();
    expect(r.cards['v:112:1:1'].box).toBe(2);
    expect(r.cards['c:l1-r5'].due).toBe('2025-03-06');
    expect(r.lessons.l2.stepIndex).toBe(LESSONS[1].steps.length - 1);
  });
});
