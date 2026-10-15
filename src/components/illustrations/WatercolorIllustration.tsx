import React, { useState } from 'react';
import { Compass, Sparkles, Palette, Image as ImageIcon } from 'lucide-react';

interface Props {
  src: string | null;
  alt: string;
  sceneNumber: number;
  sceneTitle: string;
  imageName?: string;
}

export const WatercolorIllustration: React.FC<Props> = ({
  src,
  alt,
  sceneNumber,
  sceneTitle,
  imageName,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !src || imgFailed;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Top Header Tag */}
      <div className="w-full flex items-center justify-between text-xs text-[#8C6D58] font-serif border-b border-[#DFCDB3]/80 pb-2 mb-2">
        <span className="uppercase tracking-widest text-[#B85042] font-bold flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#C6923C]" />
          <span>{sceneNumber}. Jelenet — Illusztráció</span>
        </span>
        <span className="italic text-[#7A6150]">{sceneTitle}</span>
      </div>

      {/* Main Illustration Frame: Heavy Rag Watercolor Mat */}
      <div className="relative w-full flex-1 max-h-[76%] rounded-xl overflow-hidden shadow-md border-2 border-[#C6923C]/60 watercolor-mat flex items-center justify-center p-2.5">
        {!showFallback ? (
          <div className="w-full h-full relative rounded-lg overflow-hidden watercolor-feathered-edge bg-[#FAF5E8]">
            {/* The Painted Image with subtle CSS Ken Burns effect */}
            <img
              src={src}
              alt={alt}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover object-center watercolor-canvas animate-kenburns"
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
          /* Dashed-border Storybook Placeholder ("Illusztráció hamarosan") */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#E7E8D1] via-[#FAF5E8] to-[#EAE1CB] relative rounded-lg border-2 border-dashed border-[#B85042]/65">
            {/* Decorative concentric timepiece/compass rings */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-[#B85042]/35 flex items-center justify-center mb-3 relative bg-[#FAF7EE]/60 shadow-inner">
              <div className="w-20 h-20 rounded-full border border-[#A7BEAE] flex items-center justify-center bg-[#E7E8D1]/50">
                <Compass className="w-10 h-10 text-[#B85042] stroke-[1.4]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#B85042] text-white rounded-full shadow-sm text-xs font-serif font-bold mb-2 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#E7E8D1]" />
              Illusztráció hamarosan
            </div>

            <p className="font-serif text-base font-bold text-[#2E1B14] max-w-[240px]">
              {sceneTitle}
            </p>
            <p className="text-xs text-[#5A4232] font-sans mt-1 max-w-[230px]">
              A jelenet illusztrációja előkészületben van.
            </p>

            {imageName && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF7EE]/90 border border-[#A7BEAE] text-[11px] font-mono text-[#2E1B14] shadow-2xs">
                <ImageIcon className="w-3 h-3 text-[#B85042]" />
                <span>{imageName}</span>
              </div>
            )}
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
          „{sceneTitle}” {imageName && showFallback ? `(${imageName})` : '— mesekönyv-jelenet'}
        </p>
      </div>
    </div>
  );
};
