import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Lock, Timer } from 'lucide-react';
import { checkAndSubmitTask, getSavedTaskState } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

const ITEM_CODE = 'l6_a_szamolj';

export const TaskSzamoljL6: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lengesido, setLengesido] = useState('');
  const [fellengesido, setFellengesido] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'wrong' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState(ITEM_CODE);
      if (saved?.completed) {
        if (saved.answers?.t !== undefined) {
          setLengesido(String(saved.answers.t).replace('.', ','));
        }
        if (saved.answers?.fel_t !== undefined) {
          setFellengesido(String(saved.answers.fel_t).replace('.', ','));
        }
        setStatus('success');
        setMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, [user]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopCapturing = (e: Event) => {
      e.stopPropagation();
    };
    el.addEventListener('pointerdown', stopCapturing, { capture: true });
    el.addEventListener('mousedown', stopCapturing, { capture: true });
    el.addEventListener('touchstart', stopCapturing, { capture: true });
    el.addEventListener('click', stopCapturing, { capture: true });
    return () => {
      el.removeEventListener('pointerdown', stopCapturing, { capture: true });
      el.removeEventListener('mousedown', stopCapturing, { capture: true });
      el.removeEventListener('touchstart', stopCapturing, { capture: true });
      el.removeEventListener('click', stopCapturing, { capture: true });
    };
  }, []);

  const parseNum = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    if (!clean) return null;
    const num = Number(clean);
    return Number.isFinite(num) ? num : null;
  };

  const isDone = status === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDone) return;

    const tVal = parseNum(lengesido);
    const felTVal = parseNum(fellengesido);

    if (tVal === null || felTVal === null) {
      setStatus('wrong');
      setMessage('Kérlek adj meg érvényes számot mindkét mezőben (tizedesvessző vagy tizedespont is használható)!');
      return;
    }

    setStatus('submitting');
    setMessage('Számítás ellenőrzése a szerveren...');

    const res = await checkAndSubmitTask({
      item: ITEM_CODE,
      answer: {
        t: tVal,
        fel_t: felTVal,
      },
      points: 1,
      note: 'A toronyóra-készítő — lengésidő-számítás',
      category: 'feladat',
    });

    if (!res.success) {
      setStatus('error');
      setMessage(res.message);
      return;
    }

    if (!res.correct) {
      soundFx.playError();
      setStatus('wrong');
      setMessage(res.message);
      return;
    }

    soundFx.playSuccess();
    setStatus('success');
    setMessage(res.message);
    if (res.totalPoints && onPointsUpdated) {
      onPointsUpdated(res.totalPoints);
    }
    if (onCompleted) {
      onCompleted();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-between pt-14 sm:pt-16 px-4 sm:px-6 pb-5 text-[#2E1B14] select-text overflow-y-auto relative z-30"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            3. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            {ITEM_CODE}
          </span>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Kitöltve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2E1B14] mb-2 leading-tight">
          Számolj! — Lengésidő és féllengésidő
        </h3>

        <div className="p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-xl mb-3.5 shadow-2xs">
          <p className="font-serif text-sm sm:text-base font-bold text-[#2E1B14] leading-snug flex items-start gap-2">
            <Timer className="w-4 h-4 text-[#B85042] shrink-0 mt-1" />
            <span>
              Egy csapat 10 lengés idejét mérte: 20,4 másodperc. Mennyi a lengésidő (T)? Mennyi a féllengésidő?
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Lengésidő (T) */}
          <div className="bg-white/90 border border-[#A7BEAE] rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              Lengésidő (T):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={lengesido}
                onChange={(e) => setLengesido(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="..."
                className={`w-24 sm:w-28 px-3 py-2 text-center font-mono font-bold text-base rounded-lg border-2 transition-all select-text ${
                  isDone
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-[#B85042]/50 bg-white text-[#2E1B14] focus:outline-none focus:border-[#B85042] focus:ring-2 focus:ring-[#B85042]/20'
                }`}
              />
              <span className="font-sans text-xs sm:text-sm font-bold text-[#5A4232]">
                másodperc
              </span>
            </div>
          </div>

          {/* Féllengésidő */}
          <div className="bg-white/90 border border-[#A7BEAE] rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <label className="font-serif text-sm sm:text-base font-bold text-[#2E1B14]">
              Féllengésidő:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={fellengesido}
                onChange={(e) => setFellengesido(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="..."
                className={`w-24 sm:w-28 px-3 py-2 text-center font-mono font-bold text-base rounded-lg border-2 transition-all select-text ${
                  isDone
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-[#B85042]/50 bg-white text-[#2E1B14] focus:outline-none focus:border-[#B85042] focus:ring-2 focus:ring-[#B85042]/20'
                }`}
              />
              <span className="font-sans text-xs sm:text-sm font-bold text-[#5A4232]">
                másodperc
              </span>
            </div>
          </div>

          {message && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
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

          {!isDone ? (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#9E3F32] text-white font-serif font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Ellenőrzés...' : 'Ellenőrzöm (1 pont)'}
            </button>
          ) : (
            <div className="w-full py-2 px-3 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>A számításod véglegesítve a könyvben</span>
            </div>
          )}
        </form>
      </div>

      <div className="mt-2 pt-2 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Szerveroldali ellenőrzés</span>
      </div>
    </div>
  );
};
