import React, { useState } from 'react';
import { Layers, Sparkles, ArrowRight, Award, Compass } from 'lucide-react';

export const HarderLabL3: React.FC = () => {
  const [kmVal, setKmVal] = useState<string>('3,75');
  const numKm = parseFloat(kmVal.replace(',', '.')) || 0;
  const meters = numKm * 1000;
  const decimeters = meters * 10;

  return (
    <div className="w-full h-full flex flex-col justify-between pt-6 sm:pt-8 px-4 sm:px-6 pb-4 text-[#2E1B14] select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-amber-700 to-[#8B261D] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-xs">
            <Compass className="w-3.5 h-3.5" /> Számolómester
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            Útmutató a nehezebb próbákhoz
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          A többlépéses átváltás létrája
        </h3>
        <p className="font-serif text-xs text-[#5A4232] leading-relaxed mb-3">
          Amikor nem közvetlen szomszédos egységek között váltunk, lépésről lépésre haladunk a mértéklétrán:
        </p>

        {/* SI Metric Ladder Box */}
        <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-xl p-3 mb-3 shadow-xs space-y-2">
          <div className="text-[11px] font-serif font-bold text-[#8B261D] flex items-center justify-between">
            <span>Hosszúság-létra (Prefixumok):</span>
            <span className="text-[10px] text-[#8C6D58] font-mono">km → m → dm → cm → mm</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-serif">
            <div className="bg-white/90 p-1.5 rounded border border-[#E0D4BE]">
              <div className="font-bold text-[#8B261D]">km → m</div>
              <div className="text-[10px] text-[#7A4E38] font-mono font-bold">· 1000</div>
            </div>
            <div className="bg-white/90 p-1.5 rounded border border-[#E0D4BE]">
              <div className="font-bold text-[#8B261D]">m → dm</div>
              <div className="text-[10px] text-[#7A4E38] font-mono font-bold">· 10</div>
            </div>
            <div className="bg-white/90 p-1.5 rounded border border-[#E0D4BE]">
              <div className="font-bold text-[#8B261D]">dm → cm</div>
              <div className="text-[10px] text-[#7A4E38] font-mono font-bold">· 10</div>
            </div>
            <div className="bg-white/90 p-1.5 rounded border border-[#E0D4BE]">
              <div className="font-bold text-[#8B261D]">km → dm</div>
              <div className="text-[10px] text-emerald-800 font-mono font-bold">· 10 000</div>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-[#4A382D] leading-snug">
            <strong>Példa:</strong> 1 km = 1000 m. Mivel minden méterben 10 dm van, 1 km = 10 000 dm!
          </div>
        </div>

        {/* Tömeg és űrmérték gyorstáblázat */}
        <div className="bg-white/80 border border-[#DFCDB3] rounded-xl p-3 mb-3 shadow-xs space-y-2">
          <div className="text-[11px] font-serif font-bold text-[#8B261D]">
            Összetett mennyiségek és régi mértékek:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-serif">
            <div className="p-2 bg-[#FAF4E5] rounded border border-[#E8DCBF] space-y-1">
              <span className="font-bold text-[#2E1B14] block">Tömeg vegyesen:</span>
              <div className="text-[11px] text-[#4A382D]">1 kg = 1000 g</div>
              <div className="text-[11px] text-[#4A382D]">1 dkg = 10 g</div>
              <div className="text-[10px] text-[#8B261D] font-mono">2,5 kg = 2500 g</div>
            </div>

            <div className="p-2 bg-[#FAF4E5] rounded border border-[#E8DCBF] space-y-1">
              <span className="font-bold text-[#2E1B14] block">Régi mértékfa:</span>
              <div className="text-[11px] text-[#4A382D]">1 rőf = 78 cm</div>
              <div className="text-[11px] text-[#4A382D]">1 icce = 850 ml</div>
              <div className="text-[10px] text-[#8B261D] font-mono">850 ml = 8,5 dl</div>
            </div>
          </div>
        </div>

        {/* Mini interactive tester */}
        <div className="bg-[#FAF4E5] border border-[#C6923C]/50 rounded-xl p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#7A4E38] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C6923C]" />
            <span>Kétlépéses próba-kalkulátor:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={kmVal}
              onChange={(e) => setKmVal(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white text-[#2E1B14]"
              placeholder="3.75"
            />
            <span className="font-mono text-xs font-bold text-[#5A4232]">km =</span>
            <div className="flex-1 px-2 py-1 bg-white rounded border border-[#DFCDB3] font-mono font-bold text-xs text-[#8B261D] text-center">
              {meters.toLocaleString('hu-HU')} m = {decimeters.toLocaleString('hu-HU')} dm
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 text-right text-xs text-[#8C6D58] font-serif italic">
        Szemközt: Mesterpróba (4 nehezebb feladat) →
      </div>
    </div>
  );
};
