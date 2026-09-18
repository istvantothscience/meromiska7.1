import React, { useRef, useState, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Globe,
  ExternalLink,
  KeyRound,
  X,
} from 'lucide-react';
import type { Lesson, UserProfile } from '../types';
import { resolveSceneImage, badgeHidvero, miskaCoverImg } from '../content/lessons';
import { WatercolorIllustration } from './illustrations/WatercolorIllustration';
import { TaskConversion } from './tasks/TaskConversion';
import { TaskAveraging } from './tasks/TaskAveraging';
import { TaskReasoning } from './tasks/TaskReasoning';
import { TaskGoogleEarth } from './tasks/TaskGoogleEarth';
import { BookAuthSpread } from './auth/BookAuthSpread';
import { BookTocLeft, BookTocRight } from './toc/BookTocSpread';
import { soundFx } from '../lib/sound';

interface Props {
  lesson: Lesson;
  user: UserProfile | null;
  onUserChanged: (u: UserProfile | null) => void;
  onPointsUpdated?: (pts: number) => void;
}

interface PageWrapperProps {
  children: React.ReactNode;
  isHard?: boolean;
  pageNumber?: number;
  isCover?: boolean;
  className?: string;
}

// Every page component inside HTMLFlipBook must forward ref to the outer DOM element
const BookPage = forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ children, isHard = false, pageNumber, isCover = false, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        data-density={isHard ? 'hard' : 'soft'}
        className={`w-full h-full relative overflow-hidden select-text ${
          isCover ? 'page-cover leather-grain-rich text-[#FAF7EE]' : 'page-sheet paper-texture-warm text-[#2E1B14]'
        } ${className}`}
        style={{
          boxShadow: isCover
            ? 'inset 0 0 30px rgba(0,0,0,0.8)'
            : 'inset 0 0 20px rgba(184, 80, 66, 0.05), inset 0 0 4px rgba(46, 27, 20, 0.1)',
        }}
      >
        {/* Soft edge gradient for realistic paper fold shadow */}
        {!isCover && (
          <div className="absolute inset-y-0 w-6 pointer-events-none z-20 bg-gradient-to-r from-black/5 to-transparent left-0" />
        )}

        {/* Content */}
        <div className="w-full h-full flex flex-col relative z-10">{children}</div>

        {/* Bottom Page Number (skip on covers) */}
        {!isCover && pageNumber !== undefined && (
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10">
            <span className="font-serif text-[11px] text-[#8C6D58] bg-[#FAF7EE]/90 px-2 py-0.5 rounded border border-[#E5D9C4]">
              — {pageNumber} —
            </span>
          </div>
        )}
      </div>
    );
  }
);

BookPage.displayName = 'BookPage';

