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

export const TaskItalmeroL3: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [litersGiven, setLitersGiven] = useState('');
  const [isCheating, setIsCheating] = useState<string>('');
  const [missingMl, setMissingMl] = useState('');
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
    const vLiters = parseVal(litersGiven);
    const vMl = parseVal(missingMl);

    // a) 8 * 3 dl = 24 dl = 2.4 liters (tolerance ±0.001)
    const cA = vLiters !== null && Math.abs(vLiters - 2.4) < 0.001;

    // b) Csal-e? -> igen
    const cB = isCheating.trim().toLowerCase() === 'igen';

    // c) Hány ml hiányzik? 3000 ml - 2400 ml = 600 ml (tolerance ±1 ml)
    const cC = vMl !== null && Math.abs(vMl - 600) <= 1;

    const count = (cA ? 1 : 0) + (cB ? 1 : 0) + (cC ? 1 : 0);
    return { cA, cB, cC, count };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttempted(true);

    if (!litersGiven.trim() || !isCheating || !missingMl.trim()) {
      setMessage('Kérlek, válaszolj mind a három kérdésre (a, b és c)!');
      return;
    }

    const { cA, cB, cC, count } = checkCorrectness();

    if (count < 3) {
      setStatus('partial');
      setMessage(`Jelenleg ${count}/3 válasz helyes. A pont megszerzéséhez mindhárom részfeladatot helyesen kell megoldani!`);
      return;
    }

    setStatus('submitting');
    setMessage('Számítások ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l3_b_ketlepes',
      points: 1,
      note: 'A vásár csalói — 3. óra',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? 'Kiváló nyomozás! Leleplezted az italmérő trükkjét. (Bejelentkezve a pont is jóváíródik!)'
          : 'Sikeres leleplezés! Mindhárom válasz pontos, +1 pont jóváírva a Pontkövetőben!'
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

  const { cA, cB, cC } = checkCorrectness();
  const isDone = status === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] p-4 sm:p-5 select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            2. Próba
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l3_b_ketlepes
          </span>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1p)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          Az italmérő trükkje
        </h3>
        <p className="font-serif text-xs text-[#5A4232] leading-relaxed mb-3">
          A csuklyás italmérő <strong>3 dl-es</strong> pohárral <strong>8 pohárnyit</strong> mért ki a vevőnek, miközben fennhangon azt állította, hogy pontosan <strong>3 litert</strong> adott.
        </p>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-3 relative z-30"
        >
          {/* Question a */}
          <div
            className={`border rounded-lg p-2.5 flex flex-col gap-1.5 shadow-xs transition-colors ${
              hasAttempted
                ? cA
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14]">
                a) Hány litert adott ki valójában?
              </label>
              {hasAttempted && (
                cA ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={litersGiven}
                onChange={(e) => setLitersGiven(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 2,4"
                className={`w-28 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && cA)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !cA
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232]">liter (l)</span>
            </div>
          </div>

          {/* Question b */}
          <div
            className={`border rounded-lg p-2.5 flex flex-col gap-1.5 shadow-xs transition-colors ${
              hasAttempted
                ? cB
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14]">
                b) Csal-e az italmérő kalmár?
              </label>
              {hasAttempted && (
                cB ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-serif text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="cheating"
                  value="igen"
                  checked={isCheating === 'igen'}
                  onChange={(e) => setIsCheating(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isDone}
                  className="accent-[#B85042] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#2E1B14]">Igen, csal</span>
              </label>
              <label className="flex items-center gap-1.5 font-serif text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="cheating"
                  value="nem"
                  checked={isCheating === 'nem'}
                  onChange={(e) => setIsCheating(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isDone}
                  className="accent-[#B85042] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#2E1B14]">Nem csal</span>
              </label>
            </div>
          </div>

          {/* Question c */}
          <div
            className={`border rounded-lg p-2.5 flex flex-col gap-1.5 shadow-xs transition-colors ${
              hasAttempted
                ? cC
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3]'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14]">
                c) Hány milliliter (ml) hiányzik az ígért mennyiséghez képest?
              </label>
              {hasAttempted && (
                cC ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={missingMl}
                onChange={(e) => setMissingMl(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 600"
                className={`w-28 px-2.5 py-1 text-center font-mono font-bold text-sm rounded border transition-all cursor-text relative z-40 select-text ${
                  isDone || (hasAttempted && cC)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !cC
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#C8B89E] bg-white text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
                }`}
              />
              <span className="font-serif font-bold text-sm text-[#5A4232]">ml hiány</span>
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
              <span>{status === 'submitting' ? 'Ellenőrzés folyamatban...' : 'Leleplezés beküldése (1 pont)'}</span>
            </button>
          )}
        </form>
      </div>

      <div className="pt-2 border-t border-[#DFCDB3] text-[11px] text-[#8C6D58] font-serif flex items-center justify-between">
        <span>Központi Fizika Pontkövető</span>
        <span className="font-mono">l3_b_ketlepes</span>
      </div>
    </div>
  );
};
