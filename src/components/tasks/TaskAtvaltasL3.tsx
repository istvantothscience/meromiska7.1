import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Send, ArrowRight, Flame, Layers } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  onNextPage?: () => void;
}

export const TaskAtvaltasL3: React.FC<Props> = ({ user, onPointsUpdated, onCompleted, onNextPage }) => {
  // Mode: 'basic' (the curriculum 4 1-step conversions) or 'harder' (advanced challenge)
  const [mode, setMode] = useState<'basic' | 'harder'>('basic');

  // Basic 4 conversions
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');
  const [ans4, setAns4] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Harder 4 conversions (embedded challenge option)
  const [hAns1, setHAns1] = useState('');
  const [hAns2, setHAns2] = useState('');
  const [hAns3, setHAns3] = useState('');
  const [hAns4, setHAns4] = useState('');
  const [hHasAttempted, setHHasAttempted] = useState(false);
  const [hStatus, setHStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [hMessage, setHMessage] = useState<string | null>(null);

  // Helper to parse comma or period decimals
  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const checkBasicCorrectness = () => {
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

  const checkHarderCorrectness = () => {
    const v1 = parseVal(hAns1);
    const v2 = parseVal(hAns2);
    const v3 = parseVal(hAns3);
    const v4 = parseVal(hAns4);

    // 1) 3,75 km = 37 500 dm
    const c1 = v1 !== null && Math.abs(v1 - 37500) < 0.1;
    // 2) 4 rőf posztó = 312 cm (1 rőf = 78 cm)
    const c2 = v2 !== null && Math.abs(v2 - 312) < 0.1;
    // 3) 2,5 kg + 35 dkg = 2850 g
    const c3 = v3 !== null && Math.abs(v3 - 2850) < 0.1;
    // 4) 6 icce bor = 51 dl (1 icce = 850 ml = 8,5 dl)
    const c4 = v4 !== null && Math.abs(v4 - 51) < 0.1;

    const count = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0) + (c4 ? 1 : 0);
    return { c1, c2, c3, c4, count };
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttempted(true);

    if (!ans1.trim() || !ans2.trim() || !ans3.trim() || !ans4.trim()) {
      setMessage('Kérlek, töltsd ki mind a 4 átváltási mezőt!');
      return;
    }

    const { c1, c2, c3, c4, count } = checkBasicCorrectness();

    if (count < 4) {
      setStatus('partial');
      setMessage(`Jelenleg ${count}/4 átváltás helyes. A pont megszerzéséhez mind a 4 értéknek pontosnak kell lennie!`);
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
          : 'Remek! Mind a 4 átváltás tökéletes! +1 pont jóváírva a Pontkövetőben.'
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

  const handleHarderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHHasAttempted(true);

    if (!hAns1.trim() || !hAns2.trim() || !hAns3.trim() || !hAns4.trim()) {
      setHMessage('Kérlek, töltsd ki mind a 4 nehezebb mezőt!');
      return;
    }

    const { c1, c2, c3, c4, count } = checkHarderCorrectness();

    if (count < 4) {
      setHStatus('partial');
      setHMessage(`Jelenleg ${count}/4 mesterfeladat helyes. Mind a 4 értéknek pontosnak kell lennie!`);
      return;
    }

    setHStatus('submitting');
    setHMessage('Mesteri eredmények ellenőrzése és bónusz pont beküldése...');

    const res = await submitTaskScore({
      item: 'l3_mester_atvaltas',
      points: 1,
      note: 'Vásári Mesterpróba — Nehezebb átváltások',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setHStatus('success');
      setHMessage('Káprázatos mestermunka! Mind a 4 nehéz feladatot hibátlanul megoldottad! +1 bónusz pont jóváírva.');
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
    } else {
      setHStatus('error');
      setHMessage(res.message || 'Hiba történt a beküldéskor.');
    }
  };

  const { c1, c2, c3, c4 } = checkBasicCorrectness();
  const isBasicDone = status === 'success';

  const { c1: hc1, c2: hc2, c3: hc3, c4: hc4 } = checkHarderCorrectness();
  const isHarderDone = hStatus === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] pt-6 sm:pt-8 px-4 sm:px-6 pb-4 select-text overflow-y-auto">
      <div>
        {/* Top Badges and Level Switcher */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
              1. Próba
            </span>
            <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
              {mode === 'basic' ? 'l3_a_atvaltas' : 'l3_mester_atvaltas'}
            </span>
          </div>

          {/* Level Switcher Tab Buttons */}
          <div className="flex items-center bg-[#E8DEC8] p-0.5 rounded-lg border border-[#DFCDB3]">
            <button
              type="button"
              onClick={() => setMode('basic')}
              className={`px-2 py-0.5 text-[11px] font-serif font-bold rounded cursor-pointer transition-colors ${
                mode === 'basic' ? 'bg-[#8B261D] text-white shadow-xs' : 'text-[#5A4232] hover:text-[#2E1B14]'
              }`}
            >
              Alapszint
            </button>
            <button
              type="button"
              onClick={() => setMode('harder')}
              className={`px-2 py-0.5 text-[11px] font-serif font-bold rounded cursor-pointer transition-colors flex items-center gap-0.5 ${
                mode === 'harder' ? 'bg-[#8B261D] text-white shadow-xs' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>Nehezebb</span>
            </button>
          </div>
        </div>

        {mode === 'basic' ? (
          <>
            <div className="mb-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D]">
                Négy egylépéses átváltás
              </h3>
              <p className="font-serif text-xs text-[#5A4232] leading-snug">
                A vásárbíró mértékfájának megértéséhez először a mai alapegységek közötti magabiztos átváltásra van szükség. Tizedesvessző és tizedespont egyaránt elfogadott.
              </p>
            </div>

            <form onSubmit={handleBasicSubmit} className="space-y-2 relative z-10">
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
                  1) 2,4 m =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ans1}
                    onChange={(e) => setAns1(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isBasicDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isBasicDone || (hasAttempted && c1)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hasAttempted && !c1
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">cm</span>
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
                  2) 3500 g =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ans2}
                    onChange={(e) => setAns2(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isBasicDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isBasicDone || (hasAttempted && c2)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hasAttempted && !c2
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">kg</span>
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
                  3) 0,75 l =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ans3}
                    onChange={(e) => setAns3(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isBasicDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isBasicDone || (hasAttempted && c3)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hasAttempted && !c3
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">dl</span>
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
                  4) 0,8 km =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ans4}
                    onChange={(e) => setAns4(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isBasicDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isBasicDone || (hasAttempted && c4)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hasAttempted && !c4
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">m</span>
                  {hasAttempted && (
                    c4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Status message */}
              {message && (
                <div
                  className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
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
                  <div className="flex-1 font-serif text-[11px] leading-tight">{message}</div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'submitting' || isBasicDone}
                className={`w-full py-2 px-4 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isBasicDone
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#B85042] hover:bg-[#A34335] text-white'
                }`}
              >
                {status === 'submitting' ? (
                  <span>Ellenőrzés folyamatban...</span>
                ) : isBasicDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Teljesítve (+1 pont)!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ellenőrzés és beküldés (+1 pont)</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Harder Challenge Section */
          <>
            <div className="mb-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Nehezebb vásári átváltások</span>
              </h3>
              <p className="font-serif text-xs text-[#5A4232] leading-snug">
                Többlépéses és régi vásári mértékek (1 rőf = 78 cm, 1 icce = 850 ml). Kattints a mezőkbe és írd be az eredményt!
              </p>
            </div>

            <form onSubmit={handleHarderSubmit} className="space-y-2 relative z-10">
              {/* H Row 1 */}
              <div
                onClick={(e) => {
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
                  hHasAttempted
                    ? hc1
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                    : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
                }`}
              >
                <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
                  1) 3,75 km =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hAns1}
                    onChange={(e) => setHAns1(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isHarderDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isHarderDone || (hHasAttempted && hc1)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hHasAttempted && !hc1
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">dm</span>
                  {hHasAttempted && (
                    hc1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* H Row 2 */}
              <div
                onClick={(e) => {
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
                  hHasAttempted
                    ? hc2
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                    : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
                }`}
              >
                <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
                  2) 4 rőf posztó =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hAns2}
                    onChange={(e) => setHAns2(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isHarderDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isHarderDone || (hHasAttempted && hc2)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hHasAttempted && !hc2
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">cm</span>
                  {hHasAttempted && (
                    hc2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* H Row 3 */}
              <div
                onClick={(e) => {
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
                  hHasAttempted
                    ? hc3
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                    : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
                }`}
              >
                <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
                  3) 2,5 kg + 35 dkg =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hAns3}
                    onChange={(e) => setHAns3(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isHarderDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isHarderDone || (hHasAttempted && hc3)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hHasAttempted && !hc3
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">g</span>
                  {hHasAttempted && (
                    hc3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* H Row 4 */}
              <div
                onClick={(e) => {
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                className={`border rounded-lg p-2 sm:p-2.5 flex items-center justify-between shadow-xs transition-colors cursor-text ${
                  hHasAttempted
                    ? hc4
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                    : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
                }`}
              >
                <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer">
                  4) 6 icce bor =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hAns4}
                    onChange={(e) => setHAns4(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isHarderDone}
                    placeholder="írj ide..."
                    className={`w-28 sm:w-32 h-9 px-2 text-center font-mono font-bold text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                      isHarderDone || (hHasAttempted && hc4)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : hHasAttempted && !hc4
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                    }`}
                  />
                  <span className="font-serif font-bold text-xs text-[#5A4232] w-6">dl</span>
                  {hHasAttempted && (
                    hc4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Status message */}
              {hMessage && (
                <div
                  className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                    hStatus === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : hStatus === 'partial'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {hStatus === 'success' ? (
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-serif text-[11px] leading-tight">{hMessage}</div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={hStatus === 'submitting' || isHarderDone}
                className={`w-full py-2 px-4 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isHarderDone
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-amber-700 to-[#8B261D] hover:brightness-110 text-white'
                }`}
              >
                {hStatus === 'submitting' ? (
                  <span>Ellenőrzés folyamatban...</span>
                ) : isHarderDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mesterpróba teljesítve (+1 bónusz pont)!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Nehezebb próba beküldése (+1 bónusz)</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Bottom link to next page spread with flip animation */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8C6D58] font-serif border-t border-[#DFCDB3]/50">
        <span className="italic">Külön oldalon is:</span>
        {onNextPage && (
          <button
            type="button"
            onClick={onNextPage}
            className="text-[#8B261D] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Lapozz a Mesterlaborhoz (13. oldal)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
