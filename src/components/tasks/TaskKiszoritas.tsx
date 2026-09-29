import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Info,
  Droplets,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../../types';
import type { DisplacementData } from '../simulation/DisplacementSimulation';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  simulationData?: DisplacementData | null;
}

export const TaskKiszoritas: React.FC<Props> = ({
  user,
  onPointsUpdated,
  onCompleted,
  simulationData,
}) => {
  const [unit, setUnit] = useState<'ml' | 'cm3'>('ml');
  const [vInitial, setVInitial] = useState('');
  const [vFinal, setVFinal] = useState('');
  const [vCalculated, setVCalculated] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  // Sync simulation data when received from opposite page
  useEffect(() => {
    if (simulationData) {
      setVInitial(String(simulationData.vInitial));
      setVFinal(String(simulationData.vFinal));
      setVCalculated(String(simulationData.vDiff));
      if (simulationData.unit) {
        setUnit(simulationData.unit);
      }
      setStatus('idle');
      setMessage(`Átvéve a laborból: ${simulationData.objectName} adatai betöltve! Kattints az ellenőrzésre.`);
    }
  }, [simulationData]);

  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const handleAutoCalculateDiff = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const v1 = parseVal(vInitial);
    const v2 = parseVal(vFinal);
    if (v1 !== null && v2 !== null && v2 > v1) {
      const diff = Math.round((v2 - v1) * 100) / 100;
      setVCalculated(String(diff));
      soundFx.playWoodTap?.();
    }
  };

  const handleApplyPreset = (v1: number, v2: number) => {
    soundFx.playWoodTap?.();
    setVInitial(String(v1));
    setVFinal(String(v2));
    setVCalculated(String(v2 - v1));
    setStatus('idle');
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const v1 = parseVal(vInitial);
    const v2 = parseVal(vFinal);
    const vDiff = parseVal(vCalculated);

    if (v1 === null || v2 === null || vDiff === null) {
      setStatus('error');
      setMessage('Kérlek töltsd ki mindhárom beviteli mezőt (kezdő szint, végső szint, számított térfogat)!');
      return;
    }

    if (v1 <= 0 || v2 <= 0) {
      setStatus('error');
      setMessage('A vízszinteknek pozitív számnak kell lenniük!');
      return;
    }

    if (v2 <= v1) {
      setStatus('error');
      setMessage('A test bemerítése után a vízszintnek nagyobbnak kell lennie, mint a kezdeti szintnek (Végső szint > Kezdő szint)!');
      return;
    }

    const expectedDiff = v2 - v1;
    const isMathCorrect = Math.abs(vDiff - expectedDiff) < 0.05;

    if (!isMathCorrect) {
      setStatus('error');
      setMessage('A beírt térfogat nem egyezik a két vízszint különbségével. Számold újra a kivonást: Végső szint − Kezdő szint!');
      return;
    }

    setStatus('submitting');
    setMessage('Mérés ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l2_a_kiszoritas',
      points: 1,
      note: 'A révész hordói — 2. óra: Kiszorításos térfogatmérés',
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
      });
      setStatus('success');
      setPointsAwarded(1);
      setMessage(res.message || 'Kiváló mérés! 1 fizika pont jóváírva a Pontkövetőben.');
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
    <div
      className="w-full h-full flex flex-col justify-between p-3.5 sm:p-6 text-[#2E1B14] select-text relative z-30"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div>
        {/* Header with Title and Unit Switcher */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded font-bold">
              1. Próba
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-1.5 py-0.5 rounded">
              l2_a_kiszoritas
            </span>
          </div>

          <div
            className="flex items-center gap-1 bg-[#EAE2D0] p-0.5 rounded-lg text-xs font-serif"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnit('ml');
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                unit === 'ml' ? 'bg-[#B85042] text-white font-bold shadow-xs' : 'text-[#5A4232]'
              }`}
            >
              ml
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnit('cm3');
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                unit === 'cm3' ? 'bg-[#B85042] text-white font-bold shadow-xs' : 'text-[#5A4232]'
              }`}
            >
              cm³
            </button>
          </div>
        </div>

        <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#8B261D] mb-1">
          Kiszorításos térfogatmérés
        </h3>
        <p className="text-xs text-[#5A4232] mb-2 leading-relaxed">
          Mérd meg egy szabálytalan test térfogatát a kiszorított folyadék szintjének változásával!
        </p>

        {/* Quick presets for fast selection */}
        <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-serif text-[#8C6D58] font-bold">Példa mérések:</span>
          <button
            type="button"
            disabled={isDone}
            onClick={() => handleApplyPreset(50, 74)}
            className="px-2 py-0.5 text-[11px] bg-white hover:bg-[#FAF4E5] border border-[#DFCDB3] rounded text-[#4A382D] transition-colors cursor-pointer"
            title="Kavics mérése (50 → 74 ml)"
          >
            Kavics (50 → 74 ml)
          </button>
          <button
            type="button"
            disabled={isDone}
            onClick={() => handleApplyPreset(45, 61)}
            className="px-2 py-0.5 text-[11px] bg-white hover:bg-[#FAF4E5] border border-[#DFCDB3] rounded text-[#4A382D] transition-colors cursor-pointer"
            title="Vasnehezék (45 → 61 ml)"
          >
            Vas (45 → 61 ml)
          </button>
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="ml-auto text-[11px] text-[#8B261D] hover:underline font-serif italic cursor-pointer flex items-center gap-0.5"
          >
            <Info className="w-3 h-3" />
            <span>{showFormula ? 'Képlet elrejtése' : 'Képlet'}</span>
          </button>
        </div>

        {showFormula && (
          <div className="mb-2.5 p-2 bg-[#FAF4E5] border border-[#C8B89E] rounded-lg text-xs text-[#4A382D] space-y-1 animate-fadeIn">
            <div className="font-bold text-[#8B261D]">A vízkiszorítás összefüggése:</div>
            <div className="font-mono text-center py-1 text-xs bg-white rounded border border-[#DFCDB3]">
              V<sub>test</sub> = V<sub>végső</sub> − V<sub>kezdő</sub>
            </div>
            <p className="text-[10px] text-[#7A6150]">
              1 ml = 1 cm³. A test pontosan annyi vizet szorít ki, amennyi a saját térfogata.
            </p>
          </div>
        )}

        {/* Input Form with Full Event Propagation Stop */}
        <form
          onSubmit={handleSubmit}
          className="space-y-2.5"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* V1 input */}
          <div className="p-2.5 bg-white/80 rounded-xl border border-[#DFCDB3] shadow-xs">
            <label className="block text-xs font-serif font-bold text-[#2E1B14] mb-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Kezdő vízszint a mérőhengerben (V<sub>1</sub>):</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={vInitial}
                onChange={(e) => setVInitial(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="pl. 50"
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] min-w-[30px]">{unit}</span>
            </div>
          </div>

          {/* V2 input */}
          <div className="p-2.5 bg-white/80 rounded-xl border border-[#DFCDB3] shadow-xs">
            <label className="block text-xs font-serif font-bold text-[#2E1B14] mb-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-700" />
              <span>2. Végső vízszint a test behelyezése után (V<sub>2</sub>):</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={vFinal}
                onChange={(e) => setVFinal(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="pl. 74"
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
              <span className="font-serif font-bold text-sm text-[#5A4232] min-w-[30px]">{unit}</span>
            </div>
          </div>

          {/* Calculated Volume */}
          <div className="p-2.5 bg-[#FFF9ED] rounded-xl border-2 border-[#B85042]/50 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-serif font-bold text-[#8B261D]">
                3. Számított térfogat (V = V<sub>2</sub> − V<sub>1</sub>):
              </label>
              <button
                type="button"
                onClick={handleAutoCalculateDiff}
                disabled={isDone || !vInitial || !vFinal}
                className="text-[11px] font-serif font-bold text-[#B85042] hover:text-[#8B261D] flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                title="Kiszámolja a különbséget automatikusan"
              >
                <Calculator className="w-3 h-3" />
                <span>Kivonás számolása</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={vCalculated}
                onChange={(e) => setVCalculated(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                disabled={isDone}
                placeholder="pl. 24"
                className="w-full px-3 py-1.5 text-sm sm:text-base font-mono font-bold bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
              <span className="font-serif font-bold text-sm text-[#8B261D] min-w-[30px]">{unit}</span>
            </div>
          </div>

          {/* Submit Button */}
          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-50 text-white font-serif font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'submitting' ? 'Ellenőrzés folyamatban...' : 'Mérés ellenőrzése és pont beküldése (1 pont)'}</span>
            </button>
          )}
        </form>
      </div>

      {/* Feedback Messages */}
      <div className="mt-2.5">
        {status === 'error' && message && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-fadeIn shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{message}</div>
          </div>
        )}

        {status === 'idle' && message && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>{message}</div>
          </div>
        )}

        {status === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">1. Próba Sikeresen Megoldva!</span>
                <span className="text-[11px] text-emerald-700">{message}</span>
              </div>
            </div>
            {pointsAwarded !== null && (
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs shadow-xs">
                +{pointsAwarded} pont
              </span>
            )}
          </div>
        )}

        {!user && (
          <p className="text-[11px] text-[#8C6D58] italic text-center mt-1.5">
            💡 Jelentkezz be a 2. oldalon a pontok mentéséhez!
          </p>
        )}
      </div>
    </div>
  );
};
