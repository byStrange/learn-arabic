import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { clearAiConfig, loadAiConfig, saveAiConfig, type AiConfig } from './config';

type Ctx = {
  /** a key and a model are saved: AI buttons may show */
  ready: boolean;
  config: AiConfig | null;
  setConfig: (cfg: AiConfig) => void;
  clear: () => void;
};

const NONE: Ctx = { ready: false, config: null, setConfig: () => undefined, clear: () => undefined };
const AiContext = createContext<Ctx | null>(null);

export function AiProvider({ children }: { children: ReactNode }) {
  const [config, setState] = useState<AiConfig | null>(() => loadAiConfig());
  const setConfig = useCallback((cfg: AiConfig) => {
    saveAiConfig(cfg);
    setState({ key: cfg.key.trim(), model: cfg.model });
  }, []);
  const clear = useCallback(() => {
    clearAiConfig();
    setState(null);
  }, []);
  const value = useMemo(() => ({ ready: !!config && !!config.key && !!config.model, config, setConfig, clear }), [config, setConfig, clear]);
  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

/** Tolerates a missing provider: then AI is simply not ready. */
export function useAi(): Ctx {
  return useContext(AiContext) ?? NONE;
}
