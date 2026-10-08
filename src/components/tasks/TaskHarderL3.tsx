import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Send, Flame, ArrowRight, HelpCircle } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  onNextPage?: () => void;
}

export const TaskHarderL3: React.FC<Props> = ({ user, onPointsUpdated, onCompleted, onNextPage }) => {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');
  const [ans4, setAns4] = useState('');
  const [showHint, setShowHint] = useState(false);
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

    // 1) 3,75 km = 37 500 dm
    const c1 = v1 !== null && Math.abs(v1 - 37500) < 0.1;
    // 2) 4 rőf = 312 cm (1 rőf = 78 cm)
    const c2 = v2 !== null && Math.abs(v2 - 312) < 0.1;
    // 3) 2,5 kg + 35 dkg = 2850 g (2500 + 350)
    const c3 = v3 !== null && Math.abs(v3 - 2850) < 0.1;
    // 4) 6 icce = 51 dl (1 icce = 850 ml = 8,5 dl -> 6 * 8,5 = 51 dl)
    const c4 = v4 !== null && Math.abs(v4 - 51) < 0.1;

    const count = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0) + (c4 ? 1 : 0);
    return { c1, c2, c3, c4, count };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttempted(true);

    if (!ans1.trim() || !ans2.trim() || !ans3.trim() || !ans4.trim()) {
      setMessage('Kérlek, töltsd ki mind a 4 nehezebb mester-mezőt!');
      return;
    }

    const { c1, c2, c3, c4, count } = checkCorrectness();

    if (count < 4) {
      setStatus('partial');
      setMessage(`Jelenleg ${count}/4 mesterfeladat helyes. A pont megszerzéséhez mind a 4 értéknek pontosnak kell lennie!`);
      return;
    }

    setStatus('submitting');
    setMessage('Mesteri eredmények ellenőrzése és bónusz pont jóváírása...');

    const res = await submitTaskScore({
      item: 'l3_mester_atvaltas',
      points: 1,
      note: 'Vásári Mesterpróba — Nehezebb átváltások',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? 'Káprázatos mestermunka! Mind a 4 nehéz átváltást hibátlanul megoldottad!'
          : 'Kiváló mestermunka! Mind a 4 nehéz átváltás tökéletes! +1 bónusz pont jóváírva.'
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
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] pt-6 sm:pt-8 px-4 sm:px-6 pb-4 select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-amber-600 to-red-600 text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-xs">
            <Flame className="w-3.5 h-3.5" /> Mesterpróba
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l3_mester_atvaltas
          </span>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1p)
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D]">
            Vásári Mesterpróba: Nehezebb átváltások
          </h3>
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] font-serif text-[#8B261D] hover:underline flex items-center gap-1 shrink-0 pt-0.5"
            title="Segítség a számoláshoz"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Tippek elrejtése' : 'Tippek'}</span>
          </button>
        </div>

        <p className="font-serif text-xs text-[#5A4232] leading-snug mb-3">
          Többlépéses és régi mértékekkel vegyített feladványok. A számmezőkre kattintva írd be az eredményt!
        </p>

        {showHint && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 space-y-1">
            <div>• <strong>1 km</strong> = 1000 m = 10 000 dm</div>
            <div>• <strong>1 rőf</strong> = 78 cm (4 · 78 = ?)</div>
            <div>• <strong>1 kg</strong> = 1000 g, <strong>1 dkg</strong> = 10 g (2,5 kg + 35 dkg = ? g)</div>
            <div>• <strong>1 icce</strong> = 850 ml = 8,5 dl (6 · 8,5 dl = ?)</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 relative z-10">
          {/* Row 1 */}
          <div
            onClick={(e) => {
              const inp = (e.currentTarget as HTMLElement).querySelector('input');
              inp?.focus();
            }}
            className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
              hasAttempted
                ? c1
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : 'bg-rose-50/90 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
            }`}
          >
            <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
              1) 3,75 km =
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={ans1}
                onChange={(e) => setAns1(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="írj ide..."
                className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                  isDone || (hasAttempted && c1)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c1
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                }`}
              />
              <span className="font-serif font-bold text-xs text-[#5A4232] w-7">dm</span>
              {hasAttempted && (
                c1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div
            onClick={(e) => {
              const inp = (e.currentTarget as HTMLElement).querySelector('input');
              inp?.focus();
            }}
            className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
              hasAttempted
                ? c2
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : 'bg-rose-50/90 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
            }`}
          >
            <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
              2) 4 rőf posztó =
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={ans2}
                onChange={(e) => setAns2(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="írj ide..."
                className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                  isDone || (hasAttempted && c2)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c2
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                }`}
              />
              <span className="font-serif font-bold text-xs text-[#5A4232] w-7">cm</span>
              {hasAttempted && (
                c2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div
            onClick={(e) => {
              const inp = (e.currentTarget as HTMLElement).querySelector('input');
              inp?.focus();
            }}
            className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
              hasAttempted
                ? c3
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : 'bg-rose-50/90 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
            }`}
          >
            <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
              3) 2,5 kg + 35 dkg =
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={ans3}
                onChange={(e) => setAns3(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="írj ide..."
                className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                  isDone || (hasAttempted && c3)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c3
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                }`}
              />
              <span className="font-serif font-bold text-xs text-[#5A4232] w-7">g</span>
              {hasAttempted && (
                c3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div
            onClick={(e) => {
              const inp = (e.currentTarget as HTMLElement).querySelector('input');
              inp?.focus();
            }}
            className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
              hasAttempted
                ? c4
                  ? 'bg-emerald-50/90 border-emerald-300'
                  : 'bg-rose-50/90 border-rose-300'
                : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
            }`}
          >
            <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
              4) 6 icce bor =
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={ans4}
                onChange={(e) => setAns4(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="írj ide..."
                className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                  isDone || (hasAttempted && c4)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : hasAttempted && !c4
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                }`}
              />
              <span className="font-serif font-bold text-xs text-[#5A4232] w-7">dl</span>
              {hasAttempted && (
                c4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                status === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : status === 'partial'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {status === 'success' ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-serif">{message}</div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={status === 'submitting' || isDone}
            className={`w-full py-2.5 px-4 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isDone
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-amber-700 via-[#8B261D] to-[#B85042] hover:brightness-110 text-white'
            }`}
          >
            {status === 'submitting' ? (
              <span>Ellenőrzés folyamatban...</span>
            ) : isDone ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mesterpróba teljesítve (+1 pont)!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Mesterpróba ellenőrzése és beküldése</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom pagination link */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8C6D58] font-serif">
        <span className="italic">Még több gyakorlás (Hossz, Tömeg, Terület, Térfogat):</span>
        {onNextPage && (
          <button
            type="button"
            onClick={onNextPage}
            className="text-[#8B261D] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Lapozz a Gyakorló Füzethez</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
