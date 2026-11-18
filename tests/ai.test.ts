import { afterEach, describe, expect, it, vi } from 'vitest';
import { AI_BASE, AiError, cleanProse, complete, extractJson, listModels } from '../src/lib/ai/client';
import { validateAiQuestions } from '../src/lib/ai/prompts';
import { defaultState, exportJson } from '../src/lib/storage';

const cfg = { key: 'sk-secret-123', model: 'm-mini' };
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers });
afterEach(() => vi.useRealTimers());

describe('client', () => {
  it('sends the key and returns the text', async () => {
    const f = vi.fn().mockResolvedValue(json({ choices: [{ message: { content: 'hello' } }] }));
    expect(await complete({ system: 's', user: 'u', maxTokens: 10 }, cfg, f)).toBe('hello');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe(`${AI_BASE}/chat/completions`);
    expect(init.headers.Authorization).toBe('Bearer sk-secret-123');
    expect(JSON.parse(init.body)).toMatchObject({ model: 'm-mini', max_tokens: 10, temperature: 0.2 });
  });
  it('lists models', async () => {
    const f = vi.fn().mockResolvedValue(json({ data: [{ id: 'a' }, { id: 'b' }] }));
    expect(await listModels('k', f)).toEqual(['a', 'b']);
    expect(f.mock.calls[0][0]).toBe(`${AI_BASE}/models`);
  });
  it.each([
    [401, 'auth'],
    [403, 'auth'],
    [402, 'balance'],
    [429, 'rate'],
    [500, 'server'],
  ])('maps %i to %s', async (status, kind) => {
    const f = vi.fn().mockResolvedValue(json({ error: { message: 'boom' } }, status, { 'retry-after': '7' }));
    const err = await complete({ system: 's', user: 'u', maxTokens: 1 }, cfg, f).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect(err.kind).toBe(kind);
    expect(err.message).not.toContain('sk-secret');
    if (kind === 'rate') expect(err.retryAfter).toBe(7);
    if (kind === 'server') expect(err.message).toBe('boom');
  });
  it('times out and aborts', async () => {
    const hang = (_u: string, init: RequestInit) => new Promise((_r, rej) => init.signal!.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' }))));
    const t = await complete({ system: 's', user: 'u', maxTokens: 1, timeoutMs: 5 }, cfg, hang as never).catch((e) => e);
    expect(t.kind).toBe('timeout');
    const ctl = new AbortController();
    const p = complete({ system: 's', user: 'u', maxTokens: 1, signal: ctl.signal }, cfg, hang as never).catch((e) => e);
    ctl.abort();
    expect((await p).name).toBe('AbortError');
  });
  it('network failure', async () => {
    const err = await complete({ system: 's', user: 'u', maxTokens: 1 }, cfg, vi.fn().mockRejectedValue(new TypeError('x'))).catch((e) => e);
    expect(err.kind).toBe('network');
  });
  it('extractJson and cleanProse', () => {
    expect(extractJson('Sure!\n```json\n{"a":1}\n```\nbye')).toEqual({ a: 1 });
    expect(extractJson('no json')).toBeNull();
    expect(cleanProse('The root ح م د and the word الحمد here')).toBe('The root ح م د and the word here');
  });
  it('the key is never in an export', () => {
    localStorage.setItem('qg:ai', JSON.stringify(cfg));
    expect(exportJson(defaultState())).not.toContain('sk-secret');
  });
});

describe('validateAiQuestions', () => {
  const good = [
    { type: 'tap', ayah: '112:1', feature: 'role:fil', prompt: 'Tap the verb.', explain: 'Qul is a command.', answer: [1] },
    { type: 'classify', ayah: '1:2', axis: 'case', positions: [1, 3], prompt: 'Case?', explain: 'e' },
    { type: 'choice', ayah: '113:1', position: 3, axis: 'case', prompt: 'Case of rabbi?', explain: 'e' },
  ];
  it('keeps correct items and computes the answers', () => {
    const r = validateAiQuestions({ questions: good }, 'l5');
    expect(r.map((x) => x.id)).toEqual(['ai:l5:1', 'ai:l5:2', 'ai:l5:3']);
    const c = r[2];
    expect(c.kind === 'choice' && c.options[c.answer]).toBe('jarr');
  });
  it('drops every bad case', () => {
    const bad = [
      { ...good[0], answer: [2] }, // disagrees with the annotations
      { ...good[0], ayah: '999:1' },
      { ...good[0], answer: [9] },
      { ...good[0], prompt: 'Tap الحمد please' }, // Arabic in the prompt
      { type: 'classify', ayah: '1:2', axis: 'state', positions: [3], prompt: 'p', explain: 'e' }, // no state for rabbi
      { type: 'tap', ayah: '112:2', feature: 'case:raf', prompt: 'p', explain: 'e', answer: [1, 2] }, // covers every word
    ];
    expect(validateAiQuestions({ questions: bad }, 'l1')).toEqual([]);
  });
});
