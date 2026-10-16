import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Sun, CloudRain, RotateCcw } from 'lucide-react';
import { checkAndSubmitTask, getSavedTaskState } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import confetti from 'canvas-confetti';
import type { TaskSubmissionState, UserProfile } from '../../types';

export interface BaseTaskProps {
  user?: UserProfile | null;
  submissionState?: TaskSubmissionState;
  onSubmitted?: (state: TaskSubmissionState) => void;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  isProjectorMode?: boolean;
}

// Helper to parse decimals with either comma or period
const parseDecimal = (val: string): number | null => {
  const clean = val.trim().replace(',', '.');
  if (!clean) return null;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
};

// Hook to prevent flipbook page turns when clicking/dragging inside task inputs.
// Uses BUBBLE phase so child elements (buttons, inputs) receive events first.
// NEVER captures or stops click events!
const usePreventFlipbookDrag = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopBubble = (e: Event) => {
      // Prevent stPageFlip from starting page drag gesture on input interaction
      e.stopPropagation();
    };
    el.addEventListener('mousedown', stopBubble);
    el.addEventListener('touchstart', stopBubble, { passive: true });
    return () => {
      el.removeEventListener('mousedown', stopBubble);
      el.removeEventListener('touchstart', stopBubble);
    };
  }, []);
  return containerRef;
};

/**
 * Task: l6_a_szamolj
 * Kérdés: „Egy csapat 10 lengés idejét mérte: 20,4 másodperc. Mennyi a lengésidő (T)? Mennyi a féllengésidő?"
 * Beviteli mező: Két számmező: lengésidő (T) és féllengésidő; mértékegység: másodperc
 */
