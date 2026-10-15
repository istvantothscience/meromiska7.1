import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { checkAndSubmitTask } from '../../lib/supabase';
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

// Hook to prevent flipbook drag when clicking/typing in inputs
const usePreventFlipbookDrag = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopCapture = (e: Event) => {
      e.stopPropagation();
    };
    el.addEventListener('pointerdown', stopCapture, { capture: true });
    el.addEventListener('mousedown', stopCapture, { capture: true });
    el.addEventListener('touchstart', stopCapture, { capture: true });
    el.addEventListener('click', stopCapture, { capture: true });
    return () => {
      el.removeEventListener('pointerdown', stopCapture, { capture: true });
      el.removeEventListener('mousedown', stopCapture, { capture: true });
      el.removeEventListener('touchstart', stopCapture, { capture: true });
      el.removeEventListener('click', stopCapture, { capture: true });
    };
  }, []);
  return containerRef;
};

/**
 * Task: l5_a_kulonbseg
 */
export const TaskKulonbsegL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [valC, setValC] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

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

    const res = await checkAndSubmitTask({
      item: 'l5_a_kulonbseg',
      answer: studentAnswer,
      points: 1,
      note: 'Tűz és jég között — hőmérséklet-különbségek',
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
          responseSummary: `a) ${valA} °C | b) ${valB} °C | c) ${valC} °C`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Nézd át újra a kérdéseket és a különbségeket, majd próbáld újra!');
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
              Tűz és jég között — Hőmérséklet-különbségek
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
        <p className="font-serif text-xs sm:text-sm font-semibold text-[#5A4232]">
          A kapuőr három kérdése a varázsüveghez:
        </p>
      </div>

      {isCompleted ? (
        <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott értékek: {submissionState.responseSummary}</p>
          )}
        </div>
      ) : (
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
                  placeholder="pl. 13"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. 100"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. 23"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center gap-2 shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : 'Ellenőrzöm'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * Task: l5_b_kelvin
 */
export const TaskKelvinL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [valC, setValC] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

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

    const res = await checkAndSubmitTask({
      item: 'l5_b_kelvin',
      answer: studentAnswer,
      points: 1,
      note: 'Tűz és jég között — °C és K átváltás',
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
          responseSummary: `a) ${valA} K | b) ${valB} K | c) ${valC} °C`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Nézd át az abszolút skála (Kelvin) és Celsius közti átszámolást, majd próbáld újra!');
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
              Tűz és jég között — °C és K átváltás
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
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A csillagvizsgálók nyelvén <span className="italic">(segítség: a csillagvizsgálók foka ugyanakkora, mint a tiéd, csak máshonnan indul, ezért az átszámolás egyetlen művelet)</span>:
        </p>
      </div>

      {isCompleted ? (
        <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott értékek: {submissionState.responseSummary}</p>
          )}
        </div>
      ) : (
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
                  placeholder="pl. 298"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. 263"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. -20"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center gap-2 shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : 'Ellenőrzöm'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * Task: l5_c_fahrenheit
 */
export const TaskFahrenheitL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [valC, setValC] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

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

    const res = await checkAndSubmitTask({
      item: 'l5_c_fahrenheit',
      answer: studentAnswer,
      points: 1,
      note: 'Tűz és jég között — °F és °C átváltás',
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
          responseSummary: `a) ${valA} °C | b) ${valB} °C | c) ${valC} °F`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Nézd át újra a Fahrenheit-skálát és az átszámolást, majd próbáld újra!');
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
              Tűz és jég között — °F és °C átváltás
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
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A kalmárok nyelvén <span className="italic">(segítség: a kalmárok foka kisebb a tiédnél: 1 °C-nyi változás náluk 1,8 °F-nyi, és a víz náluk 32 °F-nál fagy meg)</span>:
        </p>
      </div>

      {isCompleted ? (
        <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott értékek: {submissionState.responseSummary}</p>
          )}
        </div>
      ) : (
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
                  placeholder="pl. 50"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. 20"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  placeholder="pl. 86"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center gap-2 shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : 'Ellenőrzöm'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * Task: l5_d_lazas
 */
export const TaskLazasL5: React.FC<BaseTaskProps> = ({
  submissionState,
  onSubmitted,
  onPointsUpdated,
  onCompleted,
  isProjectorMode = false,
}) => {
  const containerRef = usePreventFlipbookDrag();
  const [celsiusVal, setCelsiusVal] = useState('');
  const [lazasChoice, setLazasChoice] = useState<boolean | null>(null);
  const [kulonbsegVal, setKulonbsegVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const isCompleted = isCorrect || submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

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

    const res = await checkAndSubmitTask({
      item: 'l5_d_lazas',
      answer: studentAnswer,
      points: 1,
      note: 'Tűz és jég között — lázas-e a király',
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
          responseSummary: `a) ${celsiusVal} °C | b) ${lazasChoice ? 'Lázas' : 'Nem lázas'} | c) +${kulonbsegVal} °C`,
        });
      }
    } else {
      soundFx.playWoodTap?.();
      setErrorMessage(res.message || 'A válaszod még nem pontos. Számold át újra a testhőmérsékletet °C-ra és a láz mértékét, majd próbáld újra!');
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
              Tűz és jég között — Lázas-e a király?
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
        <p className="font-serif text-xs sm:text-sm text-[#5A4232] leading-relaxed">
          A királylány kérése: a király lázmérője 101,3 °F-ot mutat. Lázasnak a 37,5 °C feletti testhőmérsékletet tekintjük; az ember normális testhőmérséklete 36,6 °C.
        </p>
      </div>

      {isCompleted ? (
        <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedbackMessage || 'Sikeres próbatétel! 1 pont jóváírva.'}
          </p>
          {submissionState?.responseSummary && (
            <p className="italic text-[#2E1B14]/80">Megadott válaszok: {submissionState.responseSummary}</p>
          )}
        </div>
      ) : (
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
                  placeholder="pl. 38,5"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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
                  onClick={() => setLazasChoice(true)}
                  className={`flex-1 py-2 px-3 rounded-xl font-serif font-bold text-xs border transition-all cursor-pointer ${
                    lazasChoice === true
                      ? 'bg-[#B85042] text-white border-[#B85042] shadow-sm'
                      : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042]/50 hover:bg-[#B85042]/5'
                  }`}
                >
                  Lázas
                </button>
                <button
                  type="button"
                  onClick={() => setLazasChoice(false)}
                  className={`flex-1 py-2 px-3 rounded-xl font-serif font-bold text-xs border transition-all cursor-pointer ${
                    lazasChoice === false
                      ? 'bg-[#B85042] text-white border-[#B85042] shadow-sm'
                      : 'bg-white text-[#2E1B14] border-[#2E1B14]/20 hover:border-[#B85042]/50 hover:bg-[#B85042]/5'
                  }`}
                >
                  Nem lázas
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
                  placeholder="pl. 1,9"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs sm:text-sm font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center gap-2 shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés folyamatban...' : 'Ellenőrzöm'}</span>
          </button>
        </form>
      )}
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
