import React, { useState } from 'react';
import { Compass, Sparkles, Palette } from 'lucide-react';

interface Props {
  src: string | null;
  alt: string;
  sceneNumber: number;
  sceneTitle: string;
}

export const WatercolorIllustration: React.FC<Props> = ({
  src,
  alt,
  sceneNumber,
  sceneTitle,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !src || imgFailed;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Top Header Tag */}
      <div className="w-full flex items-center justify-between text-xs text-[#8C6D58] font-serif border-b border-[#DFCDB3]/80 pb-2 mb-2">
        <span className="uppercase tracking-widest text-[#B85042] font-bold flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#C6923C]" />
          <span>{sceneNumber}. Jelenet — Vízfestmény</span>
        </span>
        <span className="italic text-[#7A6150]">{sceneTitle}</span>
      </div>

      {/* Main Illustration Frame: Heavy Rag Watercolor Mat */}
      <div className="relative w-full flex-1 max-h-[74%] rounded-xl overflow-hidden shadow-md border-2 border-[#C6923C]/60 watercolor-mat flex items-center justify-center p-2">
        {!showFallback ? (
          <div className="w-full h-full relative rounded-lg overflow-hidden watercolor-feathered-edge bg-[#FAF5E8]">
            {/* The Painted Image with authentic watercolor pigment blend */}
            <img
              src={src}
              alt={alt}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover object-center watercolor-canvas"
              loading="eager"
            />

            {/* Cold-press paper grain & pigment granulation texture */}
            <div className="absolute inset-0 watercolor-paper-grain pointer-events-none" />

            {/* Organic pigment pooling wash along edges */}
            <div className="absolute inset-0 watercolor-pigment-pooling pointer-events-none" />

            {/* Antique watercolor wash vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3A1E14]/25 via-transparent to-[#FAF7EE]/15 pointer-events-none" />

            {/* Watercolor painterly badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#FAF7EE]/90 backdrop-blur-xs border border-[#C6923C]/50 rounded text-[10px] font-serif text-[#8B261D] shadow-xs flex items-center gap-1 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B85042] inline-block" />
              <span>Akvarell technika</span>
            </div>
          </div>
        ) : (
          /* Graceful Watercolor Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FAF5E8] via-[#EAE1CB] to-[#DDD2B8] relative rounded-lg">
            {/* Decorative concentric rings */}
            <div className="w-32 h-32 rounded-full border border-[#C6923C]/30 flex items-center justify-center mb-3 relative animate-pulse">
              <div className="w-24 h-24 rounded-full border border-[#B85042]/25 flex items-center justify-center">
                <Compass className="w-12 h-12 text-[#B85042]/70 stroke-[1.2]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7EE]/90 border border-[#C6923C]/50 rounded-full shadow-sm text-xs font-serif text-[#8B261D] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C6923C]" />
              Illusztráció hamarosan
            </div>

            <p className="font-serif text-sm font-bold text-[#4A382D] max-w-[200px]">
              {sceneTitle}
            </p>
            <p className="text-xs text-[#8C6D58] font-serif italic mt-1 max-w-[220px]">
              Vízfesték mesekönyv festmény készülőben
            </p>
          </div>
        )}

        {/* Ornate brass corner embellishments */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#C6923C] pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#C6923C] pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#C6923C] pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#C6923C] pointer-events-none" />
      </div>

      {/* Caption at the bottom */}
      <div className="w-full mt-2.5 text-center">
        <p className="font-serif text-xs italic text-[#7A6150]">
          „{sceneTitle}” — kézzel festett akvarell jelenet
        </p>
      </div>
    </div>
  );
};
