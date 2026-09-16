import React, { useState } from 'react';
import { Globe, ExternalLink, CheckCircle2, AlertCircle, Sparkles, Send, MapPin } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskGoogleEarth: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [bridgeName, setBridgeName] = useState('');
  const [measuredLength, setMeasuredLength] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const parseNum = (str: string) => {
    const cleaned = str.trim().replace(',', '.').replace(/[^\d.]/g, '');
    return parseFloat(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bridgeName.trim() || bridgeName.trim().length < 3) {
      setStatus('error');
      setMessage('Kérlek add meg a választott híd vagy építmény nevét (legalább 3 karakter)!');
      return;
    }

    const lengthVal = parseNum(measuredLength);
    if (isNaN(lengthVal) || lengthVal < 5) {
      setStatus('error');
      setMessage('Kérlek add meg a Google Earth-ön mért hosszt méterben (legalább 5 m)!');
      return;
    }

    if (!note.trim() || note.trim().length < 10) {
      setStatus('error');
      setMessage('Kérlek írj egy rövid megfigyelést a műholdas mérésről (legalább 10 karakter)!');
      return;
    }

    setStatus('submitting');
    setMessage('Digitális mérési adat rögzítése a Pontkövetőbe...');

    const res = await submitTaskScore({
      item: 'l1_d_google_earth',
      points: 1,
      note: `Google Earth hídmérés: ${bridgeName.trim()} (${lengthVal} m) — ${note.trim()}`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? `Nagyszerű műholdas mérés! ${bridgeName}: ${lengthVal} m. (Bejelentkezve 1 pont a Pontkövetőben!)`
          : `Műholdas mérés sikeresen mentve! Pont beírva a Pontkövetőbe! Összpontod: ${res.totalPoints ?? 'mentve'}`
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
            4. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l1_d_google_earth
          </span>
          {isDone && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1 leading-tight">
          Hídmérés Google Earth műholddal
        </h3>

        <p className="text-xs text-[#4A382D] leading-relaxed mb-3">
          A modern méréstechnika már műholdak adataival dolgozik. Válassz egy hidat (akár a környékeden, akár a Dunán), és mérd le a Google Earth vonalzó eszközével!
        </p>

        {/* Quick launch link */}
        <div className="bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs text-[#2E1B14]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#B85042] shrink-0" />
            <span>Nyisd meg a műholdas térképet:</span>
          </div>
          <a
            href="https://earth.google.com/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FAF4E5] border border-[#A7BEAE] text-[#8B261D] font-bold rounded shadow-xs transition-colors"
          >
            Google Earth megnyitása <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-2 relative z-30"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/90 p-2 rounded-lg border border-[#C8B89E]">
              <label className="block text-[11px] font-bold text-[#5A4232] uppercase mb-1">
                A híd neve:
              </label>
              <input
                type="text"
                value={bridgeName}
                onChange={(e) => setBridgeName(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. Széchenyi Lánchíd"
                className="w-full px-2 py-1.5 text-xs sm:text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>

            <div className="bg-white/90 p-2 rounded-lg border border-[#C8B89E]">
              <label className="block text-[11px] font-bold text-[#5A4232] uppercase mb-1">
                Mért hossz (méter):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={measuredLength}
                onChange={(e) => setMeasuredLength(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                disabled={isDone}
                placeholder="pl. 375"
                className="w-full px-2 py-1.5 text-xs sm:text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>
          </div>

          <div className="bg-white/90 p-2 rounded-lg border border-[#C8B89E]">
            <label className="block text-[11px] font-bold text-[#5A4232] uppercase mb-1">
              Rövid tapasztalat / megfigyelés (min. 10 karakter):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLInputElement).focus();
              }}
              disabled={isDone}
              placeholder="pl. A partok közötti fesztávolságot mértem meg a vonalzóval..."
              className="w-full px-2 py-1.5 text-xs sm:text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text relative z-40 select-text"
            />
          </div>

          {message && (
            <div
              className={`p-2 rounded-md text-xs flex items-start gap-1.5 ${
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
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] active:bg-[#8F3629] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Rögzítés...' : 'Műholdas mérés beküldése (1 pont)'}
            </button>
          )}
        </form>
      </div>

      <div className="mt-2 pt-2 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Digitális térkép mérés</span>
      </div>
    </div>
  );
};
