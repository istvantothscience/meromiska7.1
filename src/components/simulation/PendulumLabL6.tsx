import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Clock, Compass } from 'lucide-react';
import { soundFx } from '../../lib/sound';

export const PendulumLabL6: React.FC = () => {
  const [isSwinging, setIsSwinging] = useState(false);
  const [stringLengthM, setStringLengthM] = useState<number>(1.0);
  const [swingsCount, setSwingsCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [angleDeg, setAngleDeg] = useState(0);

  // Period of simple pendulum T = 2 * pi * sqrt(L / g)
  const periodSec = 2 * Math.PI * Math.sqrt(stringLengthM / 9.81);

  useEffect(() => {
    if (!isSwinging) {
      setAngleDeg(0);
      return;
    }

    const startTime = performance.now() - elapsedSec * 1000;
    const timer = setInterval(() => {
      const now = performance.now();
      const t = (now - startTime) / 1000;
      setElapsedSec(t);
      const completed = Math.floor(t / periodSec);
      setSwingsCount(completed);
      const theta = 24 * Math.cos((2 * Math.PI * t) / periodSec);
      setAngleDeg(theta);
    }, 30);

    return () => clearInterval(timer);
  }, [isSwinging, periodSec]);

  const handleToggle = () => {
    soundFx.playWoodTap();
    setIsSwinging((prev) => !prev);
  };

  const handleReset = () => {
    soundFx.playWoodTap();
    setIsSwinging(false);
    setElapsedSec(0);
    setSwingsCount(0);
    setAngleDeg(0);
  };

  const visualPixelLength = 52 + stringLengthM * 55;
  const pivotX = 130;
  const pivotY = 18;
  const rad = (angleDeg * Math.PI) / 180;
  const bobX = pivotX + visualPixelLength * Math.sin(rad);
  const bobY = pivotY + visualPixelLength * Math.cos(rad);

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-none relative z-20"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-0.5 rounded font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Toronyóra Műhely
          </span>
          <span className="text-xs font-mono text-[#7A6150]">Fonalinga-szimulátor</span>
        </div>

        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2E1B14] mb-1">
          Miska kísérlete a lengő ingával
        </h3>
        <p className="text-xs text-[#4A382D] mb-2.5 leading-relaxed">
          Indítsd el a fonalingát, és figyeld meg, mennyi idő alatt tesz meg <strong>10 teljes lengést</strong> oda-vissza!
        </p>

        {/* Visual Pendulum Frame */}
        <div className="w-full bg-gradient-to-b from-[#FAF5E8] to-[#E7E8D1] border-2 border-[#A7BEAE] rounded-xl p-2 flex flex-col items-center shadow-inner mb-3">
          <svg viewBox="0 0 260 155" className="w-full max-w-[250px] h-36 overflow-visible">
            {/* Wooden beam */}
            <rect x="65" y="8" width="130" height="10" rx="4" fill="#5A3A22" stroke="#2E1B14" strokeWidth="1.5" />
            {/* Vertical center dashed reference line */}
            <line
              x1={pivotX}
              y1={pivotY}
              x2={pivotX}
              y2={145}
              stroke="#A7BEAE"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* String */}
            <line
              x1={pivotX}
              y1={pivotY}
              x2={bobX}
              y2={bobY}
              stroke="#2E1B14"
              strokeWidth="2.2"
            />
            {/* Pivot */}
            <circle cx={pivotX} cy={pivotY} r="4" fill="#B85042" />
            {/* Stone Bob */}
            <circle
              cx={bobX}
              cy={bobY}
              r="12"
              fill="#B85042"
              stroke="#2E1B14"
              strokeWidth="2"
            />
            <circle cx={bobX - 3} cy={bobY - 3} r="3" fill="#E7E8D1" opacity="0.6" />
          </svg>

          {/* Readouts */}
          <div className="w-full grid grid-cols-3 gap-2 text-center bg-white/85 rounded-lg p-2 border border-[#DFCDB3] text-xs">
            <div>
              <span className="text-[10px] text-[#7A6150] block uppercase">Fonálhossz</span>
              <strong className="font-mono text-sm text-[#2E1B14]">{stringLengthM.toFixed(1)} m</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#7A6150] block uppercase">Lengésszám</span>
              <strong className="font-mono text-sm text-[#B85042]">{swingsCount} db</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#7A6150] block uppercase">Mért idő (t)</span>
              <strong className="font-mono text-sm text-[#2E1B14]">{elapsedSec.toFixed(1)} s</strong>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[0.5, 1.0, 1.5].map((len) => (
              <button
                key={len}
                type="button"
                disabled={isSwinging}
                onClick={() => {
                  handleReset();
                  setStringLengthM(len);
                }}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  stringLengthM === len
                    ? 'bg-[#B85042] text-white font-bold'
                    : 'bg-[#E7E8D1] text-[#2E1B14] hover:bg-[#A7BEAE]/40'
                } disabled:opacity-50`}
              >
                {len.toFixed(1)} m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggle}
              className="px-3 py-1.5 rounded-lg bg-[#B85042] hover:bg-[#9E3F32] text-white text-xs font-serif font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              {isSwinging ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSwinging ? 'Megállít' : 'Indítás'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-[#E7E8D1] hover:bg-[#A7BEAE]/50 text-[#2E1B14] cursor-pointer"
              title="Nullázás"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-[11px] text-[#2E1B14] flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#B85042] shrink-0" />
        <span>
          <strong>Fizikai megfigyelés:</strong> Egy teljes oda-vissza lengés ideje a <em>lengésidő (T)</em>, az egyirányú lengésé pedig a <em>féllengésidő</em>.
        </span>
      </div>
    </div>
  );
};
