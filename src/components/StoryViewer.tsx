import React, { useEffect, useState } from 'react';
import type { Lesson, Scene, TaskSubmissionState } from '../types';
import { resolveSceneImage } from '../content/lessons';
import { TaskDispatcher } from './TaskDispatcher';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  CheckCircle2,
  BookOpen,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';

interface StoryViewerProps {
  lesson: Lesson;
  taskSubmissions: Record<string, TaskSubmissionState>;
  onTaskSubmitted: (itemCode: string, state: TaskSubmissionState) => void;
  onBackToBook: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  lesson,
  taskSubmissions,
  onTaskSubmitted,
  onBackToBook,
}) => {
  const scenes = lesson.scenes || [];
  // Slide 0: Title Slide
  // Slide 1..scenes.length: Scenes
  // Slide scenes.length + 1: Concluding Slide
  const totalSlides = scenes.length + 2;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showTaskInProjector, setShowTaskInProjector] = useState(false);
  const [kenBurnsActive, setKenBurnsActive] = useState(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        setCurrentSlideIndex(totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  const isTitleSlide = currentSlideIndex === 0;
  const isConclusionSlide = currentSlideIndex === totalSlides - 1;
  const currentScene: Scene | null =
    !isTitleSlide && !isConclusionSlide ? scenes[currentSlideIndex - 1] : null;

  const currentTaskCodes: string[] = Array.isArray(currentScene?.task)
    ? currentScene.task
    : currentScene?.task
    ? [currentScene.task]
    : [];

  const [activeTaskTab, setActiveTaskTab] = useState<string>('');

  useEffect(() => {
    if (currentTaskCodes.length > 0) {
      setActiveTaskTab(currentTaskCodes[0]);
    } else {
      setActiveTaskTab('');
    }
  }, [currentSlideIndex]);

  const isCurrentTaskCompleted = activeTaskTab
    ? taskSubmissions[activeTaskTab]?.isCompleted
    : false;

  const handlePrev = () => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));

  const taskCount = scenes.reduce((sum, s) => {
    if (!s.task) return sum;
    return sum + (Array.isArray(s.task) ? s.task.length : 1);
  }, 0);

  return (
    <div
      id="projector-story-viewer"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#1C120C] text-[#FAF8F2]"
    >
      {/* Top Slide Navigation Bar */}
      <div className="px-4 py-3 border-b bg-[#2A1B14] border-[#B85042]/30 text-[#E7E8D1] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-projector-back-toc"
            type="button"
            onClick={onBackToBook}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-black/20 text-[#E7E8D1] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#B85042]" />
            <span>Könyv nézet</span>
          </button>

          <div className="h-4 w-[1px] bg-[#B85042]/30 hidden sm:block" />

          <span className="text-xs font-bold font-title tracking-wider text-[#FAF8F2]">
            {isTitleSlide && `${lesson.title} — Bevezetés`}
            {currentScene && `${currentScene.n}. Jelenet: ${currentScene.title}`}
            {isConclusionSlide && `${lesson.title} — Fejezet zárása`}
          </span>
        </div>

        {/* Slide Pagination Dots / Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-200">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-[#B85042]'
                    : idx === 0 || idx === totalSlides - 1
                    ? 'w-2 bg-[#A7BEAE]/60 hover:bg-[#A7BEAE]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Ugrás a(z) ${idx + 1}. diára`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* TITLE SLIDE */}
        {isTitleSlide && (
          <div className="max-w-4xl mx-auto w-full text-center space-y-8 py-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B85042]/30 border border-[#B85042]/50 text-amber-200 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              {lesson.subtitle || `${lesson.order ?? 1}. Óra • ${lesson.topic || 'Mérés'}`}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-title tracking-wide leading-tight text-white">
              {lesson.title.toUpperCase()}
            </h1>

            {scenes[0]?.quote && (
              <p className="text-lg sm:text-xl font-serif-story italic text-amber-200 max-w-2xl mx-auto">
                „{scenes[0].quote}”
              </p>
            )}

            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#2A1B14]/80 backdrop-blur-sm border border-[#B85042]/30 shadow-xl text-[#FAF8F2] space-y-3">
              <p className="text-sm sm:text-base font-serif-story leading-relaxed text-[#E7E8D1]">
                {scenes[0]?.text || 'Készülj fel a tanórai mesére és a beágyazott próbatételekre!'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-amber-200/80">
                <span>📖 {scenes.length} mese-jelenet</span>
                <span>•</span>
                <span>🎯 {taskCount} próbatétel</span>
                <span>•</span>
                <span>🏆 Pontok mentése a Pontkövetőbe</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                id="btn-projector-start-story"
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#B85042] text-white font-bold text-base shadow-xl hover:bg-[#a03f32] active:scale-[0.98] transition-all"
              >
                <span>A fejezet indítása</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* SCENE SLIDE */}
        {currentScene && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center animate-fadeIn">
            {/* Left: Illustration with Ken Burns zoom animation */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border-2 border-[#C6923C]/50 bg-[#FDFBF7] p-2">
                {resolveSceneImage(lesson.lesson_id, currentScene.image) ? (
                  <div className="w-full h-full overflow-hidden relative rounded-2xl watercolor-feathered-edge bg-[#FAF5E8]">
                    <img
                      src={resolveSceneImage(lesson.lesson_id, currentScene.image)!}
                      alt={currentScene.title}
                      className={`w-full h-full object-cover select-none watercolor-canvas ${
                        kenBurnsActive ? 'animate-kenburns' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {/* Watercolor paper grain & pigment pooling */}
                    <div className="absolute inset-0 watercolor-paper-grain pointer-events-none" />
                    <div className="absolute inset-0 watercolor-pigment-pooling pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#B85042]/40 rounded-2xl bg-[#FAF5E8]">
                    <ImageIcon className="w-12 h-12 text-[#B85042]/60 mb-2" />
                    <p className="font-serif-story font-bold text-base text-[#4A382D]">
                      {currentScene.title}
                    </p>
                    <p className="text-xs text-[#8C6D58] mt-1">
                      Akvarell illusztráció hamarosan ({currentScene.image})
                    </p>
                  </div>
                )}

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-semibold">
                  {currentScene.n}. Jelenet
                </div>

                <button
                  type="button"
                  onClick={() => setKenBurnsActive(!kenBurnsActive)}
                  className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-sm text-[10px]"
                  title="Ken Burns animáció ki/be"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentTaskCodes.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#B85042]/20 border border-[#B85042]/30 text-xs">
                  <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B85042]" />
                    Ehhez a jelenethez {currentTaskCodes.length > 1 ? `${currentTaskCodes.length} fizikai próbatétel` : 'fizikai próbatétel'} tartozik!
                  </span>
                  {isCurrentTaskCompleted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pont jóváírva
                    </span>
                  ) : (
                    <span className="text-[#E7E8D1]/70">Megnyitható a kivetítőn</span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Story Text & Highlighted Quote */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B85042]">
                    {currentScene.n}. Jelenet
                  </span>
                  {currentTaskCodes.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B85042] text-white font-bold uppercase">
                      {currentTaskCodes.length > 1 ? `${currentTaskCodes.length} Próbatétel` : 'Próbatétel'}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl text-white font-bold font-serif-story tracking-wide">
                  {currentScene.title}
                </h2>
              </div>

              <p className="leading-relaxed font-serif-story text-lg sm:text-xl md:text-2xl text-[#FAF8F2]/95 font-medium">
                {currentScene.text}
              </p>

              {currentScene.quote && (
                <div className="p-5 sm:p-6 rounded-2xl border-l-4 border-[#B85042] bg-[#2E1B14] text-[#E7E8D1] shadow-lg relative">
                  <Quote className="w-8 h-8 text-[#B85042]/30 absolute top-3 right-3 pointer-events-none" />
                  <p className="italic font-serif-story text-xl sm:text-2xl font-bold text-amber-200">
                    {currentScene.quote}
                  </p>
                </div>
              )}

              {/* Projector task expander */}
              {currentTaskCodes.length > 0 && (
                <div className="pt-2">
                  <button
                    id="btn-toggle-task-projector-view"
                    type="button"
                    onClick={() => setShowTaskInProjector(!showTaskInProjector)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85042] text-white font-semibold text-xs shadow hover:bg-[#a24336] transition-colors cursor-pointer"
                  >
                    {showTaskInProjector ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>
                      {showTaskInProjector
                        ? 'Próbatétel elrejtése a kivetítőn'
                        : 'Próbatétel(ek) megjelenítése a kivetítőn'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projector mode embedded task when expanded */}
        {currentScene && currentTaskCodes.length > 0 && showTaskInProjector && (
          <div className="mt-8 p-6 rounded-3xl bg-[#FAF8F2] text-[#2E1B14] shadow-2xl border-2 border-[#B85042] animate-fadeIn">
            {currentTaskCodes.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-[#B85042]/20">
                {currentTaskCodes.map((code, idx) => {
                  const isDone = taskSubmissions[code]?.isCompleted;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveTaskTab(code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTaskTab === code
                          ? 'bg-[#B85042] text-white shadow-sm'
                          : 'bg-[#EAE2D0] text-[#5A4232] hover:bg-[#DFCDB3]'
                      }`}
                    >
                      <span>{idx + 1}. Próba ({code})</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
            {activeTaskTab && (
              <TaskDispatcher
                taskCode={activeTaskTab}
                scene={currentScene}
                lessonTopic={lesson.topic || 'Mérés'}
                submissionState={taskSubmissions[activeTaskTab]}
                onSubmitted={(state) => onTaskSubmitted(activeTaskTab, state)}
                isProjectorMode={true}
              />
            )}
          </div>
        )}

        {/* CONCLUDING SLIDE */}
        {isConclusionSlide && (
          <div className="max-w-4xl mx-auto w-full text-center space-y-8 py-8 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#B85042] text-white flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-title tracking-wide leading-tight text-white">
              {lesson.title} — Sikeresen teljesítve!
            </h1>

            {scenes[scenes.length - 1]?.quote && (
              <p className="text-lg sm:text-xl font-serif-story text-amber-200 max-w-2xl mx-auto font-semibold">
                „{scenes[scenes.length - 1].quote}”
              </p>
            )}

            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#2A1B14] border border-[#B85042]/30 shadow-xl text-[#FAF8F2] space-y-4">
              <p className="text-sm sm:text-base leading-relaxed font-serif-story text-[#E7E8D1]">
                A diákok sikerrel feldolgozták a tanórai mesét és a fizikai próbatételeket.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                id="btn-projector-restart-story"
                type="button"
                onClick={() => setCurrentSlideIndex(0)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Újra az elejétől</span>
              </button>

              <button
                id="btn-projector-back-to-book"
                type="button"
                onClick={onBackToBook}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B85042] text-white text-xs font-bold hover:bg-[#a03f32] shadow-md transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Vissza a Könyv nézethez</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="px-4 sm:px-6 py-4 border-t bg-[#2A1B14] border-[#B85042]/30 text-[#E7E8D1] flex items-center justify-between gap-4">
        <button
          id="btn-projector-prev-slide"
          type="button"
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-current/20 text-xs font-semibold hover:bg-black/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Vissza</span>
        </button>

        <div className="text-center text-xs text-[#E7E8D1]/60 hidden sm:block font-mono">
          ← és → nyilak vagy Space a lapozáshoz
        </div>

        <button
          id="btn-projector-next-slide"
          type="button"
          onClick={handleNext}
          disabled={currentSlideIndex === totalSlides - 1}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs font-bold shadow hover:bg-[#a03f32] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>Tovább</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