export const StoryBookFlip: React.FC<Props> = ({
  lesson,
  user,
  onUserChanged,
  onPointsUpdated,
}) => {
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 22;
  const [isMuted, setIsMuted] = useState(soundFx.isSoundMuted());
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    l1_a_atvaltas: false,
    l1_b_meres_atlagolas: false,
    l1_c_indoklas: false,
    l1_d_google_earth: false,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleSound = () => {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
    soundFx.playPageFlip();
  };

  const goToPage = (pageNum: number) => {
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flip(pageNum);
      } catch (err) {
        console.warn('Page flip navigation error:', err);
      }
    }
  };

  const next = () => {
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipNext();
      } catch (err) {
        console.warn('flipNext error:', err);
      }
    }
  };

  const prev = () => {
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipPrev();
      } catch (err) {
        console.warn('flipPrev error:', err);
      }
    }
  };

  const markTaskDone = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  // Find scenes from lesson dynamically matching 'n'
  const scenes = lesson.scenes || [];
  const scene1 = scenes.find((s) => s.n === 1) || scenes[0];
  const scene2 = scenes.find((s) => s.n === 2) || scenes[1];
  const scene3 = scenes.find((s) => s.n === 3) || scenes[2];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between px-3 py-2 mb-3 bg-[#24140D]/80 backdrop-blur-md rounded-xl border border-[#C6923C]/30 shadow-lg text-[#EFE7D2]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(3)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#3A2218] hover:bg-[#523022] text-[#EFE7D2] text-xs font-serif rounded-lg border border-[#C6923C]/40 transition-colors cursor-pointer"
            title="Tartalomjegyzék"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C6923C]" />
            <span>Tartalom</span>
          </button>

          <button
            onClick={() => goToPage(1)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#3A2218] hover:bg-[#523022] text-[#EFE7D2] text-xs font-serif rounded-lg border border-[#C6923C]/40 transition-colors cursor-pointer"
            title="Lapozás a bejelentkezéshez (2. oldal)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{user ? user.name : 'Belépés (2. oldal)'}</span>
          </button>

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#B85042]/90 hover:bg-[#A34335] text-white text-xs font-serif rounded-lg border border-[#C6923C]/50 transition-colors cursor-pointer shadow-sm"
            title="Gyors bejelentkező ablak megnyitása"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FDFBF7]" />
            <span className="hidden sm:inline">Gyors ablak</span>
          </button>
        </div>

        {/* Current Page Status */}
        <div className="flex items-center gap-2 font-serif text-xs">
          <span className="text-[#C6923C] font-bold">
            {currentPage === 0
              ? 'Elülső Borító'
              : currentPage >= totalPages - 1
              ? 'Hátsó Borító'
              : `${currentPage}. oldal`}
          </span>
          <span className="text-[#8C6D58]">/ {totalPages}</span>
        </div>

        {/* Audio Mute & Nav controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/60 border-rose-600/40 text-rose-300'
                : 'bg-[#3A2218] border-[#C6923C]/40 text-[#EFE7D2] hover:bg-[#523022]'
            }`}
            title={isMuted ? 'Hang bekapcsolása' : 'Lapzizzenés némítása'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#C6923C]" />}
          </button>

          <button
            onClick={prev}
            disabled={currentPage <= 0}
            className="p-1.5 bg-[#3A2218] hover:bg-[#523022] disabled:opacity-40 disabled:hover:bg-[#3A2218] rounded-lg border border-[#C6923C]/40 text-[#EFE7D2] transition-colors cursor-pointer"
            title="Előző oldal"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={next}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-40 disabled:hover:bg-[#B85042] rounded-lg border border-[#C6923C]/50 text-white font-bold transition-colors cursor-pointer"
            title="Következő oldal"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Book Frame Container */}
      <div className="relative w-full max-w-[1080px] flex justify-center items-center py-2 px-1">
        {/* Soft magical backdrop glow */}
        <div className="absolute inset-0 max-w-[980px] mx-auto h-[740px] fantasy-book-halo pointer-events-none" />

        {/* StPageFlip Component */}
        <HTMLFlipBook
          width={500}
          height={680}
          size="stretch"
          minWidth={320}
          maxWidth={560}
          minHeight={450}
          maxHeight={780}
          maxShadowOpacity={0.55}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={true}
          startPage={0}
          drawShadow={true}
          flippingTime={750}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          clickEventForward={true}
          disableFlipByClick={true}
          className="mero-miska-flipbook rounded-lg shadow-2xl"
          style={{ margin: '0 auto' }}
          startZIndex={0}
          autoSize={true}
          onFlip={handleFlip}
          ref={flipBookRef}
        >
          {/* ================= PAGE 0: FRONT COVER ================= */}
          <BookPage isHard isCover pageNumber={0}>
            <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 border-4 border-[#C6923C] rounded-lg relative">
              {/* Ornate corner embellishments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#E5B842]" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#E5B842]" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#E5B842]" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#E5B842]" />

              <div className="text-center pt-6">
                <span className="text-xs font-serif uppercase tracking-[0.3em] text-[#E5B842] block mb-2 font-bold">
                  Fizika 7. — Tananyag-mesekönyv
                </span>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#E5B842] to-transparent mx-auto mb-4" />
                <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFF2B2] tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  MÉRŐ MISKA
                  <br />
                  <span className="text-[#E5B842] text-2xl sm:text-3xl block mt-1">PRÓBÁI</span>
                </h1>
              </div>

              {/* Central Watercolor Portrait of Mérő Miska */}
              <div className="relative my-2 sm:my-4 flex flex-col items-center justify-center">
                {/* Ornate Gilded Medallion Frame */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-3 border-[#E5B842] p-1.5 flex items-center justify-center bg-gradient-to-b from-[#7A4515] via-[#4A1E14] to-[#1A0B06] shadow-2xl relative">
                  <div className="w-full h-full rounded-full border border-[#E5B842]/70 overflow-hidden relative watercolor-mat shadow-[inset_0_0_20px_rgba(42,20,10,0.6)]">
                    <img
                      src={miskaCoverImg}
                      alt="Mérő Miska kézzel festett akvarell rajza a mérőzsinórral"
                      className="w-full h-full object-cover object-center watercolor-canvas transform transition-transform duration-700 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {/* Organic watercolor paper texture overlay */}
                    <div className="absolute inset-0 pointer-events-none watercolor-paper-grain mix-blend-multiply opacity-40" />
                    {/* Soft vignette edge pooling */}
                    <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_0_15px_rgba(30,12,6,0.6)]" />
                  </div>
                </div>

                {/* Subtitle banner under Miska's portrait */}
                <div className="mt-2 px-3 py-0.5 rounded-full bg-[#1A0B06]/85 border border-[#E5B842]/60 shadow-md">
                  <span className="font-serif text-[11px] sm:text-xs text-[#FFF2B2] font-semibold tracking-wide">
                    Miska és a bűvös mérőzsinór
                  </span>
                </div>
              </div>

              <div className="w-full text-center pb-4">
                <p className="font-serif text-xs italic text-[#E5D9C4] mb-4">
                  „Aki jól mér, az nem téved.”
                </p>
                <button
                  onClick={next}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#B85042] via-[#8B261D] to-[#B85042] hover:brightness-110 text-white font-serif font-bold text-sm rounded-full border border-[#E5B842] shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer transition-transform hover:scale-105"
                >
                  <BookOpen className="w-4 h-4 text-[#E5B842]" />
                  <span>Kaland kezdése — Lapozz bele</span>
                </button>
                <span className="text-[10px] text-[#A89278] block mt-2">
                  (vagy húzd el az egeret a lap szélén)
                </span>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 1: AUTH INFO (LEFT) ================= */}
          <BookPage pageNumber={1}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14] select-none">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    Előszó
                  </span>
                  <span className="text-xs font-serif italic text-[#8C6D58]">
                    A hetedikes fizika kapuja
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-3">
                  Üdvözlünk a Pontkövetőben!
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-[#4A382D] leading-relaxed">
                  <p>
                    Ez a mesekönyv egy teljes tanévet kísér végig a 7. osztályos fizika órákon. Minden fejezet egy-egy fizikaórát dolgoz fel: a mese fonalát követve valós méréseket, átváltásokat és tudományos érveléseket végzel el.
                  </p>
                  <p className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg">
                    <strong>Közös pontrendszer:</strong> A könyv összekapcsolódik az iskolai Fizika Pontkövetővel (<span className="font-mono text-[#8B261D]">fizika-pontkoveto.vercel.app</span>). A helyesen megoldott próbákért valódi pontok kerülnek a neved mellé!
                  </p>
                  <p>
                    Ha még nincs felhasználói fiókod, kérd a fizika tanárodat, vagy jelentkezz be a jobb oldali lapon a meglévő osztálykódoddal.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DFCDB3] text-center">
                <div className="text-xs text-[#8C6D58] font-serif italic mb-2">
                  Jelentkezz be a szemközti oldalon →
                </div>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 2: AUTH LOGIN FORM (RIGHT) ================= */}
          <BookPage pageNumber={2}>
            <BookAuthSpread
              user={user}
              onUserChanged={onUserChanged}
              onGoToToc={() => goToPage(3)}
            />
          </BookPage>

          {/* ================= PAGE 3: TOC LEFT (1-4) ================= */}
          <BookPage pageNumber={3}>
            <BookTocLeft onOpenLesson={() => goToPage(5)} />
          </BookPage>

          {/* ================= PAGE 4: TOC RIGHT (5-8) ================= */}
          <BookPage pageNumber={4}>
            <BookTocRight onOpenLesson={() => goToPage(5)} />
          </BookPage>

          {/* ================= PAGE 5: SCENE 1 ILLUSTRATION (LEFT) ================= */}
          <BookPage pageNumber={5}>
            <WatercolorIllustration
              src={resolveSceneImage(lesson.lesson_id, scene1?.image || '01_miska_a_faluban.png')}
              alt={scene1?.title || '1. Jelenet'}
              sceneNumber={1}
              sceneTitle={scene1?.title || 'Miska szerencsét próbál'}
            />
          </BookPage>

          {/* ================= PAGE 6: SCENE 1 TEXT (RIGHT) ================= */}
          <BookPage pageNumber={6}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    1. Fejezet
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58]">1 / 3 jelenet</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-4">
                  {scene1?.title || 'Miska szerencsét próbál'}
                </h3>
                <p className="font-serif text-base sm:text-lg text-[#3E2E23] leading-relaxed mb-4 indent-4">
                  {scene1?.text}
                </p>
                {scene1?.quote && (
                  <blockquote className="my-4 p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-lg font-serif italic text-base text-[#2E1B14] shadow-xs">
                    „{scene1.quote}”
                  </blockquote>
                )}
              </div>
              <div className="pt-2 text-right text-xs text-[#8C6D58] font-serif italic">
                Lapozz a vitához a hídnál →
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 7: SCENE 2 ILLUSTRATION (LEFT) ================= */}
          <BookPage pageNumber={7}>
            <WatercolorIllustration
              src={resolveSceneImage(lesson.lesson_id, scene2?.image || '02_meresi_zurzavar.png')}
              alt={scene2?.title || '2. Jelenet'}
              sceneNumber={2}
              sceneTitle={scene2?.title || 'A híd, amely mindenkinek más hosszú'}
            />
          </BookPage>

          {/* ================= PAGE 8: SCENE 2 TEXT (RIGHT) ================= */}
          <BookPage pageNumber={8}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    1. Fejezet
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58]">2 / 3 jelenet</span>
                  <span className="ml-auto text-[10px] bg-[#B85042] text-white px-2 py-0.5 rounded font-bold uppercase">
                    Próbatétel vár
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-4">
                  {scene2?.title || 'A híd, amely mindenkinek más hosszú'}
                </h3>
                <p className="font-serif text-base sm:text-lg text-[#3E2E23] leading-relaxed mb-4 indent-4">
                  {scene2?.text}
                </p>
                {scene2?.quote && (
                  <blockquote className="my-4 p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-lg font-serif italic text-base text-[#2E1B14] shadow-xs">
                    „{scene2.quote}”
                  </blockquote>
                )}
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-[#8C6D58] font-serif">
                <span className="text-[#B85042] font-bold">1. Próba: Mértékegység-átváltás</span>
                <span className="italic">Lapozz a feladathoz →</span>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 9: TASK A CONTEXT (LEFT) ================= */}
          <BookPage pageNumber={9}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    1. Próba
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
                    l1_a_atvaltas
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#8B261D] mb-3">
                  Egységes mértékegységek
                </h3>
                <p className="font-serif text-sm text-[#4A382D] leading-relaxed mb-4">
                  A falu lakói azért nem tudtak megegyezni, mert ki-ki a saját testrészével mérte a hidat: lépéssel, arasszal, lábbal. Miska azonban tudta: a pontos fizikai méréshez szabványosított egységekre van szükség.
                </p>

                <div className="p-4 bg-white/80 rounded-xl border border-[#C8B89E] space-y-2 text-xs">
                  <div className="font-bold text-[#8B261D] text-sm">Hosszúság alapegysége:</div>
                  <div className="font-mono text-center text-sm py-1.5 bg-[#FAF4E5] rounded border border-[#DFCDB3] font-bold text-[#5A4232]">
                    1 méter (m) = 10 dm = 100 cm = 1000 mm
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#5A4232] pt-1">
                    <li>1 kilométer (km) = 1 000 m</li>
                    <li>1 deciméter (dm) = 10 cm = 0,1 m</li>
                    <li>1 centiméter (cm) = 10 mm = 0,01 m</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-xs text-[#2E1B14]">
                <strong>Feladatod a szemközti lapon:</strong> Számítsd át az adatokat, és rögzítsd a helyes választ 1 fizika pontért!
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 10: TASK A FORM (RIGHT) ================= */}
          <BookPage pageNumber={10}>
            <TaskConversion
              user={user}
              onPointsUpdated={onPointsUpdated}
              onCompleted={() => markTaskDone('l1_a_atvaltas')}
            />
          </BookPage>

          {/* ================= PAGE 11: SCENE 3 ILLUSTRATION (LEFT) ================= */}
          <BookPage pageNumber={11}>
            <WatercolorIllustration
              src={resolveSceneImage(lesson.lesson_id, scene3?.image || '03_miska_megmeri_a_hidat.png')}
              alt={scene3?.title || '3. Jelenet'}
              sceneNumber={3}
              sceneTitle={scene3?.title || 'A mérőzsinór próbája'}
            />
          </BookPage>

          {/* ================= PAGE 12: SCENE 3 TEXT (RIGHT) ================= */}
          <BookPage pageNumber={12}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    1. Fejezet
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58]">3 / 3 jelenet</span>
                  <span className="ml-auto text-[10px] bg-[#B85042] text-white px-2 py-0.5 rounded font-bold uppercase">
                    3 Próbatétel következik
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-4">
                  {scene3?.title || 'A mérőzsinór próbája'}
                </h3>
                <p className="font-serif text-base sm:text-lg text-[#3E2E23] leading-relaxed mb-4 indent-4">
                  {scene3?.text}
                </p>
                {scene3?.quote && (
                  <blockquote className="my-4 p-3.5 bg-[#E7E8D1] border-l-4 border-[#B85042] rounded-r-lg font-serif italic text-base text-[#2E1B14] shadow-xs">
                    „{scene3.quote}”
                  </blockquote>
                )}
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-[#8C6D58] font-serif">
                <span className="text-[#B85042] font-bold">2. Próba: Kétszeri mérés és átlagolás</span>
                <span className="italic">Lapozz a méréshez →</span>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 13: TASK B CONTEXT (LEFT) ================= */}
          <BookPage pageNumber={13}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    2. Próba
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
                    l1_b_meres_atlagolas
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#8B261D] mb-3">
                  A kétszeri mérés és az átlagolás
                </h3>
                <p className="font-serif text-sm text-[#4A382D] leading-relaxed mb-4">
                  „A híd nem nőtt meg, de én tévedhetek!” — Miska szavai a fizika egyik legfontosabb alapszabályát fogalmazzák meg.
                </p>

                <div className="p-4 bg-white/80 rounded-xl border border-[#C8B89E] space-y-2 text-xs text-[#4A382D]">
                  <div className="font-bold text-[#8B261D] text-sm">Miért mérünk többször?</div>
                  <p>
                    Egyetlen mérés során könnyen becsúszhat véletlen hiba: meglazulhat a mérőszalag, rossz szögből nézzük a beosztást, vagy elcsúszik a kezünk.
                  </p>
                  <p>
                    Ha többször megmérjük ugyanazt a távolságot, és képezzük az adatok <strong>számtani közepét (átlagát)</strong>, a véletlen hibák kiegyenlítik egymást, és sokkal közelebb kerülünk a valós értékhez!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-xs text-[#2E1B14]">
                <strong>Szemközti feladat:</strong> Mérjetek le kétszer egy távolságot, számoljátok ki az átlagot, és szerezzétek meg az újabb fizika pontot!
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 14: TASK B FORM (RIGHT) ================= */}
          <BookPage pageNumber={14}>
            <TaskAveraging
              user={user}
              onPointsUpdated={onPointsUpdated}
              onCompleted={() => markTaskDone('l1_b_meres_atlagolas')}
            />
          </BookPage>

          {/* ================= PAGE 15: TASK C CONTEXT (LEFT) ================= */}
          <BookPage pageNumber={15}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    3. Próba
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
                    l1_c_indoklas
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#8B261D] mb-3">
                  Tudományos érvelés
                </h3>
                <p className="font-serif text-sm text-[#4A382D] leading-relaxed mb-4">
                  A jó fizikus nemcsak számolni tud, hanem szabatosan meg is tudja indokolni a megfigyeléseit a természet törvényei alapján.
                </p>

                <div className="p-4 bg-white/80 rounded-xl border border-[#C8B89E] space-y-2 text-xs text-[#4A382D]">
                  <div className="font-bold text-[#8B261D] text-sm">Az emberi mértékek hibája:</div>
                  <p>
                    A középkorban gyakran használtak lépést, lábat, rőföt vagy hüvelyket. De a molnár lépése hosszabb volt a kovácsénál, a kovács tenyere szélesebb volt a molnárénál.
                  </p>
                  <p>
                    A tudomány és a kereskedelem csak akkor fejlődhetett, amikor nemzetközi méteretalont hoztak létre, amit senki sem változtathat kénye-kedve szerint.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-xs text-[#2E1B14]">
                <strong>Szemközti feladat:</strong> Fogalmazd meg saját szavaiddal (min. 20 betű), miért nem megbízható a lépés vagy arasz!
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 16: TASK C FORM (RIGHT) ================= */}
          <BookPage pageNumber={16}>
            <TaskReasoning
              user={user}
              onPointsUpdated={onPointsUpdated}
              onCompleted={() => markTaskDone('l1_c_indoklas')}
            />
          </BookPage>

          {/* ================= PAGE 17: TASK D CONTEXT (LEFT) ================= */}
          <BookPage pageNumber={17}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
                    4. Próba
                  </span>
                  <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
                    l1_d_google_earth
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#8B261D] mb-3">
                  Mérés a 21. században
                </h3>
                <p className="font-serif text-sm text-[#4A382D] leading-relaxed mb-4">
                  Miska mérőzsinórját ma már kiegészítik a műholdas távérzékelés és a digitális térképek eszközei.
                </p>

                <div className="p-4 bg-white/80 rounded-xl border border-[#C8B89E] space-y-2 text-xs text-[#4A382D]">
                  <div className="font-bold text-[#8B261D] text-sm">Hogyan mérnek ma a műholdak?</div>
                  <p>
                    A Föld körül keringő műholdak nagy felbontású optikai és radarképeket készítenek. A Google Earth vonalzó eszköze a Föld gömbi felszínét figyelembe véve centiméteres pontossággal képes kiszámítani folyók, utak és hidak távolságát.
                  </p>
                  <p>
                    Így egy budapesti diák a szobájából is megmérheti a Megyeri hidat vagy a San Francisco-i Golden Gate hidat!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-xs text-[#2E1B14]">
                <strong>Szemközti feladat:</strong> Nyisd meg a Google Earth-öt vagy Google Térképet, mérj le egy tetszőleges hidat, és rögzítsd az adatait!
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 18: TASK D FORM (RIGHT) ================= */}
          <BookPage pageNumber={18}>
            <TaskGoogleEarth
              user={user}
              onPointsUpdated={onPointsUpdated}
              onCompleted={() => markTaskDone('l1_d_google_earth')}
            />
          </BookPage>

          {/* ================= PAGE 19: EPILOGUE & BADGE (LEFT) ================= */}
          <BookPage pageNumber={19}>
            <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 text-[#2E1B14] text-center">
              <div>
                <div className="w-24 h-24 mx-auto mb-2 rounded-full border-2 border-[#C6923C] p-1 shadow-lg bg-gradient-to-br from-[#FAF4E5] to-[#EAE0CD] flex items-center justify-center">
                  <img
                    src={badgeHidvero}
                    alt="Hídverő Jelvény"
                    className="w-20 h-20 object-contain drop-shadow"
                  />
                </div>

                <span className="text-xs font-serif uppercase tracking-widest text-[#8C6D58] block mb-1">
                  1. Óra Teljesítve
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-1">
                  Hídverő Jelvény
                </h3>
                <p className="font-serif italic text-xs text-[#5A4232] max-w-[280px] mx-auto mb-3">
                  „Sikeresen megoldottad A híd próbáját, és megértetted a szabványos mérések fontosságát!”
                </p>
              </div>

              <div className="w-full max-w-[300px] bg-white/80 p-3 rounded-xl border border-[#C8B89E] text-xs space-y-1.5 text-left">
                <div className="font-bold text-[#8B261D] mb-1 text-center">Próbatételek állapota:</div>
                <div className="flex items-center justify-between">
                  <span>1. Átváltás (l1_a):</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pont mentve
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2. Átlagolás (l1_b):</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pont mentve
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>3. Indoklás (l1_c):</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pont mentve
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>4. Google Earth (l1_d):</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pont mentve
                  </span>
                </div>
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => goToPage(3)}
                  className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  Vissza a Tartalomjegyzékhez
                </button>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 20: CHAPTER 2 TEASER (RIGHT) ================= */}
          <BookPage pageNumber={20}>
            <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-[#2E1B14] text-center">
              <div className="pt-4">
                <span className="text-xs font-serif uppercase tracking-widest text-[#8C6D58] block mb-1">
                  Következő óra tananyaga
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-2">
                  2. Fejezet
                  <br />
                  <span className="text-xl font-normal text-[#4A382D]">
                    A két hordó és az űrmérték
                  </span>
                </h3>

                <p className="font-serif italic text-xs text-[#5A4232] max-w-[280px] mx-auto leading-relaxed my-3">
                  „Odaát, a sötétedő úton, már várta a következő próba: egy zsémbes révész, két különböző méretű hordóval, és egy kancsóval, amelyről lekopott minden jelzés…”
                </p>

                <div className="p-3 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg max-w-[280px] mx-auto text-xs text-[#2E1B14]">
                  <strong>Téma:</strong> Térfogatmérés, űrmértékek (liter, dm³, cm³), és szabálytalan testek térfogata vízkiszorítással.
                </div>
              </div>

              <div className="pb-2">
                <p className="text-xs text-[#8C6D58] font-serif italic mb-2">
                  Lapozz a hátsó borítóhoz a könyv becsukásához →
                </p>
                <button
                  onClick={() => goToPage(0)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8B261D] hover:underline font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Vissza a könyv elejére
                </button>
              </div>
            </div>
          </BookPage>

          {/* ================= PAGE 21: BACK COVER ================= */}
          <BookPage isHard isCover pageNumber={21}>
            <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 border-4 border-[#C6923C] rounded-lg relative">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#E5B842]" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#E5B842]" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#E5B842]" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#E5B842]" />

              <div className="text-center pt-8">
                <span className="text-xs font-serif uppercase tracking-[0.25em] text-[#E5B842] block mb-2">
                  Mérő Miska próbái
                </span>
                <h2 className="font-title text-2xl sm:text-3xl font-bold text-[#FFF2B2]">
                  Fizika 7. Mesekönyv
                </h2>
              </div>

              {/* Gold Seal */}
              <div className="w-28 h-28 rounded-full border-2 border-[#E5B842] p-1 flex items-center justify-center bg-gradient-to-br from-[#785317] via-[#DDA843] to-[#4A320C] shadow-2xl">
                <div className="w-full h-full rounded-full border border-[#FFF2B2]/60 flex flex-col items-center justify-center text-center p-2">
                  <Award className="w-8 h-8 text-[#FFF2B2] mb-1 drop-shadow" />
                  <span className="text-[10px] font-serif font-bold text-[#FFF2B2] tracking-wider uppercase">
                    Királyi Pecsét
                  </span>
                </div>
              </div>

              <div className="w-full text-center pb-4 text-[#E5D9C4]">
                <p className="font-serif text-xs italic mb-4">
                  Készült a 7. évfolyamos fizika tananyaghoz.
                  <br />
                  Központi pontrendszer:
                  <br />
                  <a
                    href="https://fizika-pontkoveto.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E5B842] underline hover:text-[#FFF2B2] font-mono text-xs mt-1 inline-block"
                  >
                    fizika-pontkoveto.vercel.app
                  </a>
                </p>

                <button
                  onClick={() => goToPage(0)}
                  className="px-5 py-2 bg-[#B85042] hover:bg-[#A34335] text-white font-serif font-bold text-xs rounded-full border border-[#E5B842] shadow-lg flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Könyv újranyitása (Elejére)</span>
                </button>
              </div>
            </div>
          </BookPage>
        </HTMLFlipBook>
      </div>

      {/* Bottom Floating Quick Navigation Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 mt-3 bg-[#24140D]/75 backdrop-blur-md rounded-full border border-[#C6923C]/20 shadow-md text-xs text-[#EFE7D2]">
        <button
          onClick={prev}
          disabled={currentPage <= 0}
          className="flex items-center gap-1 hover:text-[#E5B842] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer font-serif"
        >
          <ChevronLeft className="w-4 h-4" /> Vissza
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 scrollbar-none">
          <button
            onClick={() => goToPage(0)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage === 0 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            Borító
          </button>
          <button
            onClick={() => goToPage(1)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 1 && currentPage <= 2 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            Belépés
          </button>
          <button
            onClick={() => goToPage(3)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 3 && currentPage <= 4 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            Tartalom
          </button>
          <button
            onClick={() => goToPage(5)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 5 && currentPage <= 6 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            1. Jelenet
          </button>
          <button
            onClick={() => goToPage(7)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 7 && currentPage <= 8 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            2. Jelenet
          </button>
          <button
            onClick={() => goToPage(9)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 9 && currentPage <= 10 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            1. Próba (A)
          </button>
          <button
            onClick={() => goToPage(11)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 11 && currentPage <= 12 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            3. Jelenet
          </button>
          <button
            onClick={() => goToPage(13)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 13 && currentPage <= 14 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            2. Próba (B)
          </button>
          <button
            onClick={() => goToPage(15)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 15 && currentPage <= 16 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            3. Próba (C)
          </button>
          <button
            onClick={() => goToPage(17)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 17 && currentPage <= 18 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            4. Próba (D)
          </button>
          <button
            onClick={() => goToPage(19)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage >= 19 && currentPage <= 20 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            Jelvény
          </button>
          <button
            onClick={() => goToPage(21)}
            className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer transition-colors ${
              currentPage === 21 ? 'bg-[#B85042] text-white font-bold' : 'hover:bg-[#3A2218] text-[#C8B89E]'
            }`}
          >
            Hátsó borító
          </button>
        </div>

        <button
          onClick={next}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1 hover:text-[#E5B842] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer font-serif"
        >
          Előre <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Floating Login Modal Overlay */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#FAF7EE] paper-texture-warm border-2 border-[#C6923C] rounded-2xl shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#EAE2D0] text-[#5A4232] cursor-pointer"
              title="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
            <BookAuthSpread
              user={user}
              onUserChanged={(newUser) => {
                onUserChanged(newUser);
                if (newUser) {
                  setShowLoginModal(false);
                }
              }}
              onGoToToc={() => {
                setShowLoginModal(false);
                goToPage(3);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
