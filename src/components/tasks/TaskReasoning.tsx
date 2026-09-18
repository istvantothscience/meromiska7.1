import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Lightbulb, PenTool } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

const REQUIRED_KEYWORDS = [
  'emberenként',
  'eltérő',
  'változik',
  'nem egyforma',
  'különböző',
];

export const TaskReasoning: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [reasoning, setReasoning] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const charCount = reasoning.trim().length;
  const lowerText = reasoning.toLowerCase();
  const matchedKeywords = REQUIRED_KEYWORDS.filter((kw) => lowerText.includes(kw));
  const hasMinChars = charCount >= 20;
  const hasKeyword = matchedKeywords.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinChars) {
      setStatus('partial');
      setMessage(`A kifejtésed még túl rövid (${charCount}/20 karakter). Fejtsd ki a gondolatodat részletesebben, teljes mondatban!`);
      return;
    }

    if (!hasKeyword) {
      setStatus('partial');
      setMessage(
        'Jó úton jársz, de használd legalább az egyik kulcsfogalmat a fizikai indoklásban: ' +
        '„emberenként”, „eltérő”, „változik”, „nem egyforma”, „különböző”!'
      );
      return;
    }

    setStatus('submitting');
    setMessage('Indoklás vizsgálata és pont jóváírása...');

    const res = await submitTaskScore({
      item: 'l1_c_indoklas',
      points: 1,
      note: `A híd próbája — Indoklás (${matchedKeywords.join(', ')})`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? 'Remek fizikai érvelés! (Bejelentkezve a Pontkövető fiókodban is jóváíródik az 1 pont!)'
          : `Remek fizikai érvelés! Pont beírva a Pontkövetőbe! Összpontod: ${res.totalPoints ?? 'mentve'}`
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
            3. Próbatétel
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l1_c_indoklas
          </span>
          {isDone && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1 pont)
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-2 leading-tight">
          A fizikus indoklása
        </h3>

        <p className="text-sm text-[#4A382D] leading-relaxed mb-3">
          Miért nem megbízható mértékegység a lépés vagy az arasz, ha pontos eredményre van szükség?
        </p>

        {/* Guidance tip box */}
        <div className="bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg p-2.5 mb-3 flex items-start gap-2 text-xs text-[#3E3027]">
          <Lightbulb className="w-4 h-4 text-[#B85042] shrink-0 mt-0.5" />
          <div>
            <strong>Útmutató a pontszerzéshez:</strong> Írj legalább 20 karaktert, és indoklásodban szerepeljen legalább egy a következő szavak közül:{' '}
            <span className="italic font-medium text-[#8B261D]">
              „emberenként”, „eltérő”, „változik”, „nem egyforma”, „különböző”
            </span>.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="space-y-2.5 relative z-30"
        >
          <div className="relative">
            <textarea
              rows={4}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLTextAreaElement).focus();
              }}
              disabled={isDone}
              placeholder="Írd le a saját indoklásodat..."
              className="w-full p-3 font-serif text-sm sm:text-base leading-relaxed bg-white border border-[#C8B89E] rounded-lg text-[#2E1B14] placeholder:text-[#9F8C7C] focus:outline-none focus:ring-2 focus:ring-[#B85042] resize-none cursor-text relative z-40 select-text"
            />
            <div className="flex items-center justify-between text-xs px-1 text-[#7A6150]">
              <span className={hasMinChars ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                {charCount} / 20 karakter minimum
              </span>
              <span className={hasKeyword ? 'text-emerald-700 font-medium' : 'text-[#8C6D58]'}>
                {matchedKeywords.length > 0
                  ? `Felismerve: ${matchedKeywords.join(', ')}`
                  : 'Kulcsszóra vár...'}
              </span>
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
              {status === 'submitting' ? 'Értékelés folyamatban...' : 'Indoklás beküldése (1 pontért)'}
            </button>
          )}
        </form>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Jutalom: <strong>1 Fizika Pont</strong></span>
        <span>Mód: szöveges érvelés</span>
      </div>
    </div>
  );
};
