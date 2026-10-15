import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Lock, Clock } from 'lucide-react';
import { checkAndSubmitTask, getSavedTaskState } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

const ITEM_CODE = 'l6_b_valts_at';

export const TaskValtsAtL6: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ertek, setErtek] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'wrong' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState(ITEM_CODE);
      if (saved?.completed) {
        if (saved.answers?.ertek !== undefined) {
          setErtek(String(saved.answers.ertek));
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

  const parseNum = (str: string): number | null => {
    const clean = str.trim().replace(/\s+/g, '').replace(',', '.');
    if (!clean) return null;
    const num = Number(clean);
    return Number.isFinite(num) ? num : null;
  };

  const isDone = status === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDone) return;

    const numVal = parseNum(ertek);
    if (numVal === null) {
      setStatus('wrong');
      setMessage('Kérlek adj meg egy érvényes számot!');
      return;
    }

    setStatus('submitting');
    setMessage('Átváltás ellenőrzése a szerveren...');

    const res = await checkAndSubmitTask({
      item: ITEM_CODE,
      answer: {
        ertek: numVal,
      },
      points: 1,
      note: 'A toronyóra-készítő — idő-átváltás',
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
            4. Próbatétel
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
          Válts át! — Időegységek
        </h3>

        <div className="p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-xl mb-4 shadow-2xs">
          <p className="font-serif text-base sm:text-lg font-bold text-[#2E1B14] leading-snug flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B85042] shrink-0" />
            <span>2 óra hány másodperc?</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="bg-white/90 border border-[#A7BEAE] rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <label className="font-serif text-base sm:text-lg font-bold text-[#2E1B14]">
              2 óra =
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={ertek}
                onChange={(e) => setErtek(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="..."
                className={`w-28 sm:w-32 px-3 py-2 text-center font-mono font-bold text-base rounded-lg border-2 transition-all select-text ${
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
              <span>Az átváltásod véglegesítve a könyvben</span>
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
