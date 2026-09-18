import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Calculator, HelpCircle, RefreshCw } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskAveraging: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [userAvg, setUserAvg] = useState('');
  const [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [showFormula, setShowFormula] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const parseNum = (str: string) => {
    const cleaned = str.trim().replace(',', '.');
    return parseFloat(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const x1 = parseNum(val1);
    const x2 = parseNum(val2);
    const avg = parseNum(userAvg);

    if (isNaN(x1) || x1 <= 0) {
      setStatus('error');
      setMessage('Kérlek, adj meg egy érvényes pozitív számot az 1. méréshez!');
      return;
    }

    if (isNaN(x2) || x2 <= 0) {
      setStatus('error');
      setMessage('Kérlek, adj meg egy érvényes pozitív számot a 2. méréshez!');
      return;
    }

    if (isNaN(avg) || avg <= 0) {
      setStatus('error');
      setMessage('Kérlek, számítsd ki és írd be a két mérés átlagát!');
      return;
    }

    const calculatedAvg = (x1 + x2) / 2;
    // Allow slight rounding tolerance (0.05 or 1%)
    const diff = Math.abs(avg - calculatedAvg);
    const isCorrect = diff <= 0.06 || (diff / calculatedAvg) <= 0.02;

    if (!isCorrect) {
      setStatus('error');
      setMessage(
        `A beírt átlag (${avg} ${unit}) nem egyezik a két mért érték számtani közepével. Add össze a két mérést, oszd el kettővel, és próbáljátok újra!`
      );
      return;
    }

    setStatus('submitting');
    setMessage('Eredmény ellenőrzése és pont jóváírása...');

    const res = await submitTaskScore({
      item: 'l1_b_meres_atlagolas',
      points: 1,
      note: `Kétszeri mérés és átlagolás (${x1} és ${x2} ${unit} -> átlag: ${avg} ${unit})`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? `Kiváló mérési pontosság! Átlag: ${avg} ${unit}. (Bejelentkezve 1 pont a Pontkövetőben!)`
          : `Kiváló mérési pontosság! Pont beírva a Pontkövetőbe! Összpontod: ${res.totalPoints ?? 'mentve'}`
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
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
            2. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l1_b_meres_atlagolas
          </span>
          {isDone && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1 leading-tight">
          Kétszeri mérés és átlagolás
        </h3>

        <p className="text-xs sm:text-sm text-[#4A382D] leading-relaxed mb-3">
          „A híd nem nőtt meg, de én tévedhetek!” — Miska kétszer mért, hogy kiküszöbölje a véletlen hibát. Válasszatok ki egy távolságot a teremben (vagy a füzeten), mérjétek le kétszer, majd számítsátok ki az átlagot!
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-serif">
            <span className="text-[#8C6D58]">Mértékegység:</span>
            <button
              type="button"
              disabled={isDone}
              onClick={() => setUnit('m')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                unit === 'm' ? 'bg-[#B85042] text-white font-bold' : 'bg-[#EAE2D0] text-[#5A4232]'
              }`}
            >
              Méter (m)
            </button>
            <button
              type="button"
              disabled={isDone}
              onClick={() => setUnit('cm')}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                unit === 'cm' ? 'bg-[#B85042] text-white font-bold' : 'bg-[#EAE2D0] text-[#5A4232]'
              }`}
            >
              Centiméter (cm)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-[#8B261D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            {showFormula ? 'Képlet elrejtése' : 'Átlag képlete'}
          </button>
        </div>

        {showFormula && (
          <div className="p-2.5 bg-[#FAF4E5] border border-[#DFCDB3] rounded-lg text-xs text-[#5A4232] mb-3 space-y-1 animate-fadeIn">
            <div className="font-bold text-[#8B261D]">A számtani közép (átlag) képlete:</div>
            <div className="font-mono text-center py-1 text-xs bg-white rounded border border-[#DFCDB3]">
              Átlag = (1. mérés + 2. mérés) ÷ 2
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-2.5 relative z-30"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/90 p-2 rounded-lg border border-[#C8B89E]">
              <label className="block text-[11px] font-bold text-[#5A4232] uppercase mb-1">
                1. mérés ({unit}):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder=""
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>

            <div className="bg-white/90 p-2 rounded-lg border border-[#C8B89E]">
              <label className="block text-[11px] font-bold text-[#5A4232] uppercase mb-1">
                2. mérés ({unit}):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder=""
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>
          </div>

          <div className="bg-[#FAF4E5] p-2.5 rounded-lg border border-[#C6923C]/50">
            <label className="block text-xs font-bold text-[#8B261D] uppercase mb-1">
              3. Számított átlag ({unit}):
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={userAvg}
              onChange={(e) => setUserAvg(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLInputElement).focus();
              }}
              disabled={isDone}
              placeholder=""
              className="w-full px-3 py-2 text-sm sm:text-base font-bold bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
            />
          </div>

          {message && (
            <div
              className={`p-2.5 rounded-md text-xs flex items-start gap-1.5 ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}
            >
              {status === 'success' ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}

          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] active:bg-[#8F3629] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Számítás ellenőrzése...' : 'Átlag ellenőrzése & Mentés (1 pont)'}
            </button>
          )}
        </form>
      </div>

      <div className="mt-3 pt-2 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Kétszeri mérés elve</span>
      </div>
    </div>
  );
};
