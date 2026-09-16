import React, { useState } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface Book3DFrameProps {
  children: React.ReactNode;
  onBookmarkClick?: () => void;
  bookmarkTooltip?: string;
  isProjectorMode?: boolean;
}

/**
 * 3D Fantasy Open Book (Grimoire / Slot Symbol Archetype)
 * Inspired by Dribbble "Animation of the slot symbol: a Book"
 * 
 * Key Features:
 * 1. Radiant magical halo & ambient ember glow
 * 2. Deep obsidian & enchanted dragon-leather hardcover with embossed gold border
 * 3. 4 Heavy 3D ornate gilded filigree corner brackets with relief engraving
 * 4. Hanging royal crimson silk ribbon with an illuminated pulsing magical ruby gem
 * 5. Gleaming antique gold-leaf (gilded) page stack cross-section at bottom & sides
 * 6. Dual M-shaped arched page surfaces dipping into a deep 3D center spine gutter
 * 7. Real physical page stack contour lines matching the 3D drawing anatomy
 */
export const Book3DFrame: React.FC<Book3DFrameProps> = ({
  children,
  onBookmarkClick,
  bookmarkTooltip = 'Tartalomjegyzék',
  isProjectorMode = false,
}) => {
  const [isRibbonHovered, setIsRibbonHovered] = useState(false);

  return (
    <div
      id="book-3d-outer-perspective"
      className={`relative w-full max-w-6xl mx-auto transition-all duration-500 select-text ${
        isProjectorMode ? 'scale-100' : 'book-perspective-tilt'
      }`}
    >
      {/* ================================================================ */}
      {/* 1. RADIANT MAGICAL HALO & TABLE SHADOW                           */}
      {/* ================================================================ */}
      {/* Ethereal golden/arcane aura emanating behind the grimoire */}
      <div
        id="book-fantasy-halo"
        aria-hidden="true"
        className="absolute -inset-6 sm:-inset-10 rounded-[60px] fantasy-book-halo pointer-events-none z-0"
      />

      {/* Deep perspective cast shadow */}
      <div
        id="book-table-shadow"
        aria-hidden="true"
        className="absolute -bottom-8 -right-8 left-8 top-8 rounded-[48px] pointer-events-none z-0 book-desk-cast-shadow"
      />

      {/* ================================================================ */}
      {/* 2. ENCHANTED LEATHER HARDCOVER BASE                              */}
      {/* ================================================================ */}
      <div
        id="book-hardcover-shell"
        className="relative z-10 rounded-[28px] sm:rounded-[40px] p-2 sm:p-3.5 md:p-5 book-leather-backcover border-[3px] border-[#DDA843]/60 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95)]"
      >
        {/* ============================================================== */}
        {/* 3. FOUR 3D ORNATE GILDED FILIGREE CORNER BRACKETS             */}
        {/* ============================================================== */}
        {/* Top-Left Corner Filigree */}
        <div className="absolute top-2 left-2 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full text-[#F5D061]">
            <path d="M 4 4 L 42 4 Q 30 14, 18 18 Q 14 30, 4 42 Z" fill="url(#goldFiligreeGrad)" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M 8 8 L 30 8 Q 22 14, 14 22 L 8 30 Z" fill="#784E11" opacity="0.6" />
            <circle cx="12" cy="12" r="3" fill="#FFE58F" />
            <circle cx="12" cy="12" r="1.5" fill="#8B261D" />
          </svg>
        </div>

        {/* Top-Right Corner Filigree */}
        <div className="absolute top-2 right-2 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full text-[#F5D061]">
            <path d="M 56 4 L 18 4 Q 30 14, 42 18 Q 46 30, 56 42 Z" fill="url(#goldFiligreeGrad)" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M 52 8 L 30 8 Q 38 14, 46 22 L 52 30 Z" fill="#784E11" opacity="0.6" />
            <circle cx="48" cy="12" r="3" fill="#FFE58F" />
            <circle cx="48" cy="12" r="1.5" fill="#8B261D" />
          </svg>
        </div>

        {/* Bottom-Left Corner Filigree */}
        <div className="absolute bottom-3 left-2 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full text-[#F5D061]">
            <path d="M 4 56 L 42 56 Q 30 46, 18 42 Q 14 30, 4 18 Z" fill="url(#goldFiligreeGrad)" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M 8 52 L 30 52 Q 22 46, 14 38 L 8 30 Z" fill="#784E11" opacity="0.6" />
            <circle cx="12" cy="48" r="3" fill="#FFE58F" />
            <circle cx="12" cy="48" r="1.5" fill="#8B261D" />
          </svg>
        </div>

        {/* Bottom-Right Corner Filigree */}
        <div className="absolute bottom-3 right-2 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full text-[#F5D061]">
            <path d="M 56 56 L 18 56 Q 30 46, 42 42 Q 46 30, 56 18 Z" fill="url(#goldFiligreeGrad)" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M 52 52 L 30 52 Q 38 46, 46 38 L 52 30 Z" fill="#784E11" opacity="0.6" />
            <circle cx="48" cy="48" r="3" fill="#FFE58F" />
            <circle cx="48" cy="48" r="1.5" fill="#8B261D" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 4. TOP ARCHED PROFILE & SILK RIBBON WITH GLOWING GEM           */}
        {/* ============================================================== */}
        <div className="relative w-full overflow-visible">
          {/* Hanging Red Silk Bookmark Ribbon with Magical Gem Clasp */}
          {onBookmarkClick && (
            <div
              className="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center cursor-pointer group"
              onClick={onBookmarkClick}
              onMouseEnter={() => setIsRibbonHovered(true)}
              onMouseLeave={() => setIsRibbonHovered(false)}
              title={bookmarkTooltip}
            >
              {/* Golden Clasp Mounting Ring */}
              <div className="w-6 h-3 rounded-t-md bg-gradient-to-b from-[#FFE89E] to-[#B8860B] border-t border-[#FFF2B2] shadow-md flex items-center justify-center -mb-1 z-10" />

              {/* Silk Ribbon Body with Gold Trim */}
              <div className="relative w-9 sm:w-11 h-14 sm:h-16 bg-gradient-to-b from-[#8E1C15] via-[#B82B20] to-[#6E140E] shadow-2xl border-x-2 border-[#E5B842] flex flex-col items-center justify-center text-[#F4D068] group-hover:scale-105 transition-transform">
                {/* Glowing Magical Ruby / Arcane Jewel in Clasp */}
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[#FF4D4D] via-[#B81414] to-[#4A0000] border-2 border-[#FFE28A] flex items-center justify-center animate-gem-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]">
                  {/* Facet glint */}
                  <div className="absolute top-1 left-1.5 w-1.5 h-1 rounded-full bg-white/80 transform -rotate-45" />
                  <Sparkles className="w-3 h-3 text-[#FFE89E] drop-shadow" />
                </div>
                <Bookmark className="w-3.5 h-3.5 fill-current text-[#F4D068] mt-1 drop-shadow" />
              </div>

              {/* Notched swallowtail ribbon bottom */}
              <div className="w-0 h-0 border-l-[18px] sm:border-l-[22px] border-l-transparent border-r-[18px] sm:border-r-[22px] border-r-transparent border-t-[12px] sm:border-t-[14px] border-t-[#6E140E]" />

              <span
                className={`mt-1.5 text-[10px] font-title font-bold text-[#F4EDD6] bg-[#1A0B06]/95 px-3 py-0.5 rounded-full shadow-lg border border-[#E5B842]/60 transition-opacity whitespace-nowrap ${
                  isRibbonHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {bookmarkTooltip}
              </span>
            </div>
          )}

          {/* SVG Vector Top Arched Profile with Gilded Gold Leaf Edging */}
          <svg
            viewBox="0 0 1000 38"
            preserveAspectRatio="none"
            className="w-full h-8 sm:h-10 block drop-shadow-sm"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="goldFiligreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="30%" stopColor="#E5B842" />
                <stop offset="70%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#66460C" />
              </linearGradient>

              <linearGradient id="gildedTopRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="40%" stopColor="#E5B842" />
                <stop offset="80%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#7A5212" />
              </linearGradient>
            </defs>

            {/* Top hardcover rim behind pages */}
            <path
              d="M 12 34 Q 255 12, 498 24 Q 745 12, 988 34 L 994 38 L 6 38 Z"
              fill="#1A0B06"
              stroke="#DDA843"
              strokeWidth="1.2"
            />

            {/* Gilded Top Page Block Edge (Aranyél) */}
            <path
              d="M 16 34 Q 255 14, 498 25 Q 745 14, 984 34 L 984 38 L 16 38 Z"
              fill="url(#gildedTopRimGrad)"
            />

            {/* Top page surface silhouette (Left page arch + Right page arch) */}
            <path
              d="M 20 36 Q 255 17, 500 27 Q 745 17, 980 36 L 980 38 L 20 38 Z"
              fill="#FBF8EF"
            />

            {/* Fanned loose corner pages at top right (Drawing Step 7) */}
            <path d="M 966 27 Q 977 21, 988 25" stroke="#7A5212" strokeWidth="1.6" fill="none" />
            <path d="M 970 31 Q 981 24, 991 29" stroke="#7A5212" strokeWidth="1.6" fill="none" />

            {/* Center spine dip line */}
            <line x1="500" y1="27" x2="500" y2="38" stroke="#54370D" strokeWidth="2.5" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 5. MAIN DOUBLE-PAGE SPREAD BODY WITH GILDED 3D SIDE EDGES      */}
        {/* ============================================================== */}
        <div className="relative flex items-stretch">
          {/* Left Gilded 3D Side Thickness of Pages */}
          <div
            id="book-left-edge-thickness"
            className="hidden sm:block w-3.5 sm:w-4.5 md:w-5.5 shrink-0 rounded-l-md book-side-page-edge-left border-l-2 border-[#DDA843]"
            style={{
              background: 'repeating-linear-gradient(180deg, #FFF2B2 0px, #E5B842 2px, #9E742A 3px, #E8C15A 5px)',
              boxShadow: 'inset -2px 0 4px rgba(60,35,10,0.5), inset 1px 0 3px rgba(255,255,255,0.7)',
            }}
            aria-hidden="true"
          />

          {/* Real Double-Page Surface (Interactive Content Canvas) */}
          <div
            id="book-double-page-surface"
            className="relative flex-1 rounded-sm overflow-hidden min-h-[580px] sm:min-h-[660px] flex flex-col justify-between shadow-2xl"
          >
            {/* Center 3D Deep Spine Gutter Crease */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 pointer-events-none z-30 book-center-spine-gutter" />

            {/* Left Page & Right Page 3D Cylindrical Lighting Gradients */}
            <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 pointer-events-none z-0">
              {/* Left Page arched lighting */}
              <div className="page-surface-3d-left hidden lg:block border-r border-[#24140D]/10" />
              {/* Right Page arched lighting */}
              <div className="page-surface-3d-right hidden lg:block border-l border-[#24140D]/10" />
              {/* Mobile Single Page View */}
              <div className="page-surface-3d-mobile lg:hidden" />
            </div>

            {/* Subtle Gold Filigree Page Corner Flourishes inside pages */}
            <div className="absolute top-2 left-2 w-8 h-8 opacity-40 pointer-events-none z-20 text-[#B8860B] hidden sm:block">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 2 20 C 2 8, 8 2, 20 2" />
                <path d="M 6 22 C 6 12, 12 6, 22 6" />
              </svg>
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 opacity-40 pointer-events-none z-20 text-[#B8860B] hidden sm:block">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 38 20 C 38 8, 32 2, 20 2" />
                <path d="M 34 22 C 34 12, 28 6, 18 6" />
              </svg>
            </div>

            {/* Injected Content (Spread / TOC / Lesson) */}
            <div className="relative z-10 p-3 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
              {children}
            </div>
          </div>

          {/* Right Gilded 3D Side Thickness of Pages */}
          <div
            id="book-right-edge-thickness"
            className="hidden sm:block w-3.5 sm:w-4.5 md:w-5.5 shrink-0 rounded-r-md book-side-page-edge-right border-r-2 border-[#DDA843]"
            style={{
              background: 'repeating-linear-gradient(180deg, #FFF2B2 0px, #E5B842 2px, #9E742A 3px, #E8C15A 5px)',
              boxShadow: 'inset 2px 0 4px rgba(60,35,10,0.5), inset -1px 0 3px rgba(255,255,255,0.7)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* ============================================================== */}
        {/* 6. GILDED 3D BOTTOM PAGE STACK (THE DEFINING DRAWING FEATURE!) */}
        {/* Layered antique gold-leaf pages & protruding leather spine loop */}
        {/* ============================================================== */}
        <div className="relative w-full -mt-1 z-20">
          <svg
            viewBox="0 0 1000 68"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16 md:h-18 block drop-shadow-xl"
            aria-hidden="true"
          >
            <defs>
              {/* Gilded Gold Leaf Stack Gradient */}
              <linearGradient id="gildedStackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF4BD" />
                <stop offset="25%" stopColor="#F5D061" />
                <stop offset="60%" stopColor="#C9972E" />
                <stop offset="90%" stopColor="#8A5F15" />
                <stop offset="100%" stopColor="#573807" />
              </linearGradient>

              {/* Spine loop leather gradient with gold reflection */}
              <linearGradient id="spineLeatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3E1C12" />
                <stop offset="50%" stopColor="#220D06" />
                <stop offset="100%" stopColor="#100502" />
              </linearGradient>
            </defs>

            {/* --- LEATHER HARDCOVER EXTENSION UNDER PAGES --- */}
            {/* Left cover shelf */}
            <path
              d="M 8 0 Q 255 14, 475 0 L 475 52 Q 255 64, 6 48 Z"
              fill="#180B05"
              stroke="#B8860B"
              strokeWidth="1.8"
            />
            {/* Right cover shelf */}
            <path
              d="M 525 0 Q 745 14, 992 0 L 994 48 Q 745 64, 525 52 Z"
              fill="#180B05"
              stroke="#B8860B"
              strokeWidth="1.8"
            />

            {/* --- PROTRUDING CENTER LEATHER SPINE LOOP (\___/) --- */}
            <path
              d="M 466 0 Q 475 24, 482 50 Q 492 66, 500 66 Q 508 66, 518 50 Q 525 24, 534 0 Z"
              fill="url(#spineLeatherGrad)"
              stroke="#B8860B"
              strokeWidth="2"
            />
            {/* Center spine hollow shadow & golden embossed rune mark */}
            <ellipse cx="500" cy="54" rx="14" ry="5" fill="#0A0301" opacity="0.8" />
            <circle cx="500" cy="48" r="2.5" fill="#E5B842" />

            {/* --- LEFT PAGE BLOCK CROSS-SECTION (GILDED GOLD LEAF) --- */}
            <path
              d="M 16 0 Q 255 16, 480 0 L 476 44 Q 255 58, 12 42 Z"
              fill="url(#gildedStackGrad)"
              stroke="#7A5212"
              strokeWidth="2"
            />
            {/* Individual Layered Paper Contour Lines with Gold Sheen (Left Side) */}
            <path
              d="M 15 9 Q 255 25, 479 9"
              stroke="#FFF2B2"
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 14 18 Q 255 33, 478 18"
              stroke="#8A5F15"
              strokeWidth="1.4"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 13 27 Q 255 42, 477 27"
              stroke="#FFF2B2"
              strokeWidth="1.4"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M 13 36 Q 255 50, 476 36"
              stroke="#573807"
              strokeWidth="1.6"
              fill="none"
              opacity="0.95"
            />

            {/* --- RIGHT PAGE BLOCK CROSS-SECTION (GILDED GOLD LEAF) --- */}
            <path
              d="M 520 0 Q 745 16, 984 0 L 988 42 Q 745 58, 524 44 Z"
              fill="url(#gildedStackGrad)"
              stroke="#7A5212"
              strokeWidth="2"
            />
            {/* Individual Layered Paper Contour Lines with Gold Sheen (Right Side) */}
            <path
              d="M 521 9 Q 745 25, 985 9"
              stroke="#FFF2B2"
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 522 18 Q 745 33, 986 18"
              stroke="#8A5F15"
              strokeWidth="1.4"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 523 27 Q 745 42, 987 27"
              stroke="#FFF2B2"
              strokeWidth="1.4"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M 524 36 Q 745 50, 987 36"
              stroke="#573807"
              strokeWidth="1.6"
              fill="none"
              opacity="0.95"
            />

            {/* Outer ink contour defining the bottom edge */}
            <path
              d="M 12 42 Q 255 58, 476 44"
              stroke="#2E1805"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M 524 44 Q 745 58, 988 42"
              stroke="#2E1805"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
