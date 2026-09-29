import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskAtvaltasL3: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');
  const [ans4, setAns4] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

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
    const v4 = parseVal(ans4);

    // 1) 2,4 m = 240 cm
    const c1 = v1 !== null && Math.abs(v1 - 240) < 0.001;
    // 2) 3500 g = 3,5 kg
    const c2 = v2 !== null && Math.abs(v2 - 3.5) < 0.001;
    // 3) 0,75 l = 7,5 dl
    const c3 = v3 !== null && Math.abs(v3 - 7.5) < 0.001;
    // 4) 0,8 km = 800 m
    const c4 = v4 !== null && Math.abs(v4 - 800) < 0.001;

    const count = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0) + (c4 ? 1 : 0);
    return { c1, c2, c3, c4, count };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttempted(true);

    if (!ans1.trim() || !ans2.trim() || !ans3.trim() || !ans4.trim()) {
      setMessage('Kérlek, töltsd ki mind a 4 átváltási mezőt!');
      return;
    }

    const { c1, c2, c3, c4, count } = checkCorrectness();

    if (count < 4) {
      setStatus('partial');
      setMessage(`Jelenleg ${count}/4 átváltás helyes. A pont megszerzéséhez mind a 4 értéknek helyesnek kell lennie!`);
      return;
    }

    setStatus('submitting');
    setMessage('Eredmények ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l3_a_atvaltas',
      points: 1,
      note: 'A vásár csalói — 3. óra',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? 'Kiváló munka! Mind a 4 átváltás pontos. (Bejelentkezve a Pontkövetőbe is jóváíródik!)'
          : `Remek! Mind a 4 átváltás tökéletes! +1 pont jóváírva a Pontkövetőben.`
      );
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
    } else {
      setStatus('error');
      setMessage(res.message || 'Hiba történt a beküldéskor.');
    }
  };

  const { c1, c2, c3, c4 } = checkCorrectness();
  const isDone = status === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] p-4 sm:p-5 select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            1. Próba
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l3_a_atvaltas
          </span>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1p)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          Négy egylépéses átváltás
        </h3>
        <p className="font-serif text-xs text-[#5A4232] leading-relaxed mb-3">
          A vásárbíró mértékfájának megértéséhez először a mai alapegységek közötti magabiztos átváltásra van szükség. Tizedesvessző és tizedespont egyaránt elfogadott.
        </p>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-2.5 relative z-30"
        >
          {/* Row 1 */}
          <div
            className={`border rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-colors ${
              hasAttempted
                ? c1
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              1) 2,4 m =
            </label>
            <div className="flex items-center gap-1.5">
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
                placeholder=""
                className={`w-24 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && c1)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c1
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] w-6">cm</span>
              {hasAttempted && (
                c1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div
            className={`border rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-colors ${
              hasAttempted
                ? c2
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              2) 3500 g =
            </label>
            <div className="flex items-center gap-1.5">
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
                placeholder=""
                className={`w-24 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && c2)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c2
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] w-6">kg</span>
              {hasAttempted && (
                c2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div
            className={`border rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-colors ${
              hasAttempted
                ? c3
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              3) 0,75 l =
            </label>
            <div className="flex items-center gap-1.5">
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
                placeholder=""
                className={`w-24 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && c3)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c3
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] w-6">dl</span>
              {hasAttempted && (
                c3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div
            className={`border rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-colors ${
              hasAttempted
                ? c4
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              4) 0,8 km =
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={ans4}
                onChange={(e) => setAns4(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder=""
                className={`w-24 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && c4)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c4
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] w-6">m</span>
              {hasAttempted && (
                c4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                status === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : status === 'partial'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : status === 'error'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full py-2 px-4 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-50 text-white font-serif font-bold text-xs sm:text-sm rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer relative z-30"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'submitting' ? 'Ellenőrzés folyamatban...' : 'Próba beküldése (1 pont)'}</span>
            </button>
          )}
        </form>
      </div>

      <div className="pt-2 border-t border-[#DFCDB3] text-[11px] text-[#8C6D58] font-serif flex items-center justify-between">
        <span>Központi Fizika Pontkövető</span>
        <span className="font-mono">l3_a_atvaltas</span>
      </div>
    </div>
  );
};
