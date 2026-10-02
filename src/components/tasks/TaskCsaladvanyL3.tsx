import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Send, HelpCircle, Lightbulb } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

interface AncientUnitConfig {
  name: string;
  factor: number;
  modernUnit: string;
  label: string;
}

export const ANCIENT_UNITS: Record<string, AncientUnitConfig> = {
  lab: { name: 'láb', factor: 32, modernUnit: 'cm', label: '1 láb = 32 cm' },
  rof: { name: 'rőf', factor: 78, modernUnit: 'cm', label: '1 rőf = 78 cm' },
  col: { name: 'col', factor: 2.54, modernUnit: 'cm', label: '1 col = 2,54 cm' },
  font: { name: 'font', factor: 560, modernUnit: 'g', label: '1 font = 560 g' },
  icce: { name: 'icce', factor: 850, modernUnit: 'ml', label: '1 icce = 850 ml' },
  ako: { name: 'akó', factor: 54000, modernUnit: 'ml', label: '1 akó = 54 000 ml' },
};

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskCsaladvanyL3: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('lab');
  const [claimedQty, setClaimedQty] = useState(''); // q
  const [measuredQty, setMeasuredQty] = useState(''); // m
  const [scaleResolution, setScaleResolution] = useState(''); // d
  const [studentConverted, setStudentConverted] = useState(''); // x
  const [studentDiff, setStudentDiff] = useState(''); // e
  const [studentVerdict, setStudentVerdict] = useState<string>(''); // 'csal' | 'nem_csal'

  const [hasAttempted, setHasAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const selectedUnit = ANCIENT_UNITS[selectedUnitKey] || ANCIENT_UNITS.lab;

  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const evaluateData = () => {
    const q = parseVal(claimedQty);
    const m = parseVal(measuredQty);
    const d = parseVal(scaleResolution);
    const x = parseVal(studentConverted);
    const e = parseVal(studentDiff);

    const validBasic = q !== null && q > 0 && m !== null && m >= 0 && d !== null && d > 0;
    if (!validBasic) {
      return {
        isValid: false,
        validBasic: false,
        errorHint: 'A mennyiségnek (q > 0), a mért értéknek (m ≥ 0) és a beosztásnak (d > 0) pozitív számnak kell lennie.',
      };
    }

    // Reference calculations
    // x* = q * factor
    const xStar = q * selectedUnit.factor;
    const isXCorrect = x !== null && Math.abs(x - xStar) <= 0.01 * xStar;

    // e* = |x* - m|
    const eStar = Math.abs(xStar - m);
    const isECorrect = e !== null && Math.abs(e - eStar) <= 0.01 * xStar;

    // verdict: e* >= 2 * d ? 'csal' : 'nem_csal'
    const expectedVerdict = eStar >= 2 * d ? 'csal' : 'nem_csal';
    const isVerdictCorrect = studentVerdict === expectedVerdict;

    const allCorrect = isXCorrect && isECorrect && isVerdictCorrect;

    return {
      isValid: true,
      validBasic: true,
      q,
      m,
      d,
      x,
      e,
      xStar,
      eStar,
      expectedVerdict,
      isXCorrect,
      isECorrect,
      isVerdictCorrect,
      allCorrect,
    };
  };

  const loadExample = (type: 'posztos' | 'gyogyfu' | 'ital') => {
    if (type === 'posztos') {
      setSelectedUnitKey('lab');
      setClaimedQty('3');
      setMeasuredQty('80'); // 3 * 32 = 96 cm, measured 80 cm, diff 16 cm, d = 1 cm -> 16 >= 2*1 -> csal
      setScaleResolution('1');
      setStudentConverted('96');
      setStudentDiff('16');
      setStudentVerdict('csal');
    } else if (type === 'gyogyfu') {
      setSelectedUnitKey('font');
      setClaimedQty('0.5'); // 0.5 * 560 = 280 g
      setMeasuredQty('279'); // diff 1 g, d = 1 g -> 1 < 2*1 -> nem csal
      setScaleResolution('1');
      setStudentConverted('280');
      setStudentDiff('1');
      setStudentVerdict('nem_csal');
    } else {
      setSelectedUnitKey('icce');
      setClaimedQty('0.5'); // 0.5 * 850 = 425 ml
      setMeasuredQty('350'); // diff 75 ml, d = 5 ml -> 75 >= 2*5 -> csal
      setScaleResolution('5');
      setStudentConverted('425');
      setStudentDiff('75');
      setStudentVerdict('csal');
    }
    setHasAttempted(false);
    setMessage(null);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setHasAttempted(true);

    const evalResult = evaluateData();
    if (!evalResult.validBasic) {
      setStatus('partial');
      setMessage(evalResult.errorHint || 'Kérlek töltsd ki az alapvető mérési adatokat!');
      return;
    }

    if (!studentVerdict) {
      setStatus('partial');
      setMessage('Kérlek válaszd ki a saját ítéletedet is (Csal / Nem csal)!');
      return;
    }

    if (!evalResult.allCorrect) {
      setStatus('partial');
      const hints: string[] = [];
      if (!evalResult.isXCorrect) {
        hints.push(`az átváltott érték eltér a képlettől (x* = q · ${selectedUnit.factor})`);
      }
      if (!evalResult.isECorrect) {
        hints.push('a kiszámolt eltérés (e) nem egyezik a |x* − m| képlettel');
      }
      if (!evalResult.isVerdictCorrect) {
        hints.push('az ítélet nem felel meg a szabálynak: akkor csal, ha az eltérés legalább 2-szerese a mérőeszköz beosztásának (e* ≥ 2·d)');
      }
      setMessage(`A beadott kulcsban ellentmondás van: ${hints.join(', ')}. Javíts a számaidon!`);
      return;
    }

    setStatus('submitting');
    setMessage('Feladvány és kulcs ellenőrzése, pont beküldése...');

    const res = await submitTaskScore({
      item: 'l3_c_feladvany',
      points: 1,
      note: 'A vásár csalói — 3. óra',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      setStatus('success');
      setMessage(
        res.isMockDemo
          ? 'Kiváló logika! A beadott feladvány és megoldókulcs belsőleg ellentmondás-mentes és helyes!'
          : 'Bravó! A csalás-feladvány logikailag hibátlan, +1 pont jóváírva a Pontkövetőben!'
      );
      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
    } else {
      setStatus('error');
      setMessage(res.message || 'Hiba történt a pont beküldése során.');
    }
  };

  const evalResult = evaluateData();
  const isDone = status === 'success';

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] pt-6 sm:pt-8 px-3.5 sm:px-6 pb-4 select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            3. Próba
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l3_c_feladvany
          </span>
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Teljesítve (+1p)
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D]">
            Csalás-feladvány & Megoldókulcs
          </h3>
          {/* Quick preset buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => loadExample('posztos')}
              className="text-[10px] px-1.5 py-0.5 bg-[#FAF4E5] hover:bg-[#EAE0CD] text-[#7A4E38] rounded border border-[#DFCDB3] font-serif cursor-pointer"
              title="Posztós példája (láb)"
            >
              Posztós
            </button>
            <button
              type="button"
              onClick={() => loadExample('gyogyfu')}
              className="text-[10px] px-1.5 py-0.5 bg-[#FAF4E5] hover:bg-[#EAE0CD] text-[#7A4E38] rounded border border-[#DFCDB3] font-serif cursor-pointer"
              title="Gyógyfűárus példája (font)"
            >
              Gyógyfű
            </button>
            <button
              type="button"
              onClick={() => loadExample('ital')}
              className="text-[10px] px-1.5 py-0.5 bg-[#FAF4E5] hover:bg-[#EAE0CD] text-[#7A4E38] rounded border border-[#DFCDB3] font-serif cursor-pointer"
              title="Italmérő példája (icce)"
            >
              Italmérő
            </button>
          </div>
        </div>

        <p className="font-serif text-[11px] sm:text-xs text-[#5A4232] leading-relaxed mb-2.5">
          Találjatok ki egy saját csalós kalmárt, vagy vigyetek be egy valós vásári mérést! Az app a megoldókulcs belső összhangját ellenőrzi (átváltás → eltérés → ítélet).
        </p>

        <form
          onSubmit={handleSubmit}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="space-y-2 relative z-30 text-xs"
        >
          {/* Unit selection */}
          <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg p-2 flex items-center justify-between">
            <label className="font-serif font-bold text-[#2E1B14]">
              Régi mértékegység:
            </label>
            <select
              value={selectedUnitKey}
              onChange={(e) => setSelectedUnitKey(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isDone}
              className="px-2 py-1 bg-white font-serif font-bold text-xs rounded border border-[#C8B89E] text-[#2E1B14] cursor-pointer"
            >
              {Object.entries(ANCIENT_UNITS).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.label} ({u.modernUnit})
                </option>
              ))}
            </select>
          </div>

          {/* Grid of basic data: q, m, d */}
          <div className="grid grid-cols-3 gap-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                const inp = (e.currentTarget as HTMLElement).querySelector('input');
                inp?.focus();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-[#F8F5EC] border border-[#DFCDB3] hover:border-[#8B261D]/50 rounded-lg p-2 text-center cursor-text transition-colors"
            >
              <span className="block text-[10px] font-serif text-[#7A4E38] font-bold">
                Állított mennyiség (q)
              </span>
              <div className="flex items-center justify-center gap-1 mt-1 relative z-50">
                <input
                  type="text"
                  inputMode="decimal"
                  value={claimedQty}
                  onChange={(e) => setClaimedQty(e.target.value)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  disabled={isDone}
                  placeholder="pl. 3"
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white cursor-text select-text"
                />
                <span className="font-serif text-[10px]">{selectedUnit.name}</span>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                const inp = (e.currentTarget as HTMLElement).querySelector('input');
                inp?.focus();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-[#F8F5EC] border border-[#DFCDB3] hover:border-[#8B261D]/50 rounded-lg p-2 text-center cursor-text transition-colors"
            >
              <span className="block text-[10px] font-serif text-[#7A4E38] font-bold">
                Mért érték (m)
              </span>
              <div className="flex items-center justify-center gap-1 mt-1 relative z-50">
                <input
                  type="text"
                  inputMode="decimal"
                  value={measuredQty}
                  onChange={(e) => setMeasuredQty(e.target.value)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  disabled={isDone}
                  placeholder="pl. 80"
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white cursor-text select-text"
                />
                <span className="font-serif text-[10px]">{selectedUnit.modernUnit}</span>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                const inp = (e.currentTarget as HTMLElement).querySelector('input');
                inp?.focus();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-[#F8F5EC] border border-[#DFCDB3] hover:border-[#8B261D]/50 rounded-lg p-2 text-center cursor-text transition-colors"
            >
              <span className="block text-[10px] font-serif text-[#7A4E38] font-bold">
                Legkisebb beosztás (d)
              </span>
              <div className="flex items-center justify-center gap-1 mt-1 relative z-50">
                <input
                  type="text"
                  inputMode="decimal"
                  value={scaleResolution}
                  onChange={(e) => setScaleResolution(e.target.value)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  }}
                  disabled={isDone}
                  placeholder="pl. 1"
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white cursor-text select-text"
                />
                <span className="font-serif text-[10px]">{selectedUnit.modernUnit}</span>
              </div>
            </div>
          </div>

          {/* Student's solution key: x, e, and verdict */}
          <div className="p-2.5 bg-[#F4EEDF] border border-[#DFCDB3] rounded-lg space-y-2">
            <div className="font-serif font-bold text-[11px] text-[#8B261D] flex items-center justify-between">
              <span>A páros megoldókulcsa:</span>
              <span className="font-mono text-[10px] text-[#7A4E38]">
                Szabály: Csal, ha eltérés ≥ 2 · beosztás
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-[#E0D4BE] hover:border-[#8B261D]/50 cursor-text transition-colors"
              >
                <label className="font-serif text-[11px] font-bold text-[#2E1B14] cursor-pointer">
                  Átváltott (x):
                </label>
                <div className="flex items-center gap-1 relative z-50">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={studentConverted}
                    onChange={(e) => setStudentConverted(e.target.value)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    disabled={isDone}
                    placeholder="q · átváltás"
                    className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white cursor-text select-text"
                  />
                  <span className="text-[10px]">{selectedUnit.modernUnit}</span>
                  {hasAttempted && evalResult.validBasic && (
                    evalResult.isXCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-[#E0D4BE] hover:border-[#8B261D]/50 cursor-text transition-colors"
              >
                <label className="font-serif text-[11px] font-bold text-[#2E1B14] cursor-pointer">
                  Eltérés (e):
                </label>
                <div className="flex items-center gap-1 relative z-50">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={studentDiff}
                    onChange={(e) => setStudentDiff(e.target.value)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLInputElement).focus();
                    }}
                    disabled={isDone}
                    placeholder="|x - m|"
                    className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white cursor-text select-text"
                  />
                  <span className="text-[10px]">{selectedUnit.modernUnit}</span>
                  {hasAttempted && evalResult.validBasic && (
                    evalResult.isECorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Verdict selector */}
            <div className="flex items-center justify-between bg-white/90 p-1.5 rounded border border-[#E0D4BE]">
              <label className="font-serif text-[11px] font-bold text-[#2E1B14]">
                Ítélet:
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 font-serif text-[11px] cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    value="csal"
                    checked={studentVerdict === 'csal'}
                    onChange={(e) => setStudentVerdict(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isDone}
                    className="accent-[#B85042]"
                  />
                  <span className="font-bold text-rose-800">Csal (e ≥ 2·d)</span>
                </label>
                <label className="flex items-center gap-1 font-serif text-[11px] cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    value="nem_csal"
                    checked={studentVerdict === 'nem_csal'}
                    onChange={(e) => setStudentVerdict(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isDone}
                    className="accent-[#B85042]"
                  />
                  <span className="font-bold text-emerald-800">Nem csal (e &lt; 2·d)</span>
                </label>
                {hasAttempted && evalResult.validBasic && (
                  evalResult.isVerdictCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
              className="w-full py-1.5 px-4 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-50 text-white font-serif font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer relative z-30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{status === 'submitting' ? 'Ellenőrzés folyamatban...' : 'Kulcs és ítélet beküldése (1 pont)'}</span>
            </button>
          )}
        </form>
      </div>

      <div className="pt-1.5 border-t border-[#DFCDB3] text-[10px] text-[#8C6D58] font-serif flex items-center justify-between">
        <span>Központi Fizika Pontkövető</span>
        <span className="font-mono">l3_c_feladvany</span>
      </div>
    </div>
  );
};
