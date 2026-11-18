import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { todayKey } from '../lib/date';
import { createSaver, defaultState, load, storageAvailable, type AppState } from '../lib/storage';
import { reducer, type Action } from './reducer';

type Ctx = {
  state: AppState;
  dispatch: Dispatch<Action>;
  today: string;
  /** false when localStorage is unavailable or full: progress lives in memory only */
  persistent: boolean;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children, initialState }: { children: ReactNode; initialState?: AppState }) {
  const [persistent, setPersistent] = useState(() => storageAvailable());
  const [today, setToday] = useState(() => todayKey());
  const [state, dispatch] = useReducer(reducer, undefined, () => reducer(initialState ?? load(), { type: 'reconcile', today: todayKey() }));
  const saver = useRef(createSaver(300, (ok) => setPersistent(ok)));

  useEffect(() => {
    saver.current.save(state);
  }, [state]);

  useEffect(() => {
    const flush = () => saver.current.flush();
    const refresh = () => {
      const t = todayKey();
      setToday((prev) => (prev === t ? prev : t));
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') flush();
      else refresh();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', refresh);
      flush();
    };
  }, []);

  // A new calendar day: settle missed days (freezes) before anything is shown.
  useEffect(() => {
    dispatch({ type: 'reconcile', today });
  }, [today]);

  const value = useMemo(() => ({ state, dispatch, today, persistent }), [state, today, persistent]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}

export function useSettings() {
  const { state, dispatch } = useApp();
  const set = useCallback((settings: Partial<AppState['settings']>) => dispatch({ type: 'setSettings', settings }), [dispatch]);
  return [state.settings, set] as const;
}

export { defaultState };
