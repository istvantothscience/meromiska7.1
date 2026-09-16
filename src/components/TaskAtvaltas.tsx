import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Send, HelpCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitTaskScore } from '../lib/supabase';
import type { TaskSubmissionState } from '../types';

interface TaskAtvaltasProps {
  submissionState?: TaskSubmissionState;
  onSubmitted: (state: TaskSubmissionState) => void;
  isProjectorMode?: boolean;
}

export const TaskAtvaltas: React.FC<TaskAtvaltasProps> = ({
  submissionState,
  onSubmitted,
  isProjectorMode = false,
}) => {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    correctCount?: number;
    passed?: boolean;
    details?: { q1: boolean; q2: boolean; q3: boolean };
    message?: string;
  } | null>(null);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);

  // Normalizes numbers replacing comma with dot
  const parseNum = (str: string) => {
    const cleaned = str.trim().replace(',', '.');
    return parseFloat(cleaned);
  };

  const isCompleted = submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

    const n1 = parseNum(val1);
    const n2 = parseNum(val2);
    const n3 = parseNum(val3);

    // Question 1: 350 cm = ? m -> 3.5
    const q1Correct = !isNaN(n1) && Math.abs(n1 - 3.5) < 0.001;
    // Question 2: 1.2 km = ? m -> 1200
    const q2Correct = !isNaN(n2) && Math.abs(n2 - 1200) < 0.001;
    // Question 3: 45 mm = ? cm -> 4.5
    const q3Correct = !isNaN(n3) && Math.abs(n3 - 4.5) < 0.001;

    let correctCount = 0;
    if (q1Correct) correctCount++;
    if (q2Correct) correctCount++;
    if (q3Correct) correctCount++;

    const passed = correctCount >= 2;

    if (passed) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
        });
      } catch {
        // ignore confetti errors
      }

      setIsSubmitting(true);
      const res = await submitTaskScore({
        item: 'l1_a_atvaltas',
        points: 1,
        note: 'Mértékegység-átváltás — A híd próbája',
        mode: 'once',
      });
      setIsSubmitting(false);

      setFeedback({
        passed: true,
        correctCount,
        details: { q1: q1Correct, q2: q2Correct, q3: q3Correct },
        message: res.message || 'Kiváló munka! Legalább 2 helyes átváltás megvan. 1 pont jóváírva!',
      });

      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        responseSummary: `350 cm = ${val1} m | 1,2 km = ${val2} m | 45 mm = ${val3} cm (${correctCount}/3)`,
      });
    } else {
      setFeedback({
        passed: false,
        correctCount,
        details: { q1: q1Correct, q2: q2Correct, q3: q3Correct },
        message: `Még nem elegendő: ${correctCount}/3 helyes. Legalább 2 helyes átváltás szükséges az 1 ponthoz! Figyelj a váltószámokra (1 m = 100 cm, 1 km = 1000 m, 1 cm = 10 mm).`,
      });
    }
  };

  return (
    <div id="task-atvaltas-container" className="p-6 md:p-8 rounded-2xl bg-[#FAF8F2] border-2 border-[#B85042]/30 shadow-md">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#B85042]/20">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#B85042] text-white flex items-center justify-center font-bold text-sm">
            1
          </span>
          <div>
            <h3 className="text-xl font-bold text-[#2E1B14] font-serif-story">
              1. Feladat: Mértékegység-átváltás
            </h3>
            <p className="text-xs text-[#2E1B14]/70">
              A zűrzavar feloldása — Számítsátok ki a pontos értékeket! (1 pontért min. 2/3 jó)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Teljesítve (1 pont)
            </span>
          )}
          {isProjectorMode && (
            <button
              id="btn-teacher-guide-atvaltas"
              type="button"
              onClick={() => setShowTeacherGuide(!showTeacherGuide)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-[#E7E8D1] text-[#2E1B14] hover:bg-[#d8d9be] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showTeacherGuide ? 'Megoldókulcs elrejtése' : 'Tanári megoldókulcs'}
            </button>
          )}
        </div>
      </div>

      {showTeacherGuide && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-semibold text-amber-900">Tanári segédlet / Helyes megoldások:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-950">
            <li><strong>350 cm = 3,5 m</strong> (1 m = 100 cm, osztás 100-zal)</li>
            <li><strong>1,2 km = 1200 m</strong> (1 km = 1000 m, szorzás 1000-rel)</li>
            <li><strong>45 mm = 4,5 cm</strong> (1 cm = 10 mm, osztás 10-zel)</li>
          </ul>
          <p className="text-[11px] text-amber-800 mt-1">
            Szabály: Tizedesvessző (3,5) és tizedespont (3.5) is elfogadott. 2 vagy 3 helyes válaszért jár az 1 pont.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Question 1 */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#2E1B14]/10">
            <label htmlFor="input-q1" className="block text-sm font-semibold text-[#2E1B14] mb-2">
              a) 350 cm = ? m
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-q1"
                type="text"
                inputMode="decimal"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                placeholder="pl. 3,5"
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-medium"
                required
              />
              <span className="font-serif text-sm text-[#2E1B14]/70">méter</span>
            </div>
            {feedback?.details && (
              <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${feedback.details.q1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {feedback.details.q1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {feedback.details.q1 ? 'Helyes (3,5 m)' : 'Nem jó (Helyes: 3,5 m)'}
              </p>
            )}
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#2E1B14]/10">
            <label htmlFor="input-q2" className="block text-sm font-semibold text-[#2E1B14] mb-2">
              b) 1,2 km = ? m
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-q2"
                type="text"
                inputMode="decimal"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                placeholder="pl. 1200"
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-medium"
                required
              />
              <span className="font-serif text-sm text-[#2E1B14]/70">méter</span>
            </div>
            {feedback?.details && (
              <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${feedback.details.q2 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {feedback.details.q2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {feedback.details.q2 ? 'Helyes (1200 m)' : 'Nem jó (Helyes: 1200 m)'}
              </p>
            )}
          </div>

          {/* Question 3 */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#2E1B14]/10">
            <label htmlFor="input-q3" className="block text-sm font-semibold text-[#2E1B14] mb-2">
              c) 45 mm = ? cm
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-q3"
                type="text"
                inputMode="decimal"
                value={val3}
                onChange={(e) => setVal3(e.target.value)}
                placeholder="pl. 4,5"
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-medium"
                required
              />
              <span className="font-serif text-sm text-[#2E1B14]/70">centiméter</span>
            </div>
            {feedback?.details && (
              <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${feedback.details.q3 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {feedback.details.q3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {feedback.details.q3 ? 'Helyes (4,5 cm)' : 'Nem jó (Helyes: 4,5 cm)'}
              </p>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
              feedback.passed ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {feedback.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{feedback.message}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#2E1B14]/60">
            Tipp: Használhatsz pontot vagy tizedesvesszőt is.
          </p>
          {(!isCompleted || isProjectorMode) && (
            <button
              id="btn-submit-atvaltas"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B85042] text-white font-medium shadow hover:bg-[#a24336] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Ellenőrzés & Mentés...' : 'Válasz beküldése (1 pont)'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
