import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, RotateCcw, Thermometer, Flame, Snowflake } from 'lucide-react';
import { checkAndSubmitTask, submitTaskScore, getSavedTaskState, saveTaskStateToBook } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import confetti from 'canvas-confetti';
import type { TaskSubmissionState, UserProfile } from '../../types';

interface BaseTaskProps {
  user?: UserProfile | null;
  submissionState?: TaskSubmissionState;
  onSubmitted?: (state: TaskSubmissionState) => void;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  isProjectorMode?: boolean;
}

// Helper to parse decimals with comma/period and minus/dash
const parseDecimalWithNegative = (val: string): number | null => {
  if (!val) return null;
  const clean = val.trim().replace(/[\u2212\u2013\u2014]/g, '-').replace(',', '.');
  if (!clean) return null;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
};

// Hook to prevent flipbook drag when clicking/typing in inputs (bubble phase, never blocks clicks)
const usePreventFlipbookDrag = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopBubble = (e: Event) => {
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
 * Task: l5_a_kulonbseg
 * Tűz és jég között — Hőmérséklet-különbségek
 */
export const TaskKulonbsegL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const saved = getSavedTaskState('l5_a_kulonbseg');

  const [valA, setValA] = useState(saved?.answers?.a !== undefined ? String(saved.answers.a) : '');
  const [valB, setValB] = useState(saved?.answers?.b !== undefined ? String(saved.answers.b) : '');
  const [valC, setValC] = useState(saved?.answers?.c !== undefined ? String(saved.answers.c) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(Boolean(saved?.completed));

  const isCompleted = isCorrect || Boolean(submissionState?.isCompleted);

  // Sync state if external storage changes
  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.itemCode === 'l5_a_kulonbseg') {
        const fresh = getSavedTaskState('l5_a_kulonbseg');
        if (fresh?.completed) {
          setIsCorrect(true);
          if (fresh.answers) {
            if (fresh.answers.a !== undefined) setValA(String(fresh.answers.a));
            if (fresh.answers.b !== undefined) setValB(String(fresh.answers.b));
            if (fresh.answers.c !== undefined) setValC(String(fresh.answers.c));
          }
        }
      }
    };
    window.addEventListener('mero-miska-book-updated', handleStorageUpdate);
    return () => window.removeEventListener('mero-miska-book-updated', handleStorageUpdate);
  }, []);

  const handleReset = () => {
    setValA('');
    setValB('');
    setValC('');
    setIsCorrect(false);
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numA = parseDecimalWithNegative(valA);
    const numB = parseDecimalWithNegative(valB);
    const numC = parseDecimalWithNegative(valC);

    if (numA === null || numB === null || numC === null) {
      setErrorMessage('Kérlek, válaszolj mindhárom (a, b és c) kérdésre érvényes számként!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      a: numA,
      b: numB,
      c: numC,
    };

    // Check physical validity:
    // a) -4 to 9 -> 9 - (-4) = 13 °C
    // b) jég és víz alappontok -> 100 - 0 = 100 °C
    // c) 16 to -7 -> 16 - (-7) = 23 °C
    const isAnswerPhysicallyCorrect =
      Math.abs(numA - 13) < 0.2 &&
      Math.abs(numB - 100) < 0.5 &&
      Math.abs(numC - 23) < 0.2;

    try {
      const res = await checkAndSubmitTask({
        item: 'l5_a_kulonbseg',
        answer: studentAnswer,
        points: 1,
        note: 'Tűz és jég között — hőmérséklet-különbségek',
        topic: 'Mérés',
      });

      setIsSubmitting(false);

      if (res.success && res.correct) {
        handleSuccess(res.totalPoints, res.message);
        return;
      }

      // If server returned physically incorrect, or server RPC is not deployed, fallback gracefully
      if (isAnswerPhysicallyCorrect) {
        // Submit via submitTaskScore to ensure point is awarded to Fizika Pontkövető
        const scoreRes = await submitTaskScore({
          item: 'l5_a_kulonbseg',
          points: 1,
          note: 'Tűz és jég között — hőmérséklet-különbségek (a=13, b=100, c=23)',
          mode: 'once',
          answers: studentAnswer,
          topic: 'Mérés',
        });
        await saveTaskStateToBook('l5_a_kulonbseg', studentAnswer, 1, 'Tűz és jég között — hőmérséklet-különbségek');
        handleSuccess(scoreRes.totalPoints || res.totalPoints, scoreRes.message);
      } else {
        soundFx.playWoodTap?.();
        setErrorMessage(
          res.message ||
            'A válaszod még nem pontos. Ellenőrizd a negatív hőmérsékletekkel végzett műveleteket (pl. 9 - (-4) és 16 - (-7)), majd próbáld újra!'
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      if (isAnswerPhysicallyCorrect) {
        await saveTaskStateToBook('l5_a_kulonbseg', studentAnswer, 1, 'Tűz és jég között — hőmérséklet-különbségek');
        handleSuccess(undefined, 'Helyes válasz! Pont jóváírva a Fizika Pontkövetőben.');
      } else {
        setErrorMessage('A válaszod még nem pontos. Gondold át újra a különbségeket, majd próbáld újra!');
      }
    }
  };

  const handleSuccess = (totalPoints?: number, message?: string) => {
    setIsCorrect(true);
    soundFx.playSuccess?.();
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
    });
    setFeedbackMessage(message || 'Helyes válasz! 1 pont jóváírva a Fizika Pontkövetőben.');
    if (totalPoints && onPointsUpdated) {
      onPointsUpdated(totalPoints);
    }
    if (onCompleted) {
      onCompleted();
    }
    if (onSubmitted) {
      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        submittedAt: new Date().toISOString(),
        responseSummary: `a) ${valA} °C | b) ${valB} °C | c) ${valC} °C`,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all relative z-30 select-text ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              Tűz és jég között — Hőmérséklet-különbségek
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-xs sm:text-sm font-semibold text-[#5A4232]">
          A kapuőr három kérdése a varázsüveghez:
        </p>
      </div>

      {isCompleted && (
        <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-4 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva a Fizika Pontkövetőben.'}
          </p>
          {(submissionState?.responseSummary || (valA && valB && valC)) && (
            <p className="italic text-[#2E1B14]/80">
              {submissionState?.responseSummary || `a) ${valA} °C | b) ${valB} °C | c) ${valC} °C`}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>a)</strong> Reggel −4 °C-ot mutatott a varázsüveg a jeges ösvényen, délután 9 °C-ot. Hány fokkal lett melegebb?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="Különbség megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>b)</strong> Hány fok a különbség a varázsüveg két alappontja között, vagyis a jég olvadáspontja és a víz forráspontja között?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                placeholder="Alappontok különbsége..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>c)</strong> Délben 16 °C volt a kapunál, éjjel −7 °C. Hány fokot hűlt le a levegő?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valC}
                onChange={(e) => setValC(e.target.value)}
                placeholder="Lehűlés mértéke..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
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
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 select-none pointer-events-auto"
          >
            <Send className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">
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
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#2E1B14]/20 hover:bg-[#FAF8F2] text-[#2E1B14] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none pointer-events-auto"
              title="Válaszok törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none hidden sm:inline">Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l5_b_kelvin
 * Tűz és jég között — °C és K átváltás
 */
export const TaskKelvinL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const saved = getSavedTaskState('l5_b_kelvin');

  const [valA, setValA] = useState(saved?.answers?.a !== undefined ? String(saved.answers.a) : '');
  const [valB, setValB] = useState(saved?.answers?.b !== undefined ? String(saved.answers.b) : '');
  const [valC, setValC] = useState(saved?.answers?.c !== undefined ? String(saved.answers.c) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(Boolean(saved?.completed));

  const isCompleted = isCorrect || Boolean(submissionState?.isCompleted);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.itemCode === 'l5_b_kelvin') {
        const fresh = getSavedTaskState('l5_b_kelvin');
        if (fresh?.completed) {
          setIsCorrect(true);
          if (fresh.answers) {
            if (fresh.answers.a !== undefined) setValA(String(fresh.answers.a));
            if (fresh.answers.b !== undefined) setValB(String(fresh.answers.b));
            if (fresh.answers.c !== undefined) setValC(String(fresh.answers.c));
          }
        }
      }
    };
    window.addEventListener('mero-miska-book-updated', handleStorageUpdate);
    return () => window.removeEventListener('mero-miska-book-updated', handleStorageUpdate);
  }, []);

  const handleReset = () => {
    setValA('');
    setValB('');
    setValC('');
    setIsCorrect(false);
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numA = parseDecimalWithNegative(valA);
    const numB = parseDecimalWithNegative(valB);
    const numC = parseDecimalWithNegative(valC);

    if (numA === null || numB === null || numC === null) {
      setErrorMessage('Kérlek, válaszolj mindhárom (a, b és c) kérdésre érvényes számként!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      a: numA,
      b: numB,
      c: numC,
    };

    // Physics check:
    // a) 25 °C = 298.15 K (or 298 K)
    // b) -10 °C = 263.15 K (or 263 K)
    // c) 253 K = -20.15 °C (or -20 °C)
    const isAnswerPhysicallyCorrect =
      (Math.abs(numA - 298.15) < 0.6 || Math.abs(numA - 298) < 0.6) &&
      (Math.abs(numB - 263.15) < 0.6 || Math.abs(numB - 263) < 0.6) &&
      (Math.abs(numC - (-20.15)) < 0.6 || Math.abs(numC - (-20)) < 0.6);

    try {
      const res = await checkAndSubmitTask({
        item: 'l5_b_kelvin',
        answer: studentAnswer,
        points: 1,
        note: 'Tűz és jég között — °C és K átváltás',
        topic: 'Mérés',
      });

      setIsSubmitting(false);

      if (res.success && res.correct) {
        handleSuccess(res.totalPoints, res.message);
        return;
      }

      if (isAnswerPhysicallyCorrect) {
        const scoreRes = await submitTaskScore({
          item: 'l5_b_kelvin',
          points: 1,
          note: 'Tűz és jég között — °C és K átváltás (a=298, b=263, c=-20)',
          mode: 'once',
          answers: studentAnswer,
          topic: 'Mérés',
        });
        await saveTaskStateToBook('l5_b_kelvin', studentAnswer, 1, 'Tűz és jég között — °C és K átváltás');
        handleSuccess(scoreRes.totalPoints || res.totalPoints, scoreRes.message);
      } else {
        soundFx.playWoodTap?.();
        setErrorMessage(
          res.message ||
            'A válaszod még nem pontos. Segítség: T(K) = T(°C) + 273, és T(°C) = T(K) - 273. Számold át újra, és próbáld meg megint!'
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      if (isAnswerPhysicallyCorrect) {
        await saveTaskStateToBook('l5_b_kelvin', studentAnswer, 1, 'Tűz és jég között — °C és K átváltás');
        handleSuccess(undefined, 'Helyes válasz! Pont jóváírva a Fizika Pontkövetőben.');
      } else {
        setErrorMessage('A válaszod még nem pontos. Nézd át az átszámolást, majd próbáld újra!');
      }
    }
  };

  const handleSuccess = (totalPoints?: number, message?: string) => {
    setIsCorrect(true);
    soundFx.playSuccess?.();
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
    });
    setFeedbackMessage(message || 'Helyes válasz! 1 pont jóváírva a Fizika Pontkövetőben.');
    if (totalPoints && onPointsUpdated) {
      onPointsUpdated(totalPoints);
    }
    if (onCompleted) {
      onCompleted();
    }
    if (onSubmitted) {
      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        submittedAt: new Date().toISOString(),
        responseSummary: `a) ${valA} K | b) ${valB} K | c) ${valC} °C`,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all relative z-30 select-text ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Snowflake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              Tűz és jég között — °C és K átváltás
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A csillagvizsgálók nyelvén <span className="italic">(segítség: a csillagvizsgálók foka ugyanakkora, mint a tiéd, csak máshonnan indul: T(K) = T(°C) + 273)</span>:
        </p>
      </div>

      {isCompleted && (
        <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-4 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva a Fizika Pontkövetőben.'}
          </p>
          {(submissionState?.responseSummary || (valA && valB && valC)) && (
            <p className="italic text-[#2E1B14]/80">
              {submissionState?.responseSummary || `a) ${valA} K | b) ${valB} K | c) ${valC} °C`}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>a)</strong> 25 °C = ? K
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="Kelvin érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>b)</strong> −10 °C = ? K
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                placeholder="Kelvin érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>c)</strong> A jeges ösvény felirata: 253 K. Hány °C ez?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valC}
                onChange={(e) => setValC(e.target.value)}
                placeholder="Celsius érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
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
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 select-none pointer-events-auto"
          >
            <Send className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">
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
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#2E1B14]/20 hover:bg-[#FAF8F2] text-[#2E1B14] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none pointer-events-auto"
              title="Válaszok törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none hidden sm:inline">Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l5_c_fahrenheit
 * Tűz és jég között — °F és °C átváltás
 */
export const TaskFahrenheitL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const saved = getSavedTaskState('l5_c_fahrenheit');

  const [valA, setValA] = useState(saved?.answers?.a !== undefined ? String(saved.answers.a) : '');
  const [valB, setValB] = useState(saved?.answers?.b !== undefined ? String(saved.answers.b) : '');
  const [valC, setValC] = useState(saved?.answers?.c !== undefined ? String(saved.answers.c) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(Boolean(saved?.completed));

  const isCompleted = isCorrect || Boolean(submissionState?.isCompleted);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.itemCode === 'l5_c_fahrenheit') {
        const fresh = getSavedTaskState('l5_c_fahrenheit');
        if (fresh?.completed) {
          setIsCorrect(true);
          if (fresh.answers) {
            if (fresh.answers.a !== undefined) setValA(String(fresh.answers.a));
            if (fresh.answers.b !== undefined) setValB(String(fresh.answers.b));
            if (fresh.answers.c !== undefined) setValC(String(fresh.answers.c));
          }
        }
      }
    };
    window.addEventListener('mero-miska-book-updated', handleStorageUpdate);
    return () => window.removeEventListener('mero-miska-book-updated', handleStorageUpdate);
  }, []);

  const handleReset = () => {
    setValA('');
    setValB('');
    setValC('');
    setIsCorrect(false);
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numA = parseDecimalWithNegative(valA);
    const numB = parseDecimalWithNegative(valB);
    const numC = parseDecimalWithNegative(valC);

    if (numA === null || numB === null || numC === null) {
      setErrorMessage('Kérlek, válaszolj mindhárom (a, b és c) kérdésre érvényes számként!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      a: numA,
      b: numB,
      c: numC,
    };

    // Physics check:
    // a) 122 °F -> (122 - 32) / 1.8 = 90 / 1.8 = 50 °C
    // b) 293 K -> 293 - 273 = 20 °C (or 293 - 273.15 = 19.85 °C)
    // c) 30 °C -> 30 * 1.8 + 32 = 54 + 32 = 86 °F
    const isAnswerPhysicallyCorrect =
      Math.abs(numA - 50) < 0.6 &&
      (Math.abs(numB - 20) < 0.6 || Math.abs(numB - 19.85) < 0.6) &&
      Math.abs(numC - 86) < 0.6;

    try {
      const res = await checkAndSubmitTask({
        item: 'l5_c_fahrenheit',
        answer: studentAnswer,
        points: 1,
        note: 'Tűz és jég között — °F és °C átváltás',
        topic: 'Mérés',
      });

      setIsSubmitting(false);

      if (res.success && res.correct) {
        handleSuccess(res.totalPoints, res.message);
        return;
      }

      if (isAnswerPhysicallyCorrect) {
        const scoreRes = await submitTaskScore({
          item: 'l5_c_fahrenheit',
          points: 1,
          note: 'Tűz és jég között — °F és °C átváltás (a=50, b=20, c=86)',
          mode: 'once',
          answers: studentAnswer,
          topic: 'Mérés',
        });
        await saveTaskStateToBook('l5_c_fahrenheit', studentAnswer, 1, 'Tűz és jég között — °F és °C átváltás');
        handleSuccess(scoreRes.totalPoints || res.totalPoints, scoreRes.message);
      } else {
        soundFx.playWoodTap?.();
        setErrorMessage(
          res.message ||
            'A válaszod még nem pontos. Képletek: T(°C) = (T(°F) - 32) / 1,8 és T(°F) = T(°C) · 1,8 + 32. Számold át újra, és próbáld megint!'
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      if (isAnswerPhysicallyCorrect) {
        await saveTaskStateToBook('l5_c_fahrenheit', studentAnswer, 1, 'Tűz és jég között — °F és °C átváltás');
        handleSuccess(undefined, 'Helyes válasz! Pont jóváírva a Fizika Pontkövetőben.');
      } else {
        setErrorMessage('A válaszod még nem pontos. Nézd át a számításokat, majd próbáld újra!');
      }
    }
  };

  const handleSuccess = (totalPoints?: number, message?: string) => {
    setIsCorrect(true);
    soundFx.playSuccess?.();
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
    });
    setFeedbackMessage(message || 'Helyes válasz! 1 pont jóváírva a Fizika Pontkövetőben.');
    if (totalPoints && onPointsUpdated) {
      onPointsUpdated(totalPoints);
    }
    if (onCompleted) {
      onCompleted();
    }
    if (onSubmitted) {
      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        submittedAt: new Date().toISOString(),
        responseSummary: `a) ${valA} °C | b) ${valB} °C | c) ${valC} °F`,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all relative z-30 select-text ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              Tűz és jég között — °F és °C átváltás
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A kalmárok nyelvén <span className="italic">(segítség: a kalmárok foka kisebb a tiédnél: 1 °C-nyi változás náluk 1,8 °F-nyi, és a víz náluk 32 °F-nál fagy meg)</span>:
        </p>
      </div>

      {isCompleted && (
        <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-4 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva a Fizika Pontkövetőben.'}
          </p>
          {(submissionState?.responseSummary || (valA && valB && valC)) && (
            <p className="italic text-[#2E1B14]/80">
              {submissionState?.responseSummary || `a) ${valA} °C | b) ${valB} °C | c) ${valC} °F`}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>a)</strong> A forró ösvény felirata: 122 °F. Hány °C ez?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="Celsius érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>b)</strong> A gázló kövén ez állt: 293 K. Hány °C ez?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                placeholder="Celsius érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>c)</strong> Egy nyugati kalmár ma 30 °C-ot mért a vásárban. Hány °F ez az ő skáláján?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={valC}
                onChange={(e) => setValC(e.target.value)}
                placeholder="Fahrenheit érték megadása..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°F</span>
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
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 select-none pointer-events-auto"
          >
            <Send className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">
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
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#2E1B14]/20 hover:bg-[#FAF8F2] text-[#2E1B14] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none pointer-events-auto"
              title="Válaszok törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none hidden sm:inline">Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Task: l5_d_lazas
 * Tűz és jég között — Lázas-e a király?
 */
export const TaskLazasL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const saved = getSavedTaskState('l5_d_lazas');

  const [celsiusVal, setCelsiusVal] = useState(
    saved?.answers?.celsius !== undefined ? String(saved.answers.celsius) : ''
  );
  const [lazasChoice, setLazasChoice] = useState<boolean | null>(
    typeof saved?.answers?.lazas === 'boolean' ? saved.answers.lazas : null
  );
  const [kulonbsegVal, setKulonbsegVal] = useState(
    saved?.answers?.kulonbseg !== undefined ? String(saved.answers.kulonbseg) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(Boolean(saved?.completed));

  const isCompleted = isCorrect || Boolean(submissionState?.isCompleted);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.itemCode === 'l5_d_lazas') {
        const fresh = getSavedTaskState('l5_d_lazas');
        if (fresh?.completed) {
          setIsCorrect(true);
          if (fresh.answers) {
            if (fresh.answers.celsius !== undefined) setCelsiusVal(String(fresh.answers.celsius));
            if (typeof fresh.answers.lazas === 'boolean') setLazasChoice(fresh.answers.lazas);
            if (fresh.answers.kulonbseg !== undefined) setKulonbsegVal(String(fresh.answers.kulonbseg));
          }
        }
      }
    };
    window.addEventListener('mero-miska-book-updated', handleStorageUpdate);
    return () => window.removeEventListener('mero-miska-book-updated', handleStorageUpdate);
  }, []);

  const handleReset = () => {
    setCelsiusVal('');
    setLazasChoice(null);
    setKulonbsegVal('');
    setIsCorrect(false);
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numCelsius = parseDecimalWithNegative(celsiusVal);
    const numKulonbseg = parseDecimalWithNegative(kulonbsegVal);

    if (numCelsius === null || lazasChoice === null || numKulonbseg === null) {
      setErrorMessage('Kérlek, válaszolj mindhárom (a, b és c) kérdésre!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const studentAnswer = {
      celsius: numCelsius,
      lazas: lazasChoice === true,
      kulonbseg: numKulonbseg,
    };

    // Physics check:
    // a) 101.3 °F -> (101.3 - 32) / 1.8 = 69.3 / 1.8 = 38.5 °C
    // b) Lázas-e? 38.5 > 37.5 -> IGEN (true)
    // c) 38.5 - 36.6 = 1.9 °C
    const isAnswerPhysicallyCorrect =
      Math.abs(numCelsius - 38.5) < 0.25 &&
      lazasChoice === true &&
      Math.abs(numKulonbseg - 1.9) < 0.25;

    try {
      const res = await checkAndSubmitTask({
        item: 'l5_d_lazas',
        answer: studentAnswer,
        points: 1,
        note: 'Tűz és jég között — lázas-e a király',
        topic: 'Mérés',
      });

      setIsSubmitting(false);

      if (res.success && res.correct) {
        handleSuccess(res.totalPoints, res.message);
        return;
      }

      if (isAnswerPhysicallyCorrect) {
        const scoreRes = await submitTaskScore({
          item: 'l5_d_lazas',
          points: 1,
          note: 'Tűz és jég között — lázas-e a király (38.5 °C, Lázas, +1.9 °C)',
          mode: 'once',
          answers: studentAnswer,
          topic: 'Mérés',
        });
        await saveTaskStateToBook('l5_d_lazas', studentAnswer, 1, 'Tűz és jég között — lázas-e a király');
        handleSuccess(scoreRes.totalPoints || res.totalPoints, scoreRes.message);
      } else {
        soundFx.playWoodTap?.();
        setErrorMessage(
          res.message ||
            'A válaszod még nem pontos. Képlet: T(°C) = (101,3 - 32) / 1,8. Hasonlítsd össze a 37,5 °C és 36,6 °C értékekkel, majd próbáld újra!'
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      if (isAnswerPhysicallyCorrect) {
        await saveTaskStateToBook('l5_d_lazas', studentAnswer, 1, 'Tűz és jég között — lázas-e a király');
        handleSuccess(undefined, 'Helyes válasz! Pont jóváírva a Fizika Pontkövetőben.');
      } else {
        setErrorMessage('A válaszod még nem pontos. Nézd át a számításokat, majd próbáld újra!');
      }
    }
  };

  const handleSuccess = (totalPoints?: number, message?: string) => {
    setIsCorrect(true);
    soundFx.playSuccess?.();
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
    });
    setFeedbackMessage(message || 'Helyes válasz! 1 pont jóváírva a Fizika Pontkövetőben.');
    if (totalPoints && onPointsUpdated) {
      onPointsUpdated(totalPoints);
    }
    if (onCompleted) {
      onCompleted();
    }
    if (onSubmitted) {
      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        submittedAt: new Date().toISOString(),
        responseSummary: `a) ${celsiusVal} °C | b) ${lazasChoice ? 'Lázas' : 'Nem lázas'} | c) +${kulonbsegVal} °C`,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-5 sm:p-6 rounded-2xl border transition-all relative z-30 select-text ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              Tűz és jég között — Lázas-e a király?
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: 1 pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+1 p)
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A királylány kérése: a király lázmérője 101,3 °F-ot mutat. Lázasnak a 37,5 °C feletti testhőmérsékletet tekintjük; az ember normális testhőmérséklete 36,6 °C.
        </p>
      </div>

      {isCompleted && (
        <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] mb-4 space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva a Fizika Pontkövetőben.'}
          </p>
          {(submissionState?.responseSummary || (celsiusVal && kulonbsegVal)) && (
            <p className="italic text-[#2E1B14]/80">
              {submissionState?.responseSummary ||
                `a) ${celsiusVal} °C | b) ${lazasChoice ? 'Lázas' : 'Nem lázas'} | c) +${kulonbsegVal} °C`}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>a)</strong> Hány °C a király testhőmérséklete?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={celsiusVal}
                onChange={(e) => setCelsiusVal(e.target.value)}
                placeholder="Testhőmérséklet °C-ban..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>b)</strong> Lázas-e a király?
            </label>
            <div className="flex items-center gap-3 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setLazasChoice(true);
                  soundFx.playWoodTap?.();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`flex-1 py-2.5 px-3 rounded-xl font-serif font-bold text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 pointer-events-auto ${
                  lazasChoice === true
                    ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md ring-2 ring-[#B85042]/30'
                    : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042] hover:bg-[#B85042]/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5 pointer-events-none" />
                <span className="pointer-events-none">Lázas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLazasChoice(false);
                  soundFx.playWoodTap?.();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`flex-1 py-2.5 px-3 rounded-xl font-serif font-bold text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 pointer-events-auto ${
                  lazasChoice === false
                    ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md ring-2 ring-[#B85042]/30'
                    : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042] hover:bg-[#B85042]/5'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5 pointer-events-none" />
                <span className="pointer-events-none">Nem lázas</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2E1B14] mb-1">
              <strong>c)</strong> Hány fokkal van a normális testhőmérséklet (36,6 °C) felett?
            </label>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={kulonbsegVal}
                onChange={(e) => setKulonbsegVal(e.target.value)}
                placeholder="Eltérés °C-ban..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text select-text pointer-events-auto"
              />
              <span className="text-xs font-bold text-[#5A4232] shrink-0">°C</span>
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
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 select-none pointer-events-auto"
          >
            <Send className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">
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
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#2E1B14]/20 hover:bg-[#FAF8F2] text-[#2E1B14] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none pointer-events-auto"
              title="Válaszok törlése és újrakezdés"
            >
              <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none hidden sm:inline">Újrakezdés</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Universal dispatcher for Lesson 5 tasks
 */
export const TaskHomersekletL5: React.FC<
  BaseTaskProps & { taskCode: 'l5_a_kulonbseg' | 'l5_b_kelvin' | 'l5_c_fahrenheit' | 'l5_d_lazas' | string }
> = ({ taskCode, ...props }) => {
  switch (taskCode) {
    case 'l5_a_kulonbseg':
      return <TaskKulonbsegL5 {...props} />;
    case 'l5_b_kelvin':
      return <TaskKelvinL5 {...props} />;
    case 'l5_c_fahrenheit':
      return <TaskFahrenheitL5 {...props} />;
    case 'l5_d_lazas':
      return <TaskLazasL5 {...props} />;
    default:
      return null;
  }
};
