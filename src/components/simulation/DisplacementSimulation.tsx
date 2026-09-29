import React, { useState } from 'react';
import {
  Droplets,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Info,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../lib/sound';

export interface DisplacementData {
  vInitial: number;
  vFinal: number;
  vDiff: number;
  unit: 'ml' | 'cm3';
  objectName: string;
}

interface Props {
  onApplyToTask?: (data: DisplacementData) => void;
  isApplied?: boolean;
}

interface TestObject {
  id: string;
  name: string;
  volume: number; // in ml / cm3
  color: string;
  borderColor: string;
  shape: 'rock' | 'cylinder' | 'cube';
  densityDesc: string;
}

const PRESET_OBJECTS: TestObject[] = [
  {
    id: 'kavics',
    name: 'Szabálytalan kő',
    volume: 24,
    color: '#78716C',
    borderColor: '#44403C',
    shape: 'rock',
    densityDesc: 'Szabálytalan felület, vonalzóval nem mérhető',
  },
  {
    id: 'vascsavar',
    name: 'Vas nehezék',
    volume: 16,
    color: '#475569',
    borderColor: '#1E293B',
    shape: 'cylinder',
    densityDesc: 'Tömör vas, süllyed a víz aljára',
  },
  {
    id: 'sargarez',
    name: 'Sárgaréz hasáb',
    volume: 32,
    color: '#D97706',
    borderColor: '#92400E',
    shape: 'cube',
    densityDesc: 'Nagyobb térfogatú fémtest',
  },
];

export const DisplacementSimulation: React.FC<Props> = ({ onApplyToTask, isApplied = false }) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string>('kavics');
  const [customVolume, setCustomVolume] = useState<number>(25);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [vInitial, setVInitial] = useState<number>(50); // Starting water level (ml)
  const [isSubmerged, setIsSubmerged] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const selectedObject = PRESET_OBJECTS.find((o) => o.id === selectedObjectId) || PRESET_OBJECTS[0];
  const activeVolume = isCustom ? customVolume : selectedObject.volume;

  // Final water level when submerged (cannot exceed 100 ml scale)
  const vFinal = isSubmerged ? Math.min(100, vInitial + activeVolume) : vInitial;
  const measuredDiff = isSubmerged ? vFinal - vInitial : 0;

  const toggleSubmerge = () => {
    soundFx.playWoodTap?.();
    setIsSubmerged((prev) => !prev);
  };

  const handleApply = () => {
    if (!onApplyToTask) return;
    soundFx.playSuccess();
    onApplyToTask({
      vInitial,
      vFinal: isSubmerged ? vFinal : vInitial + activeVolume,
      vDiff: activeVolume,
      unit: 'ml',
      objectName: isCustom ? 'Egyedi test' : selectedObject.name,
    });
  };

  const resetAll = () => {
    soundFx.playWoodTap?.();
    setIsSubmerged(false);
    setVInitial(50);
    setIsCustom(false);
    setSelectedObjectId('kavics');
    setCustomVolume(25);
  };

  // Cylinder graduations (0, 10, 20 ... 100 ml)
  const ticks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-3.5 sm:p-5 text-[#2E1B14] select-text relative"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded font-bold">
              1. Próba Labor
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-1.5 py-0.5 rounded">
              mérőhenger-szimuláció
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHelp((prev) => !prev)}
              className="p-1 text-[#8C6D58] hover:text-[#B85042] transition-colors rounded hover:bg-[#EAE2D0] cursor-pointer"
              title="Mérési útmutató"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="p-1 text-[#8C6D58] hover:text-[#B85042] transition-colors rounded hover:bg-[#EAE2D0] cursor-pointer"
              title="Visszaállítás"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D] mb-1 flex items-center gap-1.5">
          <Droplets className="w-5 h-5 text-sky-600 shrink-0" />
          <span>Vízkiszorításos Mérőhenger</span>
        </h3>

        {showHelp && (
          <div className="mb-2.5 p-2.5 bg-[#FFF9ED] border border-[#B85042]/30 rounded-lg text-xs text-[#5A4232] space-y-1 animate-fadeIn">
            <div className="font-bold text-[#8B261D] flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Hogyan működik a mérés?
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Állítsd be a <strong>kezdő vízszintet</strong> ($V_1$).
              <br />
              2. Kattints a <strong>„Test bemerítése”</strong> gombra!
              <br />
              3. A vízszint megemelkedik ($V_2$). A kiszorított víz pontosan megegyezik a test térfogatával:
              <br />
              <span className="font-mono font-bold text-[#8B261D]">
                V<sub>test</sub> = V<sub>végső</sub> − V<sub>kezdő</sub>
              </span>
            </p>
          </div>
        )}

        {/* Object Selector Pills */}
        <div className="mb-2">
          <label className="block text-[11px] font-serif font-bold text-[#5A4232] mb-1">
            Válassz mérendő szilárd testet:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_OBJECTS.map((obj) => {
              const active = !isCustom && selectedObjectId === obj.id;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedObjectId(obj.id);
                  }}
                  className={`p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    active
                      ? 'border-[#B85042] bg-[#FAF4E5] shadow-xs ring-1 ring-[#B85042]'
                      : 'border-[#DFCDB3] bg-white/70 hover:bg-white text-[#5A4232]'
                  }`}
                >
                  <div className="font-bold text-[11px] leading-tight text-[#2E1B14]">{obj.name}</div>
                  <div className="font-mono text-[10px] text-[#8B261D] font-bold mt-0.5">
                    {obj.volume} cm³ (ml)
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cylinder & Interactive Measurement View */}
        <div className="bg-gradient-to-b from-[#FDFBF7] to-[#F5EFE0] p-2.5 rounded-xl border border-[#DFCDB3] shadow-xs flex items-center justify-between gap-3">
          {/* Virtual Glass Graduated Cylinder Graphic */}
          <div className="relative w-28 sm:w-32 h-52 shrink-0 flex items-center justify-center">
            {/* Cylinder Stand Base */}
            <div className="absolute bottom-0 w-24 h-3 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full border border-slate-400 shadow-md z-10" />

            {/* Glass Tube */}
            <div className="relative w-14 sm:w-16 h-48 border-x-2 border-b-2 border-sky-300/80 rounded-b-xl overflow-hidden bg-white/40 shadow-inner flex flex-col justify-end backdrop-blur-[1px]">
              {/* Top rim of glass */}
              <div className="absolute top-0 inset-x-0 h-1.5 border-t border-sky-400/50 bg-sky-100/30 rounded-t" />

              {/* Suspended String & Object */}
              <div
                className="absolute inset-x-0 flex flex-col items-center transition-all duration-700 ease-out z-20 pointer-events-none"
                style={{
                  top: isSubmerged ? `${Math.max(15, 170 - (vFinal * 1.55))}px` : '4px',
                }}
              >
                {/* Thin Thread */}
                <div className="w-[1px] h-12 bg-amber-900/60 shadow-xs" />
                {/* The Object */}
                <div
                  className="rounded-lg shadow-md transition-transform duration-500 animate-pulse"
                  style={{
                    backgroundColor: selectedObject.color,
                    borderColor: selectedObject.borderColor,
                    width: `${Math.max(22, Math.min(36, activeVolume * 1.05))}px`,
                    height: `${Math.max(22, Math.min(36, activeVolume * 1.05))}px`,
                    borderWidth: '2px',
                    borderRadius: selectedObject.shape === 'rock' ? '40% 60% 70% 30% / 40% 50% 60% 50%' : '6px',
                  }}
                  title={`${selectedObject.name} (${activeVolume} cm³)`}
                />
              </div>

              {/* Water Column */}
              <div
                className="w-full bg-gradient-to-t from-sky-500/80 via-sky-400/70 to-sky-300/60 relative transition-all duration-700 ease-out border-t-2 border-sky-200/90"
                style={{
                  height: `${Math.min(100, Math.max(8, vFinal))}%`,
                }}
              >
                {/* Meniscus curvature effect */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-white/60 to-transparent rounded-full opacity-70" />

                {/* Bubbles if submerged */}
                {isSubmerged && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/70 rounded-full animate-ping" />
                    <span className="absolute bottom-5 right-3 w-1 h-1 bg-white/80 rounded-full animate-pulse" />
                    <span className="absolute bottom-8 left-4 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>

            {/* Graduated Scale Ticks */}
            <div className="absolute right-0.5 h-44 flex flex-col justify-between text-[9px] font-mono text-[#5A4232] select-none pointer-events-none">
              {ticks.map((val) => (
                <div key={val} className="flex items-center gap-1 leading-none">
                  <div className={`h-[1px] ${val % 20 === 0 ? 'w-2 bg-slate-600 font-bold' : 'w-1 bg-slate-400'}`} />
                  {val % 20 === 0 && <span className="text-[8px] font-bold text-slate-700">{val}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Controls & Realtime Measurement Card */}
          <div className="flex-1 space-y-2">
            {/* Action Button: Submerge / Raise */}
            <button
              type="button"
              onClick={toggleSubmerge}
              className={`w-full py-2 px-3 rounded-lg font-serif font-bold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 ${
                isSubmerged
                  ? 'bg-[#EAE2D0] hover:bg-[#DFCDB3] text-[#5A4232] border border-[#C8B89E]'
                  : 'bg-[#B85042] hover:bg-[#A34335] text-white shadow-md hover:scale-[1.02]'
              }`}
            >
              {isSubmerged ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Test kiemelése a vízből ↑</span>
                </>
              ) : (
                <>
                  <Droplets className="w-3.5 h-3.5 text-sky-200" />
                  <span>Test bemerítése a vízbe ↓</span>
                </>
              )}
            </button>

            {/* Water levels readout display */}
            <div className="p-2 bg-white rounded-lg border border-[#DFCDB3] space-y-1 text-xs">
              <div className="flex justify-between items-center text-[#5A4232]">
                <span className="font-serif">Kezdő vízszint (V₁):</span>
                <span className="font-mono font-bold text-[#2E1B14]">{vInitial} ml</span>
              </div>

              <div className="flex justify-between items-center text-[#5A4232]">
                <span className="font-serif">Végső vízszint (V₂):</span>
                <span
                  className={`font-mono font-bold ${
                    isSubmerged ? 'text-sky-700 font-extrabold text-sm' : 'text-slate-400'
                  }`}
                >
                  {isSubmerged ? `${vFinal} ml` : '— (merítsd be!)'}
                </span>
              </div>

              <div className="pt-1 border-t border-[#DFCDB3] flex justify-between items-center">
                <span className="font-serif font-bold text-[#8B261D]">Számított V (V₂ − V₁):</span>
                <span className="font-mono font-bold text-sm text-[#8B261D]">
                  {isSubmerged ? `${measuredDiff} cm³` : `(${activeVolume} cm³)`}
                </span>
              </div>
            </div>

            {/* Slider to adjust starting water level V1 */}
            <div className="bg-[#FAF4E5] p-1.5 rounded-lg border border-[#DFCDB3]">
              <div className="flex justify-between text-[10px] font-serif text-[#5A4232] mb-0.5">
                <span>Kezdő vízmennyiség (V₁):</span>
                <span className="font-mono font-bold">{vInitial} ml</span>
              </div>
              <input
                type="range"
                min={30}
                max={60}
                step={5}
                value={vInitial}
                onChange={(e) => setVInitial(parseInt(e.target.value, 10))}
                disabled={isSubmerged}
                className="w-full h-1.5 bg-[#DFCDB3] rounded-lg appearance-none cursor-pointer accent-[#B85042]"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Transfer Button */}
      <div className="mt-2.5">
        <button
          type="button"
          onClick={handleApply}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] hover:brightness-110 text-white font-serif font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Adatok átmásolva az 1. Próbához! ✓</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Adatok átvitele az 1. Próbához ({vInitial} ml → {vInitial + activeVolume} ml)</span>
              <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <span className="block text-[10px] text-center text-[#8C6D58] mt-1 italic">
          Kattints ide, vagy írd be a számokat közvetlenül a szemközti lapon!
        </span>
      </div>
    </div>
  );
};
