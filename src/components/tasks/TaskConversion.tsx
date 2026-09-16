import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskConversion: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);

  // Helper to parse comma or period decimals
  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const checkCorrectness = () => {
    const v1 = parseVal(ans1);
    const v2 = parseVal(ans2);
    const v3 = parseVal(ans3);

    // 1) 350 cm = 3.5 m
    const c1 = v1 !== null && Math.abs(v1 - 3.5) < 0.001;
    // 2) 1.2 km = 1200 m
    const c2 = v2 !== null && Math.abs(v2 - 1200) < 0.001;
    // 3) 45 mm = 4.5 cm
    const c3 = v3 !== null && Math.abs(v3 - 4.5) < 0.001;

    const count = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    return { c1, c2, c3, count };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ans1 || !ans2 || !ans3) {
      setMessage('Kérlek töltsd ki mindhárom beviteli mezőt!');
      return;
    }

    const { c1, c2, c3, count } = checkCorrectness();

    if (count < 2) {
      setStatus('partial');
      setMessage(`Most ${count}/3 válasz helyes. A pontért legalább 2 helyes átváltás szükséges! Javíts a válaszaidon.`);
      return;
    }

    setStatus('submitting');
    setMessage('Próba ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l1_a_atvaltas',
      points: 1,
      note: `A híd próbája — Átváltás feladat (${count}/3 helyes)`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setPointsAwarded(res.totalPoints ?? 1);
      setMessage(
        res.isMockDemo
          ? 'Kiváló! Legalább 2 átváltás helyes. (Bejelentkezve a közös Fizika Pontkövetőbe is jóváíródik!)'
          : `Kiváló munka! Pont beírva a Pontkövetőbe! Összpontod: ${res.totalPoints ?? 'mentve'}`
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

  const { c1, c2, c3 } = checkCorrectness();
  const isDone = status === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] p-4 sm:p-6 select-text">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
            1. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l1_a_atvaltas
          </span>
          {isDone && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-2 leading-tight">
          A mértékegységek rendje
        </h3>

        <p className="text-sm sm:text-base text-[#4A382D] leading-relaxed mb-4">
          Váltsátok át a megadott mennyiségeket! Írhatsz tizedespontot és tizedesvesszőt is. A próba teljesítéséhez legalább <strong>2 helyes válasz</strong> szükséges.
        </p>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-3.5 relative z-30"
        >
          {/* Item 1 */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-3 flex items-center justify-between shadow-sm">
            <label className="font-serif text-base sm:text-lg font-bold text-[#2E1B14]">
              1) 350 cm =
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ans1}
                onChange={(e) => setAns1(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 3.5"
                className={`w-24 sm:w-28 px-3 py-1.5 text-center font-mono font-bold text-base rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone && c1
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-base text-[#5A4232]">m</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-3 flex items-center justify-between shadow-sm">
            <label className="font-serif text-base sm:text-lg font-bold text-[#2E1B14]">
              2) 1,2 km =
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ans2}
                onChange={(e) => setAns2(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 1200"
                className={`w-24 sm:w-28 px-3 py-1.5 text-center font-mono font-bold text-base rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone && c2
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-base text-[#5A4232]">m</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-3 flex items-center justify-between shadow-sm">
            <label className="font-serif text-base sm:text-lg font-bold text-[#2E1B14]">
              3) 45 mm =
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ans3}
                onChange={(e) => setAns3(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 4.5"
                className={`w-24 sm:w-28 px-3 py-1.5 text-center font-mono font-bold text-base rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone && c3
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-base text-[#5A4232]">cm</span>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-xs sm:text-sm flex items-start gap-2 ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : status === 'partial'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : status === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-300'
                  : 'bg-amber-50 text-amber-900'
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
              className="w-full mt-2 py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] active:bg-[#8F3629] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Beküldés folyamatban...' : 'Válaszok beküldése (1 pontért)'}
            </button>
          )}
        </form>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Mód: egyszer jóváírható</span>
      </div>
    </div>
  );
};
