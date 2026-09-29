import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Info, FileText } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskReveszIndoklas: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  // 1) Unit unification: 750 ml in dl = 7.5 dl
  const [conversionVal, setConversionVal] = useState('');
  // 2) Scientific reasoning: why volume alone is not enough
  const [reasoning, setReasoning] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const checkReasoningKeywords = (text: string): boolean => {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const keywords = [
      'anyag',
      'tartalom',
      'tomeg',
      'nehezebb',
      'konnyebb',
      'suruseg',
      'bor',
      'viz',
      'fajsuly',
      'kulonbozo',
      'mas az anyag',
    ];
    return keywords.some((k) => lower.includes(k));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const num = parseVal(conversionVal);
    if (num === null) {
      setStatus('error');
      setMessage('Kérlek add meg a mértékegység-egységesítés numerikus eredményét!');
      return;
    }

    // 750 ml = 7.5 dl
    const isMathCorrect = Math.abs(num - 7.5) < 0.05;
    if (!isMathCorrect) {
      setStatus('error');
      setMessage('A mértékegység-átváltás nem pontos. Gondold át: 1 dl = 100 ml, hány dl 750 ml?');
      return;
    }

    const trimmedReasoning = reasoning.trim();
    if (trimmedReasoning.length < 20) {
      setStatus('error');
      setMessage(`Az indoklás túl rövid (${trimmedReasoning.length}/20 betű). Kérlek fejtsd ki részletesebben a választ legalább egy kerek mondatban!`);
      return;
    }

    const hasKeywords = checkReasoningKeywords(trimmedReasoning);
    if (!hasKeywords) {
      setStatus('error');
      setMessage('Jó gondolat, de próbáljatok konkrétabban utalni az anyag minőségére, a tömegre vagy arra, hogy a bor és a víz sűrűsége nem egyforma. Egészítsd ki a választ!');
      return;
    }

    setStatus('submitting');
    setMessage('Indoklás ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l2_c_indoklas',
      points: 1,
      note: 'A révész hordói — 2. óra: Vegyes mértékegység és indoklás',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
      });
      setStatus('success');
      setPointsAwarded(1);
      setMessage(res.message || 'Kiváló indoklás! 1 fizika pont jóváírva a Pontkövetőben.');
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

  const isDone = status === 'success';

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-text">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded font-bold">
              3. Próba
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-1.5 py-0.5 rounded">
              l2_c_indoklas
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-[#8B261D] bg-[#FFF2B2] px-2 py-0.5 rounded border border-[#E5B842]">
            1 pont
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          Egységesítés és fizikusi indoklás
        </h3>
        <p className="text-xs text-[#5A4232] mb-3 leading-relaxed">
          Egységesítsd a korsó űrmértékét, majd indokold meg, miért nem elég csupán a térfogatot ismerni a hamisítás leleplezéséhez!
        </p>

        {/* Info toggle */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1 text-xs text-[#8B261D] hover:underline font-serif italic cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showFormula ? 'Magyarázat elrejtése' : 'Űrmértékek és folyadékok összefüggése'}</span>
          </button>
        </div>

        {showFormula && (
          <div className="mb-3 p-3 bg-[#FAF4E5] border border-[#C8B89E] rounded-lg text-xs text-[#4A382D] space-y-1 animate-fadeIn">
            <div className="font-bold text-[#8B261D]">Űrmértékek átváltása:</div>
            <div className="font-mono text-center py-1 text-xs bg-white rounded border border-[#DFCDB3]">
              1 l = 10 dl = 100 cl = 1000 ml = 1 dm³
            </div>
            <p className="text-[11px] text-[#7A6150]">
              Két hordó kívülről lehet pontosan azonos térfogatú, de a bennük lévő folyadék (bor, ecet, víz vagy olaj) tömege és sűrűsége eltérhet!
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Part 1: Unit unification */}
          <div className="p-3 bg-white/70 rounded-xl border border-[#DFCDB3]">
            <label className="block text-xs font-serif font-bold text-[#2E1B14] mb-1">
              1. A révész orvosságos korsójában <strong>750 ml</strong> gyógyital van. Hány deciliter (dl) ez?
            </label>
            <div className="flex items-center gap-2 max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                value={conversionVal}
                onChange={(e) => setConversionVal(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder=""
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text text-center font-mono font-bold"
              />
              <span className="font-serif font-bold text-sm text-[#5A4232]">dl</span>
            </div>
          </div>

          {/* Part 2: Reasoning text */}
          <div className="p-3 bg-white/80 rounded-xl border border-[#DFCDB3]">
            <label className="block text-xs font-serif font-bold text-[#8B261D] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>2. Fizikusi indoklás: Miért nem elég csak a térfogatot megmérni?</span>
            </label>
            <textarea
              rows={3}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLTextAreaElement).focus();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              disabled={isDone}
              placeholder="Írd le a saját indoklásodat..."
              className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-[#8C6D58] mt-1">
              <span>Hosszúság: {reasoning.trim().length} / min. 20 betű</span>
              <span>(Tipp: gondolj a tömegre, az anyagra vagy a sűrűségre)</span>
            </div>
          </div>

          {/* Submit Button */}
          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-50 text-white font-serif font-bold text-xs sm:text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'submitting' ? 'Ellenőrzés...' : 'Válasz beküldése (1 pont)'}</span>
            </button>
          )}
        </form>
      </div>

      {/* Feedback */}
      <div className="mt-3">
        {status === 'error' && message && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{message}</div>
          </div>
        )}

        {status === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Próba Sikeres!</span>
                <span className="text-[11px] text-emerald-700">{message}</span>
              </div>
            </div>
            {pointsAwarded !== null && (
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs shrink-0 ml-2">
                +{pointsAwarded} pont
              </span>
            )}
          </div>
        )}

        {!user && (
          <p className="text-[11px] text-[#8C6D58] italic text-center mt-2">
            💡 Jelentkezz be a 2. oldalon a pontok mentéséhez!
          </p>
        )}
      </div>
    </div>
  );
};
