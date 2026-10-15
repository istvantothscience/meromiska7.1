import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Sun, CloudRain, Lock } from 'lucide-react';
import { checkAndSubmitTask, getSavedTaskState } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

const ITEM_CODE = 'l6_c_igazhamis';

export const TaskIgazHamisL6: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [valasz, setValasz] = useState<boolean | null>(null);
  const [indoklas, setIndoklas] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'wrong' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Restore saved book state from Supabase / local mirror
  useEffect(() => {
    const syncFromSaved = () => {
      const saved = getSavedTaskState(ITEM_CODE);
      if (saved?.completed) {
        if (typeof saved.answers?.valasz === 'boolean') {
          setValasz(saved.answers.valasz);
        }
        if (typeof saved.answers?.indoklas === 'string') {
          setIndoklas(saved.answers.indoklas);
        }
        setStatus('success');
        setMessage('Kitöltve és elmentve a könyvbe! (+1 pont)');
      }
    };
    syncFromSaved();
    window.addEventListener('mero-miska-book-updated', syncFromSaved);
    return () => window.removeEventListener('mero-miska-book-updated', syncFromSaved);
  }, [user]);

  // Prevent flipbook from dragging on task inputs (bubble phase, never block click)
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

  const isDone = status === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDone) return;

    if (valasz === null) {
      setStatus('wrong');
      setMessage('Kérlek válaszd ki, hogy az állítás IGAZ vagy HAMIS!');
      return;
    }

    setStatus('submitting');
    setMessage('Válasz ellenőrzése a szerveren...');

    const res = await checkAndSubmitTask({
      item: ITEM_CODE,
      answer: {
        valasz,
        indoklas: indoklas.trim(),
      },
      points: 1,
      note: 'A toronyóra-készítő — napóra igaz/hamis',
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
            1. Próbatétel
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
          A napóra titka — Igaz vagy hamis?
        </h3>

        <div className="p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-xl mb-3.5 shadow-2xs">
          <p className="font-serif text-base sm:text-lg font-bold text-[#2E1B14] leading-snug">
            „A napóra éjszaka és borult időben is jól használható.”
          </p>
          <p className="font-sans text-xs sm:text-sm text-[#4A382D] mt-1">
            Igaz vagy hamis a fenti állítás?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={status === 'submitting'}
              onClick={() => {
                setValasz(true);
                soundFx.playWoodTap();
              }}
              className={`py-3 px-4 rounded-xl border-2 font-serif font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                valasz === true
                  ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md scale-[1.01]'
                  : 'bg-white/90 text-[#2E1B14] border-[#A7BEAE] hover:border-[#B85042]'
              }`}
            >
              <Sun className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Igaz</span>
            </button>

            <button
              type="button"
              disabled={status === 'submitting'}
              onClick={() => {
                setValasz(false);
                soundFx.playWoodTap();
              }}
              className={`py-3 px-4 rounded-xl border-2 font-serif font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                valasz === false
                  ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md scale-[1.01]'
                  : 'bg-white/90 text-[#2E1B14] border-[#A7BEAE] hover:border-[#B85042]'
              }`}
            >
              <CloudRain className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Hamis</span>
            </button>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-[#A7BEAE]">
            <label className="block text-xs font-bold text-[#2E1B14] mb-1">
              Rövid szöveges indoklás / reflexió <span className="font-normal text-[#7A6150]">(nem kötelező a pontszámhoz)</span>:
            </label>
            <textarea
              rows={2}
              value={indoklas}
              onChange={(e) => setIndoklas(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              disabled={isDone}
              placeholder="Miért gondolod így? Írd le röviden..."
              className={`w-full px-3 py-2 text-xs sm:text-sm font-sans rounded-lg border transition-all resize-none select-text ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-medium'
                  : 'bg-white border-[#C8B89E] text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042]'
              }`}
            />
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
              <span>A feladat megoldása véglegesítve a könyvben</span>
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
