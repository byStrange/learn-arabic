import { useMemo } from 'react';
import type { Part, Ref, Role } from '../content/types';
import { resolveRef, type RefWord } from '../lib/refs';
import type { TranslationPref } from '../lib/storage';
import { useWordSheet } from './WordSheet';

export const ROLE_LABEL: Record<Role, string> = { ism: 'ism', fil: 'fiʿl', harf: 'ḥarf' };

/** The part whose colour represents the word: first non-ḥarf part, else the first. */
export function mainRole(parts: Part[]): Role {
  return (parts.find((p) => p.type !== 'harf') ?? parts[0]).type;
}

type Props = {
  reference: Ref;
  highlight?: number[];
  selectable?: boolean;
  selected?: number[];
  onToggle?: (pos: number) => void;
  showGlosses: boolean;
  /** show role labels (ism / fiʿl / ḥarf) under each word */
  revealed?: boolean;
  /** positions that were the right answer (underline grows) */
  correct?: number[];
  /** positions picked but wrong */
  wrong?: number[];
  translation?: TranslationPref | 'none';
  /** tapping a word opens the grammar sheet */
  openable?: boolean;
  showSource?: boolean;
};

export function AyahView({
  reference,
  highlight = [],
  selectable,
  selected = [],
  onToggle,
  showGlosses,
  revealed,
  correct = [],
  wrong = [],
  translation = 'none',
  openable,
  showSource = true,
}: Props) {
  const data = useMemo(() => resolveRef(reference), [reference]);
  const sheet = useWordSheet();

  return (
    <figure className="ayah">
      <div className="ayah__words ar" dir="rtl" lang="ar" role="group" aria-label={`${data.source}, word by word`}>
        {data.words.map((w) => {
          const isSel = selected.includes(w.pos);
          const isHl = highlight.includes(w.pos);
          const isOk = correct.includes(w.pos);
          const isBad = wrong.includes(w.pos);
          const cls = ['word', isHl && 'is-hl', isSel && 'is-selected', isOk && 'is-answer grow-underline', isBad && 'is-wrong', revealed && `has-role role-${mainRole(w.note.parts)}`]
            .filter(Boolean)
            .join(' ');
          const inner = <WordInner w={w} showGlosses={showGlosses} revealed={!!revealed} answer={isOk} wrong={isBad} />;
          if (selectable) {
            return (
              <button key={w.pos} type="button" className={cls} aria-pressed={isSel} aria-label={`${w.ar}, ${w.gloss}`} onClick={() => onToggle?.(w.pos)}>
                {inner}
              </button>
            );
          }
          if (openable && sheet) {
            return (
              <button key={w.pos} type="button" className={`${cls} is-openable`} aria-label={`${w.ar}, ${w.gloss}. Open grammar notes`} aria-haspopup="dialog" onClick={() => sheet.open(w, data.source)}>
                {inner}
              </button>
            );
          }
          return (
            <span key={w.pos} className={cls}>
              {inner}
            </span>
          );
        })}
      </div>
      {translation !== 'none' && (
        <div className="ayah__tr">
          {(translation === 'en' || translation === 'both') && (
            <p lang="en">
              <span className="tr-tag">EN</span> {data.en}
            </p>
          )}
          {(translation === 'uz' || translation === 'both') && (
            <p lang="uz">
              <span className="tr-tag">UZ</span> {data.uz}
            </p>
          )}
        </div>
      )}
      {showSource && (
        <figcaption className="ayah__src">{data.source}</figcaption>
      )}
    </figure>
  );
}

function WordInner({ w, showGlosses, revealed, answer, wrong }: { w: RefWord; showGlosses: boolean; revealed: boolean; answer: boolean; wrong: boolean }) {
  return (
    <>
      <span className="word__ar" lang="ar">
        {w.ar}
      </span>
      {showGlosses && <span className="word__gloss">{w.gloss}</span>}
      {revealed && (
        <span className="word__roles">
          {w.note.parts.map((p, i) => (
            <span key={i} className={`role role-${p.type}`}>
              {ROLE_LABEL[p.type]}
            </span>
          ))}
        </span>
      )}
      {answer && <span className="visually-hidden"> (correct answer)</span>}
      {wrong && <span className="visually-hidden"> (your pick, not correct)</span>}
    </>
  );
}
