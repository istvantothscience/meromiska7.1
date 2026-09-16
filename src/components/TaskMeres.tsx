import React, { useState } from 'react';
import { CheckCircle2, XCircle, Send, HelpCircle, Calculator, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitTaskScore } from '../lib/supabase';
import type { TaskSubmissionState } from '../types';

interface TaskMeresProps {
  submissionState?: TaskSubmissionState;
  onSubmitted: (state: TaskSubmissionState) => void;
  isProjectorMode?: boolean;
}

export const TaskMeres: React.FC<TaskMeresProps> = ({
  submissionState,
  onSubmitted,
  isProjectorMode = false,
}) => {
  const [measuredVal, setMeasuredVal] = useState('');
  const [estimatedVal, setEstimatedVal] = useState('');
  const [percentVal, setPercentVal] = useState('');
  const [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed?: boolean;
    expectedPercent?: number;
    message?: string;
  } | null>(null);
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);

  const parseNum = (str: string) => {
    const cleaned = str.trim().replace(',', '.');
    return parseFloat(cleaned);
  };

  const isCompleted = submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

    const measured = parseNum(measuredVal);
    const estimated = parseNum(estimatedVal);
    const userPercent = parseNum(percentVal);

    if (isNaN(measured) || measured <= 0) {
      setFeedback({
        passed: false,
        message: 'Kérlek, adj meg egy érvényes pozitív mérőszalagos mérési értéket!',
      });
      return;
    }

    if (isNaN(estimated) || estimated <= 0) {
      setFeedback({
        passed: false,
        message: 'Kérlek, adj meg egy érvényes pozitív becsült értéket!',
      });
      return;
    }

    if (isNaN(userPercent) || userPercent < 0) {
      setFeedback({
        passed: false,
        message: 'Kérlek, számítsd ki és írd be az eltérés százalékos értékét!',
      });
      return;
    }

    // Mathematical formula: |measured - estimated| / measured * 100
    const expectedA = (Math.abs(measured - estimated) / measured) * 100;
    // Alternative: |measured - estimated| / estimated * 100
    const expectedB = (Math.abs(measured - estimated) / estimated) * 100;

    // Tolerance ±2% (to allow student rounding differences like 9.5% vs 10%)
    const isCloseA = Math.abs(userPercent - expectedA) <= 2.0;
    const isCloseB = Math.abs(userPercent - expectedB) <= 2.0;

    const passed = isCloseA || isCloseB;
    const standardExpected = Math.round(expectedA * 10) / 10;

    if (passed) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
        });
      } catch {
        // ignore confetti
      }

      setIsSubmitting(true);
      const res = await submitTaskScore({
        item: 'l1_b_meres',
        points: 1,
        note: 'Mérési adatrögzítés és eltérés-számítás — A híd próbája',
        mode: 'once',
      });
      setIsSubmitting(false);

      setFeedback({
        passed: true,
        expectedPercent: standardExpected,
        message: res.message || `Nagyszerű számítás! A mért (${measured} ${unit}) és becsült (${estimated} ${unit}) érték közötti eltérés pontosan ${standardExpected}%. 1 pont jóváírva!`,
      });

      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        responseSummary: `Mért: ${measured} ${unit} | Becsült: ${estimated} ${unit} | Eltérés: ${userPercent}% (Számított: ~${standardExpected}%)`,
      });
    } else {
      setFeedback({
        passed: false,
        expectedPercent: standardExpected,
        message: `A megadott százalék (${userPercent}%) nem egyezik a két számból adódó eltéréssel. A képlet: |mért - becsült| / mért × 100. A ti számotokra ez kb. ${standardExpected}% lenne. Számoljátok újra a pároddal!`,
      });
    }
  };

  return (
    <div id="task-meres-container" className="p-6 md:p-8 rounded-2xl bg-[#FAF8F2] border-2 border-[#B85042]/30 shadow-md">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#B85042]/20">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#B85042] text-white flex items-center justify-center font-bold text-sm">
            2
          </span>
          <div>
            <h3 className="text-xl font-bold text-[#2E1B14] font-serif-story">
              2. Feladat: Mérési adatrögzítés és eltérés-számítás
            </h3>
            <p className="text-xs text-[#2E1B14]/70">
              Próbáljátok ki a párral a teremben vagy füzeten: mérés szalaggal vs. lépés/arasz becslés!
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
          <button
            id="btn-formula-guide"
            type="button"
            onClick={() => setShowFormulaGuide(!showFormulaGuide)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-[#E7E8D1] text-[#2E1B14] hover:bg-[#d8d9be] transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            {showFormulaGuide ? 'Képlet elrejtése' : 'Képlet & Útmutató'}
          </button>
        </div>
      </div>

      {showFormulaGuide && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#2E1B14] space-y-2">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            Hogyan számoljátok ki a százalékos eltérést?
          </p>
          <div className="p-3 bg-white rounded-lg border border-amber-200 font-mono text-xs text-amber-900">
            Százalékos eltérés = (|mért érték - becsült érték| ÷ mért érték) × 100
          </div>
          <p className="text-amber-800">
            <strong>Példa:</strong> Ha a pad hossza mérőszalaggal <strong>120 cm</strong>, és lépéssel/arasszal <strong>108 cm</strong>-re becsültétek:
            <br />
            Különbség: |120 - 108| = 12 cm.
            <br />
            Százalék: (12 ÷ 120) × 100 = <strong>10%</strong>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#2E1B14]/80">Mértékegység:</span>
          <button
            type="button"
            onClick={() => setUnit('m')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              unit === 'm' ? 'bg-[#B85042] text-white' : 'bg-[#E7E8D1] text-[#2E1B14]'
            }`}
          >
            Méter (m)
          </button>
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              unit === 'cm' ? 'bg-[#B85042] text-white' : 'bg-[#E7E8D1] text-[#2E1B14]'
            }`}
          >
            Centiméter (cm)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Field 1: Measured */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#2E1B14]/10">
            <label htmlFor="input-measured" className="block text-sm font-semibold text-[#2E1B14] mb-1">
              1. Mérőszalaggal mért érték:
            </label>
            <p className="text-[11px] text-[#2E1B14]/60 mb-2">
              (pl. tanterem, pad vagy folyosó)
            </p>
            <div className="flex items-center gap-2">
              <input
                id="input-measured"
                type="text"
                inputMode="decimal"
                value={measuredVal}
                onChange={(e) => setMeasuredVal(e.target.value)}
                placeholder={unit === 'm' ? 'pl. 3,5' : 'pl. 350'}
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-medium"
                required
              />
              <span className="font-semibold text-sm text-[#2E1B14]/70">{unit}</span>
            </div>
          </div>

          {/* Field 2: Estimated */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#2E1B14]/10">
            <label htmlFor="input-estimated" className="block text-sm font-semibold text-[#2E1B14] mb-1">
              2. Lépéssel/arasszal becsült érték:
            </label>
            <p className="text-[11px] text-[#2E1B14]/60 mb-2">
              (ugyanazon a távon végigszámolva)
            </p>
            <div className="flex items-center gap-2">
              <input
                id="input-estimated"
                type="text"
                inputMode="decimal"
                value={estimatedVal}
                onChange={(e) => setEstimatedVal(e.target.value)}
                placeholder={unit === 'm' ? 'pl. 4,0' : 'pl. 400'}
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-medium"
                required
              />
              <span className="font-semibold text-sm text-[#2E1B14]/70">{unit}</span>
            </div>
          </div>

          {/* Field 3: Computed percentage */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#B85042]/20 bg-[#B85042]/5">
            <label htmlFor="input-percent" className="block text-sm font-semibold text-[#2E1B14] mb-1">
              3. Számított eltérés:
            </label>
            <p className="text-[11px] text-[#2E1B14]/60 mb-2">
              A párotok által kiszámított eltérés %-ban
            </p>
            <div className="flex items-center gap-2">
              <input
                id="input-percent"
                type="text"
                inputMode="decimal"
                value={percentVal}
                onChange={(e) => setPercentVal(e.target.value)}
                placeholder="pl. 14,3"
                disabled={isCompleted && !isProjectorMode}
                className="w-full px-3 py-2 rounded-lg border border-[#B85042]/30 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] font-bold"
                required
              />
              <span className="font-bold text-sm text-[#B85042]">%</span>
            </div>
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
            Nincs előre rögzített szám — a lényeg a valós páros mérés és a helyes százalékszámítás!
          </p>
          {(!isCompleted || isProjectorMode) && (
            <button
              id="btn-submit-meres"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B85042] text-white font-medium shadow hover:bg-[#a24336] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Ellenőrzés & Mentés...' : 'Mérés mentése & Pontszerzés (1 pont)'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
