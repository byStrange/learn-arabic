// The four fixed AI jobs. Each is one button with one result. Nothing runs unless you press it, and nothing shows without a key.
import { useState } from 'react';
import { LESSONS, getLesson } from '../content/lessons';
import type { Exercise, Lesson, ReflectStep } from '../content/types';
import { extractJson, cleanProse } from '../lib/ai/client';
import { useAi } from '../lib/ai/AiContext';
import { explainMistakeRequest, practiceSetRequest, revisionSheetRequest, teachBackRequest, validateAiQuestions } from '../lib/ai/prompts';
import { useAiJob } from '../lib/ai/useAiJob';
import type { Response } from '../lib/grade';
import { navigate } from '../lib/router';
import { AI_PRACTICE_PREFIX } from '../lib/session';
import { useApp } from '../state/AppState';
import { AiNote, SendGate } from './AiNote';

const MIN_QUESTIONS = 3;

/** (a) Under the feedback after a wrong Check. */
export function ExplainMistake({ exercise, response, lessonId, ayahKey }: { exercise: Exercise; response: Response; lessonId?: string; ayahKey?: string }) {
  const ai = useAi();
  const { state, dispatch } = useApp();
  const job = useAiJob();
  const [saved, setSaved] = useState(false);
  if (!ai.ready) return null;
  const go = () => void job.run(explainMistakeRequest(exercise, response, state.settings.translation));
  const key = lessonId ? `lesson:${lessonId}` : ayahKey ? `ayah:${ayahKey}` : undefined;
  const save = () => {
    if (!key || job.state.status !== 'done') return;
    const prev = state.notes[key]?.text ?? '';
    dispatch({ type: 'setNote', key, text: `${prev}${prev ? '\n\n' : ''}Curialy AI: ${cleanProse(job.state.text)}`, at: new Date().toISOString() });
    setSaved(true);
  };
  return (
    <div className="ai-job">
      {job.state.status === 'idle' && (
        <button type="button" className="btn btn--secondary" onClick={go}>
          Explain my mistake
        </button>
      )}
      <AiNote state={job.state} onCancel={job.cancel} onRetry={go} onSave={key ? save : undefined} saved={saved} />
    </div>
  );
}

/** (b) On the lesson page: checked questions only, then a normal session. */
export function PracticeSetButton({ lesson }: { lesson: Lesson }) {
  const ai = useAi();
  const { state } = useApp();
  const job = useAiJob();
  const [problem, setProblem] = useState('');
  if (!ai.ready) return null;
  const go = async () => {
    setProblem('');
    const raw = await job.run(practiceSetRequest(lesson, state.settings.translation));
    if (raw === null) return;
    const questions = validateAiQuestions(extractJson(raw), lesson.id);
    if (questions.length < MIN_QUESTIONS) {
      setProblem('Curialy AI didn’t produce enough checkable questions. Try again.');
      job.reset();
      return;
    }
    try {
      sessionStorage.setItem(`${AI_PRACTICE_PREFIX}${lesson.id}`, JSON.stringify(questions));
    } catch {
      setProblem('This browser would not keep the questions for this tab.');
      return;
    }
    navigate(`/session/ai/${lesson.id}`);
  };
  return (
    <div className="ai-job">
      <button type="button" className="btn btn--secondary" onClick={go} disabled={job.state.status === 'loading'}>
        AI practice set
      </button>
      {problem && <p className="error" role="alert">{problem}</p>}
      {job.state.status === 'loading' || job.state.status === 'error' ? <AiNote state={job.state} onCancel={job.cancel} onRetry={go} /> : null}
    </div>
  );
}

/** (c) In the teach-back step. */
export function ReflectFeedback({ step }: { step: ReflectStep }) {
  const ai = useAi();
  const { state } = useApp();
  const job = useAiJob();
  if (!ai.ready) return null;
  const lesson = LESSONS.find((l) => l.steps.includes(step));
  const text = state.notes[`reflect:${step.id}`]?.text ?? '';
  if (!lesson) return null;
  const go = () => void job.run(teachBackRequest(lesson, step, text, state.settings.translation));
  return (
    <div className="ai-job">
      <SendGate label="Get feedback" disabled={text.trim().length < 20 || job.state.status === 'loading'} onSend={go} />
      {text.trim().length < 20 && <p className="hint">Write a few lines first. Feedback needs at least 20 characters.</p>}
      <AiNote state={job.state} onCancel={job.cancel} onRetry={go} />
    </div>
  );
}

/** (d) A one-page revision sheet saved as your note sheet:<lessonId>. */
export function RevisionSheetButton({ lessonId }: { lessonId: string }) {
  const ai = useAi();
  const { state, dispatch } = useApp();
  const job = useAiJob();
  const lesson = getLesson(lessonId);
  if (!ai.ready || !lesson) return null;
  const has = !!state.notes[`sheet:${lessonId}`];
  const go = async () => {
    const reflections = lesson.steps.flatMap((s) => (s.kind === 'reflect' && state.notes[`reflect:${s.id}`] ? [`${s.prompt}\n${state.notes[`reflect:${s.id}`].text}`] : []));
    const raw = await job.run(revisionSheetRequest(lesson, state.notes[`lesson:${lessonId}`]?.text ?? '', reflections, state.settings.translation));
    if (raw === null) return;
    dispatch({ type: 'setNote', key: `sheet:${lessonId}`, text: cleanProse(raw), at: new Date().toISOString(), source: 'ai' });
    job.reset();
  };
  return (
    <div className="ai-job">
      <SendGate label={has ? 'Make a new revision sheet' : 'Make a revision sheet'} disabled={job.state.status === 'loading'} onSend={go} />
      {job.state.status !== 'done' && <AiNote state={job.state} onCancel={job.cancel} onRetry={go} />}
    </div>
  );
}
