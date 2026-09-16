import React from 'react';
import type { UserProfile, ViewMode, Lesson } from '../types';
import {
  BookOpen,
  MonitorPlay,
  LogIn,
  Award,
  Maximize,
  Minimize,
  Sparkles,
  ChevronDown,
  ListOrdered,
} from 'lucide-react';

interface NavbarProps {
  currentMode: ViewMode;
  onToggleMode: (mode: ViewMode) => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenBadge: () => void;
  onOpenTableOfContents: () => void;
  earnedPoints: number;
  completedTasksCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentLessonTitle?: string;
  lessons: Lesson[];
  activeLessonIndex: number | null;
  onSelectLessonIndex: (index: number | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onToggleMode,
  userProfile,
  onOpenAuth,
  onOpenBadge,
  onOpenTableOfContents,
  earnedPoints,
  completedTasksCount,
  isFullscreen,
  onToggleFullscreen,
  currentLessonTitle,
  lessons,
  activeLessonIndex,
  onSelectLessonIndex,
}) => {
  const totalTasks = lessons.reduce(
    (sum, l) => sum + l.scenes.filter((s) => !!s.task).length,
    0
  );

  return (
    <header
      id="main-navbar"
      className="sticky top-2 sm:top-4 z-50 w-[96%] max-w-6xl mx-auto transition-all"
    >
      <div className="modern-glass-navbar rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* ============================================================== */}
        {/* LEFT: Modern Minimalist Brand & Chapter Picker                 */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Logo & Title */}
          <button
            type="button"
            onClick={onOpenTableOfContents}
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="Tartalomjegyzék megnyitása"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#781F17] via-[#B83828] to-[#E5B842] p-[1px] shadow-lg shadow-amber-950/50 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#1A0B06] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#F4D068] group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-title font-bold tracking-wider text-[#FAF6EC] uppercase group-hover:text-[#F4D068] transition-colors">
                  Mérő Miska
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded-full bg-[#E5B842]/15 text-[#E5B842] border border-[#E5B842]/30 text-[9px] font-semibold uppercase tracking-wider">
                  7. Fizika
                </span>
              </div>
              <span className="text-[10px] text-amber-200/60 hidden sm:block font-sans -mt-0.5">
                {activeLessonIndex === null
                  ? 'Fő tartalomjegyzék'
                  : currentLessonTitle || 'Kalandos óra'}
              </span>
            </div>
          </button>

          {/* Sleek Chapter Switcher Dropdown */}
          {lessons.length > 0 && (
            <div className="relative hidden lg:flex items-center">
              <div className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-full px-2.5 py-1 text-xs text-amber-100/90 transition-all">
                <ListOrdered className="w-3.5 h-3.5 text-[#E5B842]" />
                <select
                  aria-label="Fejezet választó"
                  value={activeLessonIndex === null ? 'toc' : String(activeLessonIndex)}
                  onChange={(e) => {
                    const val = e.target.value;
                    onSelectLessonIndex(val === 'toc' ? null : parseInt(val, 10));
                  }}
                  className="bg-transparent border-none text-xs text-[#FAF6EC] cursor-pointer focus:outline-none appearance-none pr-4 font-sans font-medium"
                >
                  <option value="toc" className="bg-[#180B06] text-[#FAF6EC]">
                    Tartalomjegyzék ({lessons.length} óra)
                  </option>
                  {lessons.map((l, idx) => (
                    <option key={l.lesson_id} value={idx} className="bg-[#180B06] text-[#FAF6EC]">
                      {l.order ?? idx + 1}. {l.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-amber-300 pointer-events-none -ml-3" />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* CENTER: Modern Segmented Switch (Könyv vs Kivetítő)            */}
        {/* ============================================================== */}
        <div className="flex items-center p-0.5 sm:p-1 rounded-full bg-black/40 border border-white/10 shadow-inner">
          <button
            id="btn-mode-book"
            type="button"
            onClick={() => onToggleMode('book')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentMode === 'book'
                ? 'bg-gradient-to-r from-[#8B261D] to-[#A83226] text-white shadow-md shadow-red-950/60 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${currentMode === 'book' ? 'text-amber-300' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Könyv</span>
          </button>

          <button
            id="btn-mode-projector"
            type="button"
            onClick={() => onToggleMode('projector')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentMode === 'projector'
                ? 'bg-gradient-to-r from-[#8B261D] to-[#A83226] text-white shadow-md shadow-red-950/60 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MonitorPlay className={`w-3.5 h-3.5 ${currentMode === 'projector' ? 'text-amber-300' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Kivetítő</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* RIGHT: Points Pill, Profile Avatar, Fullscreen Toggle          */}
        {/* ============================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick TOC Button for Mobile / Compact */}
          <button
            id="btn-navbar-toc-pill"
            type="button"
            onClick={onOpenTableOfContents}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
              activeLessonIndex === null
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300'
            }`}
            title="Ugrás a Tartalomjegyzékhez"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Tartalom</span>
          </button>

          {/* Points & Badge Pill (Modern Gamification Widget) */}
          <button
            id="btn-badge-trigger"
            type="button"
            onClick={onOpenBadge}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all group shadow-xs"
            title="Próbatétel pontok és kitüntetések"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight">{earnedPoints} <span className="text-[10px] text-amber-400/70 font-normal">pont</span></span>
            <span className="hidden xl:inline text-[11px] text-stone-400 border-l border-amber-500/30 pl-1.5 ml-0.5">
              {completedTasksCount}/{totalTasks || 3} próba
            </span>
          </button>

          {/* User Auth Pill */}
          <button
            id="btn-auth-trigger"
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-stone-200 text-xs font-medium transition-all shadow-xs"
          >
            {userProfile ? (
              <>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B261D] to-[#E5B842] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  {userProfile.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate font-medium text-xs">
                  {userProfile.name}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-xs font-semibold">Belépés</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={onToggleFullscreen}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title={isFullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyős nézet'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

