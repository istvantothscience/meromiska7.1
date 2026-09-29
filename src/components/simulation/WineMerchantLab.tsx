import React, { useState } from 'react';
import { GlassWater, Sparkles, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

export const WineMerchantLab: React.FC = () => {
  const [filledGlasses, setFilledGlasses] = useState<number>(8);
  const [glassSizeDl] = useState<number>(3);
  const [claimedLiters] = useState<number>(3.0);

  const totalDl = filledGlasses * glassSizeDl;
  const actualLiters = totalDl / 10;
  const missingMl = Math.max(0, Math.round((claimedLiters - actualLiters) * 1000));

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 text-[#2E1B14] select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            2. Próba Laboratórium
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            l3_b_ketlepes
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          A kancsó és a poharak
        </h3>
        <p className="font-serif text-xs text-[#5A4232] leading-relaxed mb-3">
          Vizsgáljuk meg az italmérő trükkjét szemléletesen! A kalmár 3 dl-es poharat használ, és 8 pohár kimérése után azt mondja: „Itt van 3 liter!”.
        </p>

        {/* Visual glass grid */}
        <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-xl p-3 mb-3 shadow-xs">
          <div className="text-[11px] font-serif font-bold text-[#8B261D] mb-2 flex items-center justify-between">
            <span>Kimért poharak (8 × 3 dl):</span>
            <span className="font-mono text-xs text-[#7A4E38]">Összesen: {totalDl} dl</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const isFilled = i <= filledGlasses;
              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    isFilled
                      ? 'bg-amber-100/90 border-amber-300 shadow-xs'
                      : 'bg-white/40 border-dashed border-[#C8B89E] opacity-50'
                  }`}
                >
                  <GlassWater
                    className={`w-5 h-5 ${isFilled ? 'text-amber-700' : 'text-stone-400'}`}
                  />
                  <span className="font-mono text-[10px] font-bold text-[#5A4232] mt-1">
                    3 dl
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive controls */}
          <div
            className="flex items-center justify-between pt-1 border-t border-[#DFCDB3] text-xs font-serif"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilledGlasses((prev) => Math.max(1, prev - 1))}
                className="px-2 py-0.5 bg-white border border-[#C8B89E] rounded text-xs font-bold hover:bg-[#FAF4E5] cursor-pointer"
              >
                − 1 pohár
              </button>
              <button
                type="button"
                onClick={() => setFilledGlasses((prev) => Math.min(8, prev + 1))}
                className="px-2 py-0.5 bg-white border border-[#C8B89E] rounded text-xs font-bold hover:bg-[#FAF4E5] cursor-pointer"
              >
                + 1 pohár
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFilledGlasses(8)}
              className="text-[11px] text-[#8C6D58] hover:text-[#B85042] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Alaphelyzet
            </button>
          </div>
        </div>

        {/* Calculation summary card */}
        <div className="bg-white/90 border border-[#C6923C]/50 rounded-xl p-3 shadow-xs space-y-1.5 text-xs font-serif">
          <div className="font-bold text-[#8B261D] flex items-center justify-between">
            <span>A levezetés lépései:</span>
            <span className="text-[10px] text-[#4A7C59] font-mono">1 liter = 10 dl = 1000 ml</span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-[#FAF4E5] rounded border border-[#DFCDB3]">
            <span>1. Valódi mennyiség:</span>
            <span className="font-mono font-bold text-[#2E1B14]">
              {filledGlasses} × 3 dl = {totalDl} dl = <strong>{actualLiters} liter</strong>
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-[#FAF4E5] rounded border border-[#DFCDB3]">
            <span>2. Kalmár ígérete:</span>
            <span className="font-mono font-bold text-[#2E1B14]">3,0 liter = 30 dl = 3000 ml</span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-rose-50 rounded border border-rose-200 text-rose-900">
            <span className="flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Hiányzó mennyiség:
            </span>
            <span className="font-mono font-bold text-rose-800">
              3000 ml − {Math.round(actualLiters * 1000)} ml = <strong>{missingMl} ml</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 text-right text-xs text-[#8C6D58] font-serif italic">
        Szemközt: 2. Próba (Az italmérő trükkje feladatlap) →
      </div>
    </div>
  );
};