export const TaskSzamoljL6: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [tVal, setTVal] = useState('');
  const [felTVal, setFelTVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Restore saved state
  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState('l6_a_szamolj');
      if (saved?.completed) {
        if (saved.answers?.t !== undefined) {
          setTVal(String(saved.answers.t).replace('.', ','));
        }
        if (saved.answers?.fel_t !== undefined) {
          setFelTVal(String(saved.answers.fel_t).replace('.', ','));
        }
        setIsCorrect(true);
        setFeedbackMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, []);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tNum = parseDecimal(tVal);
    const felTNum = parseDecimal(felTVal);

    if (tNum === null || felTNum === null) {
      setErrorMessage('Kérlek, add meg mind a lengésidőt (T), mind a féllengésidőt érvényes számként!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      t: tNum,
      fel_t: felTNum,
    };

    const res = await checkAndSubmitTask({
      item: 'l6_a_szamolj',
      answer: studentAnswer,
      points: 1,
      note: 'A toronyóra-készítő — lengésidő-számítás',
      topic: 'Mérés',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Hiba történt az ellenőrzés során. Kérlek, próbáld újra!');
      return;
    }

    if (res.correct) {
      setIsCorrect(true);
      soundFx.playSuccess?.();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
      });
      setFeedbackMessage(res.message || 'Kiváló számítás! 1 pont jóváírva a Fizika Pontkövetőben.');
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
      if (onSubmitted) {
        onSubmitted({
          isCompleted: true,
          pointsAwarded: 1,
          submittedAt: new Date().toISOString(),
          responseSummary: `T = ${tVal} s, féllengésidő = ${felTVal} s`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Nézd át a számolást és próbáld újra!');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              A toronyóra-készítő — Lengésidő-számítás
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-sm sm:text-base font-semibold text-[#2E1B14] leading-relaxed">
          „Egy csapat 10 lengés idejét mérte: 20,4 másodperc. Mennyi a lengésidő (T)? Mennyi a féllengésidő?”
        </p>
        <span className="text-[11px] text-[#8C6D58] block mt-1">
          (Tizedesvesszővel vagy tizedesponttal is megadhatod az eredményeket)
        </span>
      </div>

      {isCompleted && (
        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-3 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott értékek: {submissionState.responseSummary}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#5A4232] mb-1">
              Lengésidő (T):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tVal}
                onChange={(e) => setTVal(e.target.value)}
                placeholder="Lengésidő megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">másodperc</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4232] mb-1">
              Féllengésidő:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={felTVal}
                onChange={(e) => setFelTVal(e.target.value)}
                placeholder="Féllengésidő megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">másodperc</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : isCompleted ? 'Újraküldés / Mentés (+1 pont)' : 'Ellenőrzöm'}</span>
          </button>
          {isCompleted && (
            <button
              type="button"
              onClick={() => {
                setTVal('');
                setFelTVal('');
                setIsCorrect(false);
                setFeedbackMessage(null);
              }}
              className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Válasz törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l6_b_valts_at
 * Kérdés: „2 óra hány másodperc?"
 * Beviteli mező: Egy számmező (másodperc)
 */
export const TaskValtsAtL6: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [val, setVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Restore saved state
  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState('l6_b_valts_at');
      if (saved?.completed) {
        if (saved.answers?.ertek !== undefined) {
          setVal(String(saved.answers.ertek));
        }
        setIsCorrect(true);
        setFeedbackMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, []);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const num = parseDecimal(val);
    if (num === null) {
      setErrorMessage('Kérlek, írd be a másodpercek számát a mezőbe!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      ertek: num,
    };

    const res = await checkAndSubmitTask({
      item: 'l6_b_valts_at',
      answer: studentAnswer,
      points: 1,
      note: 'A toronyóra-készítő — időegység-átváltás',
      topic: 'Mérés',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Hiba történt az ellenőrzés során. Kérlek, próbáld újra!');
      return;
    }

    if (res.correct) {
      setIsCorrect(true);
      soundFx.playSuccess?.();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
      });
      setFeedbackMessage(res.message || 'Pontos átváltás! 1 pont jóváírva a Fizika Pontkövetőben.');
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
      if (onSubmitted) {
        onSubmitted({
          isCompleted: true,
          pointsAwarded: 1,
          submittedAt: new Date().toISOString(),
          responseSummary: `2 óra = ${val} másodperc`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Számold át újra az átváltást és próbáld meg megint!');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              A toronyóra-készítő — Időegység-átváltás
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-sm sm:text-base font-semibold text-[#2E1B14] leading-relaxed">
          „2 óra hány másodperc?”
        </p>
      </div>

      {isCompleted && (
        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-3 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott érték: {submissionState.responseSummary}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#5A4232] mb-1">
            Időtartam másodpercben:
          </label>
          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="másodperc"
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
            />
            <span className="text-xs font-bold text-[#5A4232] shrink-0">másodperc (s)</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : isCompleted ? 'Újraküldés / Mentés (+1 pont)' : 'Ellenőrzöm'}</span>
          </button>
          {isCompleted && (
            <button
              type="button"
              onClick={() => {
                setVal('');
                setIsCorrect(false);
                setFeedbackMessage(null);
              }}
              className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Válasz törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l6_c_igazhamis
 * Kérdés: „»A napóra éjszaka és borult időben is jól használható.« Igaz vagy hamis?"
 * Beviteli mező: Két gomb (Igaz / Hamis) + rövid szöveges indoklás mező (az indoklás nem kötelező)
 */
export const TaskIgazHamisL6: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [indoklas, setIndoklas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Restore saved book state
  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState('l6_c_igazhamis');
      if (saved?.completed) {
        if (typeof saved.answers?.valasz === 'boolean') {
          setChoice(saved.answers.valasz);
        }
        if (typeof saved.answers?.indoklas === 'string') {
          setIndoklas(saved.answers.indoklas);
        }
        setIsCorrect(true);
        setFeedbackMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, []);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (choice === null) {
      setErrorMessage('Kérlek, válaszd ki, hogy Igaz vagy Hamis!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      valasz: choice === true,
      indoklas: indoklas.trim(),
    };

    const res = await checkAndSubmitTask({
      item: 'l6_c_igazhamis',
      answer: studentAnswer,
      points: 1,
      note: 'A toronyóra-készítő — igaz/hamis',
      topic: 'Mérés',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Hiba történt az ellenőrzés során. Kérlek, próbáld újra!');
      return;
    }

    if (res.correct) {
      setIsCorrect(true);
      soundFx.playSuccess?.();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
      });
      setFeedbackMessage(res.message || 'Helyes válasz! 1 pont jóváírva a Fizika Pontkövetőben.');
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
      if (onSubmitted) {
        onSubmitted({
          isCompleted: true,
          pointsAwarded: 1,
          submittedAt: new Date().toISOString(),
          responseSummary: `Választás: ${choice ? 'Igaz' : 'Hamis'}${
            indoklas.trim() ? ` (Indoklás: „${indoklas.trim()}”)` : ''
          }`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Gondold át még egyszer, hogyan vet árnyékot a napóra, és próbáld újra!');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              A toronyóra-készítő — Igaz vagy hamis?
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-sm sm:text-base font-semibold text-[#2E1B14] leading-relaxed">
          „»A napóra éjszaka és borult időben is jól használható.« Igaz vagy hamis?”
        </p>
      </div>

      {isCompleted && (
        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-3 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">{submissionState.responseSummary}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#5A4232] mb-2">
            Válaszd ki az állítás igazságtartalmát:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setChoice(true);
                soundFx.playWoodTap?.();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className={`py-3 px-4 rounded-xl font-serif font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex items-center justify-center gap-2 select-none shadow-sm active:scale-95 ${
                choice === true
                  ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md ring-2 ring-[#B85042]/30 scale-[1.01]'
                  : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042] hover:bg-[#B85042]/5'
              }`}
            >
              <Sun className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Igaz</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setChoice(false);
                soundFx.playWoodTap?.();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className={`py-3 px-4 rounded-xl font-serif font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex items-center justify-center gap-2 select-none shadow-sm active:scale-95 ${
                choice === false
                  ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md ring-2 ring-[#B85042]/30 scale-[1.01]'
                  : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042] hover:bg-[#B85042]/5'
              }`}
            >
              <CloudRain className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Hamis</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5A4232] mb-1">
            Rövid indoklás <span className="text-[11px] font-normal text-[#8C6D58]">(nem kötelező)</span>:
          </label>
          <textarea
            value={indoklas}
            onChange={(e) => setIndoklas(e.target.value)}
            placeholder="Miért gondolod így? (nem kötelező leírni)"
            rows={2}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? 'Ellenőrzés folyamatban...'
                : isCompleted
                ? 'Újraküldés / Mentés (+1 pont)'
                : 'Ellenőrzöm (1 pont)'}
            </span>
          </button>
          {isCompleted && (
            <button
              type="button"
              onClick={() => {
                setChoice(null);
                setIndoklas('');
                setIsCorrect(false);
                setFeedbackMessage(null);
              }}
              className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Válasz törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l6_d_gondolkodj
 * Kérdés: „Miért mér a fiú 10 lengést egyetlen helyett, amikor a lengésidőt akarja meghatározni?"
 * Beviteli mező: Szabad szöveges mező (legalább kb. 15–20 karakter)
 */
export const TaskGondolkodjL6: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Restore saved book state
  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState('l6_d_gondolkodj');
      if (saved?.completed) {
        if (typeof saved.answers?.szoveg === 'string') {
          setText(saved.answers.szoveg);
        }
        setIsCorrect(true);
        setFeedbackMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, []);

  const isCompleted = isCorrect || submissionState?.isCompleted;
  const charCount = text.trim().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (charCount < 15) {
      setErrorMessage(`Kérlek, fejtsd ki bővebben a válaszodat saját szavaiddal! Legalább 15 karakter szükséges (jelenleg: ${charCount} karakter).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      szoveg: text.trim(),
    };

    const res = await checkAndSubmitTask({
      item: 'l6_d_gondolkodj',
      answer: studentAnswer,
      points: 1,
      note: 'A toronyóra-készítő — gondolkodj',
      topic: 'Mérés',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Hiba történt az ellenőrzés során. Kérlek, próbáld újra!');
      return;
    }

    if (res.correct) {
      setIsCorrect(true);
      soundFx.playSuccess?.();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
      });
      setFeedbackMessage(res.message || 'Kiváló gondolkodás! 1 pont jóváírva a Fizika Pontkövetőben.');
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
      if (onSubmitted) {
        onSubmitted({
          isCompleted: true,
          pointsAwarded: 1,
          submittedAt: new Date().toISOString(),
          responseSummary: text.trim(),
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Gondold át a mérési pontosságot, az indítási/megállítási hibát, és próbáld meg újra!');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              A toronyóra-készítő — Gondolkodj!
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-sm sm:text-base font-semibold text-[#2E1B14] leading-relaxed">
          „Miért mér a fiú 10 lengést egyetlen helyett, amikor a lengésidőt akarja meghatározni?”
        </p>
      </div>

      {isCompleted && (
        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-3 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">„{submissionState.responseSummary}”</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Írd ide a magyarázatodat saját szavaiddal..."
            rows={isProjectorMode ? 3 : 4}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
          />
          <div className="flex justify-between items-center text-[10px] text-[#8C6D58] mt-1 px-1">
            <span>Legalább kb. 15–20 karakter szükséges</span>
            <span className={charCount >= 15 ? 'text-emerald-700 font-bold' : ''}>
              {charCount} karakter
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : isCompleted ? 'Újraküldés / Mentés (+1 pont)' : 'Ellenőrzöm'}</span>
          </button>
          {isCompleted && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setIsCorrect(false);
                setFeedbackMessage(null);
              }}
              className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Válasz törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Universal dispatcher for Lesson 6 tasks
 */
export const TaskToronyoraL6: React.FC<
  BaseTaskProps & { taskCode: 'l6_a_szamolj' | 'l6_b_valts_at' | 'l6_c_igazhamis' | 'l6_d_gondolkodj' | string }
> = ({ taskCode, ...props }) => {
  switch (taskCode) {
    case 'l6_a_szamolj':
      return <TaskSzamoljL6 {...props} />;
    case 'l6_b_valts_at':
      return <TaskValtsAtL6 {...props} />;
    case 'l6_c_igazhamis':
      return <TaskIgazHamisL6 {...props} />;
    case 'l6_d_gondolkodj':
      return <TaskGondolkodjL6 {...props} />;
    default:
      return null;
  }
};
