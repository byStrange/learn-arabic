import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
      <WordSheetProvider>{ui}</WordSheetProvider>
    </AppProvider>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

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
});
