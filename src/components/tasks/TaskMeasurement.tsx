import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Ruler, Footprints, Send } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskMeasurement: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [tapeMeasure, setTapeMeasure] = useState('');
  const [stepEstimate, setStepEstimate] = useState('');
  const [objectName, setObjectName] = useState('A tanterem padlója');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [discrepancy, setDiscrepancy] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) || num <= 0 ? null : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tape = parseVal(tapeMeasure);
    const estimate = parseVal(stepEstimate);

    if (tape === null || estimate === null) {
      setMessage('Kérlek adj meg érvényes, pozitív számértéket mindkét mezőben (cm-ben)!');
      return;
    }

    // Calculate percentage discrepancy: |a - b| / a * 100
    const diffPct = Math.round((Math.abs(tape - estimate) / tape) * 1000) / 10;
    setDiscrepancy(diffPct);

    setStatus('submitting');
    setMessage('Mérési adatok rögzítése és pont jóváírása...');

    const res = await submitTaskScore({
      item: 'l1_b_meres',
      points: 1,
      note: `A híd próbája — Pármérés (${objectName}: szalag=${tape}cm, lépés=${estimate}cm, eltérés=${diffPct}%)`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? `Mérés sikeresen elmentve! Az eltérés: ${diffPct}%. (Bejelentkezve a pont is elmentődik a Pontkövetőben!)`
          : `Kiváló pármunka! Pont beírva a Pontkövetőbe! Összpontod: ${res.totalPoints ?? 'mentve'}`
      );
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
    } else {
      setStatus('error');
      setMessage(res.message);
    }
  };

  const isDone = status === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] p-4 sm:p-6 select-text">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
            2. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l1_b_meres
          </span>
          {isDone && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1.5 leading-tight">
          Pármunka: Mérőszalag vs. lépés és arasz
        </h3>

        <p className="text-xs sm:text-sm text-[#4A382D] leading-relaxed mb-3.5">
          Mérjétek meg párban a tanterem hosszát (vagy egy kijelölt tárgyat) kétféleképpen:
          egyszer szabványos mérőszalaggal, egyszer pedig lépéssel/arasszal becsülve.
          A feladat célja a reflexió: <strong>mindkét érték beírásakor jár az 1 pont!</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Target Name */}
          <div>
            <label className="block text-xs font-bold text-[#5A4232] uppercase tracking-wider mb-1">
              Mért tárgy vagy távolság:
            </label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              disabled={isDone}
              placeholder="pl. Tanterem hossza, pad szélessége"
              className="w-full px-3 py-1.5 text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]"
            />
          </div>

          {/* Tape Measure Input */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Ruler className="w-4 h-4 text-[#B85042]" />
              <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
                1) Szabvány mérőszalaggal mért érték:
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tapeMeasure}
                onChange={(e) => setTapeMeasure(e.target.value)}
                disabled={isDone}
                placeholder="pl. 640"
                className="w-full px-3 py-1.5 font-mono font-bold text-base bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]"
              />
              <span className="font-serif font-bold text-base text-[#5A4232]">cm</span>
            </div>
          </div>

          {/* Step Estimate Input */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Footprints className="w-4 h-4 text-[#8C6D58]" />
              <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
                2) Lépéssel vagy arasszal becsült érték:
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stepEstimate}
                onChange={(e) => setStepEstimate(e.target.value)}
                disabled={isDone}
                placeholder="pl. 580"
                className="w-full px-3 py-1.5 font-mono font-bold text-base bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]"
              />
              <span className="font-serif font-bold text-base text-[#5A4232]">cm</span>
            </div>
          </div>

          {discrepancy !== null && (
            <div className="bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg p-3 text-xs sm:text-sm text-[#2E1B14]">
              <div className="font-bold flex items-center gap-1.5 text-[#2E1B14] mb-1">
                <Sparkles className="w-4 h-4 text-[#B85042]" />
                Kiszámított eltérés: {discrepancy}%
              </div>
              <p className="text-xs text-[#4A382D]">
                {discrepancy < 5
                  ? 'Kivételesen pontos becslés! Majdnem megegyezik a mérőszalagos szabvánnyal.'
                  : discrepancy < 20
                  ? 'Észrevehető eltérés! Pontosan ez a különbség vezetett veszekedéshez a mese hídján.'
                  : 'Jelentős eltérés! Jól példázza, hogy az emberi lépés miért nem alkalmas szabványos építéshez.'}
              </p>
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-md text-xs sm:text-sm flex items-start gap-2 ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : status === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-300'
                  : 'bg-amber-50 text-amber-900 border border-amber-300'
              }`}
            >
              {status === 'success' ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}

          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full mt-1 py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] active:bg-[#8F3629] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Rögzítés folyamatban...' : 'Mérési adatok beküldése (1 pontért)'}
            </button>
          )}
        </form>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Mód: reflexiós pármunka</span>
      </div>
    </div>
  );
};
