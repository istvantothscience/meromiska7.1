import React, { useState } from 'react';
import { Scale, BookOpen, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ANCIENT_UNITS } from '../tasks/TaskCsaladvanyL3';

export const AncientScaleLab: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('lab');
  const [inputVal, setInputVal] = useState<string>('1');

  const unitConfig = ANCIENT_UNITS[selectedUnit] || ANCIENT_UNITS.lab;
  const num = parseFloat(inputVal.replace(',', '.')) || 0;
  const converted = Math.round(num * unitConfig.factor * 100) / 100;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 text-[#2E1B14] select-text overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
            Vásári Mértékfa
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            Hivatalos királyi etalon
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          A vásárbíró mértékfája
        </h3>
        <p className="font-serif text-xs text-[#5A4232] leading-relaxed mb-3">
          A középkori vásárokon minden kalmár más-más régi mértékkel számolt. A bíró az alábbi hivatalos fatáblácskát adta a fiúnak az átváltáshoz:
        </p>

        {/* Ancient Units Reference Table */}
        <div className="bg-[#F4EEDF] border border-[#DFCDB3] rounded-xl p-2.5 mb-3 shadow-xs">
          <div className="text-[11px] font-serif font-bold text-[#8B261D] mb-1.5 flex items-center justify-between">
            <span>Hivatalos átváltási táblázat</span>
            <span className="text-[10px] text-[#8C6D58] italic">Mértékfa-kártya</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs font-serif">
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 láb</span>
              <span className="font-mono font-bold text-[#8B261D]">= 32 cm</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 font</span>
              <span className="font-mono font-bold text-[#8B261D]">= 560 g</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 rőf</span>
              <span className="font-mono font-bold text-[#8B261D]">= 78 cm</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 icce</span>
              <span className="font-mono font-bold text-[#8B261D]">= 850 ml</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 col</span>
              <span className="font-mono font-bold text-[#8B261D]">= 2,54 cm</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded border border-[#E0D4BE] flex items-center justify-between">
              <span className="font-bold text-[#2E1B14]">1 akó</span>
              <span className="font-mono font-bold text-[#8B261D]">= 54 000 ml</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Conversion Tester */}
        <div
          className="bg-white/90 border border-[#C6923C]/50 rounded-xl p-3 shadow-xs space-y-2 relative z-30"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#7A4E38]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6923C]" />
            <span>Mértékfa gyorstesztelő:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLInputElement).focus();
              }}
              className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-[#C8B89E] bg-white text-[#2E1B14]"
              placeholder="1"
            />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="px-2 py-1 bg-[#FAF4E5] font-serif font-bold text-xs rounded border border-[#DFCDB3] text-[#2E1B14] cursor-pointer"
            >
              {Object.entries(ANCIENT_UNITS).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.name}
                </option>
              ))}
            </select>
            <ArrowRight className="w-4 h-4 text-[#8C6D58]" />
            <div className="flex-1 px-2.5 py-1 bg-[#F5EFE0] rounded border border-[#DFCDB3] font-mono font-bold text-xs text-[#8B261D] text-right">
              {converted} {unitConfig.modernUnit}
            </div>
          </div>
        </div>

        {/* Cheating Rule explanation */}
        <div className="mt-3 p-2.5 bg-[#E7E8D1] border border-[#A7BEAE] rounded-xl text-xs space-y-1">
          <div className="font-bold text-[#2E1B14] flex items-center gap-1 font-serif">
            <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
            <span>Mikor számít csalásnak az eltérés?</span>
          </div>
          <p className="text-[11px] text-[#3E2E23] leading-relaxed">
            Egyetlen mérőeszköz sem végtelenül pontos. Ha az eltérés kisebb, mint a mérőeszköz hibahatára, az még elfogadható. Ám ha az eltérés eléri a legkisebb beosztás <strong>kétszeresét</strong> (<em>e ≥ 2·d</em>), az már bizonyított csalás!
          </p>
        </div>
      </div>

      <div className="pt-2 text-right text-xs text-[#8C6D58] font-serif italic">
        Szemközt: 1. Próba (Átváltási feladat) →
      </div>
    </div>
  );
};
