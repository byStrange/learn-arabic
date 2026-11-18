import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AiProvider } from '../src/lib/ai/AiContext';
import { LESSONS } from '../src/content/lessons';
import { Lesson } from '../src/screens/Lesson';
import { WordSheetProvider } from '../src/components/WordSheet';
import { defaultState } from '../src/lib/storage';
import { Onboarding } from '../src/screens/Onboarding';
import { Session } from '../src/screens/Session';
import { Today } from '../src/screens/Today';
import { AppProvider } from '../src/state/AppState';

const onboarded = () => {
  const s = defaultState();
  s.settings.onboarded = true;
  return s;
};

function wrap(ui: React.ReactElement, state = onboarded()) {
  return render(
    <AppProvider initialState={state}>
      <AiProvider>
        <WordSheetProvider>{ui}</WordSheetProvider>
      </AiProvider>
    </AppProvider>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const at = (index: number) => {
  const s = onboarded();
  s.lessons.l1 = { status: 'started', stepIndex: index, correct: 0, total: 0 };
  return s;
};
const lessonRoute = { name: 'session', kind: 'lesson', lessonId: 'l1' } as const;
const stepOf = (kind: string, id?: string) => LESSONS[0].steps.findIndex((x) => x.kind === kind && (!id || ('id' in x && x.id === id)));

describe('screens', () => {
  it('Today renders one h1 and the start button', () => {
    wrap(<Today />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Today');
    expect(screen.getByRole('button', { name: 'Start today’s session' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Short on time? Read one ayah' })).toBeTruthy();
    expect(screen.getByRole('img', { name: '0 of 15 answers today' })).toBeTruthy();
  });

  it('Onboarding has labelled controls and one h1', () => {
    wrap(<Onboarding />, defaultState());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    expect(screen.getByRole('radio', { name: /Steady/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start learning' })).toBeTruthy();
  });

  it('a session walks through lesson 1 and a wrong tap reveals the right word', () => {
    wrap(<Session route={{ name: 'session', kind: 'daily' }} />);
    // step 1: concept, step 2: example
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    // step 3: tap the fiʿl in 112:1. Pick the wrong word (the third) first.
    const check = screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement;
    expect(check.disabled).toBe(true);
    const words = screen.getAllByRole('button', { pressed: false });
    fireEvent.click(words.find((b) => b.getAttribute('aria-label')?.endsWith('(is) Allah'))!);
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(document.querySelectorAll('.word.is-answer').length).toBe(1);
    expect(document.querySelector('.word.is-answer')?.textContent).toContain('Say');
  });

  it('classify: rows are graded one by one', () => {
    const { container } = wrap(<Session route={lessonRoute} />, at(stepOf('classify', 'l1-e4')));
    const rows = () => Array.from(container.querySelectorAll('.classify__row'));
    const pick = (row: number, text: string) => fireEvent.click(rows()[row].querySelector(`label.option--chip:nth-of-type(${text === 'ism' ? 1 : 2}) input`)!);
    expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true);
    pick(0, 'ism'); // wrong: Qul is a fiʿl
    pick(1, 'ism');
    pick(2, 'ism');
    pick(3, 'ism');
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(container.querySelectorAll('.classify__row.is-right').length).toBe(3);
    expect(container.querySelectorAll('.classify__row.is-wrong').length).toBe(1);
  });

  it('match: pair by tapping, then check', () => {
    const { container } = wrap(<Session route={lessonRoute} />, at(stepOf('match')));
    const words = Array.from(container.querySelectorAll<HTMLButtonElement>('.match__col--ar button'));
    const pair = (i: number, gloss: string) => {
      fireEvent.click(words[i]);
      fireEvent.click(screen.getByText(gloss).closest('button')!);
    };
    pair(0, 'Say');
    pair(1, 'He');
    pair(2, 'is Allah');
    expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true);
    pair(3, 'the One');
    expect(screen.getAllByRole('button', { name: 'Pair 4: the One', pressed: true })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Correct')).toBeTruthy();
  });

  it('Enter inside the reflect textarea does not advance', () => {
    wrap(<Session route={lessonRoute} />, at(stepOf('reflect')));
    const area = screen.getByRole('textbox');
    fireEvent.change(area, { target: { value: 'my answer' } });
    fireEvent.keyDown(area, { key: 'Enter' });
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  });

  it('shows no AI buttons without a key', () => {
    wrap(<Lesson id="l1" />);
    expect(screen.queryByText('AI practice set')).toBeNull();
    expect(screen.queryByText('Make a revision sheet')).toBeNull();
    cleanup();
    wrap(<Session route={lessonRoute} />, at(stepOf('choice')));
    fireEvent.click(screen.getByLabelText(/Ism/));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Explain my mistake' })).toBeNull();
  });

  it('with a key, a wrong answer offers Explain my mistake and shows the reply without Arabic', async () => {
    localStorage.setItem('qg:ai', JSON.stringify({ key: 'k', model: 'm' }));
    const reply = 'Li- is a small connector, so a harf. قل الحمد is not shown.';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: reply } }] }), { status: 200 })));
    wrap(<Session route={lessonRoute} />, at(stepOf('choice')));
    fireEvent.click(screen.getByLabelText(/Ism/));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    fireEvent.click(screen.getByRole('button', { name: 'Explain my mistake' }));
    await waitFor(() => expect(screen.getByText(/small connector/)).toBeTruthy());
    expect(document.body.textContent).not.toContain('الحمد');
    expect(document.querySelector('.ai-note')?.textContent).toContain('May be wrong');
  });
});
