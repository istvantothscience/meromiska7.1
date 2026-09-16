import React, { useState } from 'react';
import type { Lesson, TaskSubmissionState } from '../types';
import { resolveSceneImage } from '../content/lessons';
import { TaskDispatcher } from './TaskDispatcher';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  Image as ImageIcon,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface LessonPageProps {
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  taskSubmissions: Record<string, TaskSubmissionState>;
  onTaskSubmitted: (itemCode: string, state: TaskSubmissionState) => void;
  onOpenTableOfContents: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  isProjectorMode?: boolean;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lesson,
  lessonIndex,
  totalLessons,
  taskSubmissions,
  onTaskSubmitted,
  onOpenTableOfContents,
  onNextLesson,
  onPrevLesson,
  isProjectorMode = false,
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [pageTurnDirection, setPageTurnDirection] = useState<'next' | 'prev'>('next');

  const scenes = lesson.scenes || [];
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const currentTaskCode = currentScene?.task;
  const isTaskCompleted = currentTaskCode
    ? taskSubmissions[currentTaskCode]?.isCompleted
    : false;

  const handlePrevScene = () => {
    setPageTurnDirection('prev');
    if (activeSceneIndex > 0) {
      setActiveSceneIndex((prev) => prev - 1);
    } else if (onPrevLesson) {
      onPrevLesson();
    }
  };

  const handleNextScene = () => {
    setPageTurnDirection('next');
    if (activeSceneIndex < scenes.length - 1) {
      setActiveSceneIndex((prev) => prev + 1);
    } else if (onNextLesson) {
      onNextLesson();
    }
  };

  // Extract first letter for classical medieval / storybook drop-cap
  const firstLetter = currentScene.text ? currentScene.text.charAt(0) : '';
  const remainingText = currentScene.text ? currentScene.text.slice(1) : '';

  // Calculate realistic book page numbers (e.g. Lesson 1 starts at page 4)
  const leftPageNum = (lessonIndex * 14) + (activeSceneIndex * 2) + 4;
  const rightPageNum = leftPageNum + 1;

  return (
    <div className="w-full flex-1 flex flex-col justify-between select-text">
      {/* Running Book Page Top Headers (Header margin with gilded rule) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 pb-3 mb-2 border-b border-[#8B261D]/20 text-[11px] font-title tracking-[0.2em] text-[#8B261D]/80">
        {/* Left page running header */}
        <div className="hidden lg:flex items-center justify-between px-3">
          <span>7. ÉVFOLYAM • FIZIKA</span>
          <span className="italic font-serif text-[12px] lowercase tracking-normal text-[#24140D]/60">
            Mérő Miska próbái
          </span>
        </div>

        {/* Right page running header */}
        <div className="flex items-center justify-between px-3">
          <span className="font-bold text-[#8B261D] truncate max-w-[260px]">
            {lesson.order ?? lessonIndex + 1}. FEJEZET: {lesson.title.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={onOpenTableOfContents}
            className="flex items-center gap-1 hover:text-[#8B261D] transition-colors text-[10px] uppercase font-bold"
          >
            <BookOpen className="w-3 h-3 text-[#8B261D]" />
            <span>Tartalom</span>
          </button>
        </div>
      </div>

      {/* Main Double-Page Spread with 3D Page Turn Animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${lesson.lesson_id}-scene-${activeSceneIndex}`}
          initial={{
            opacity: 0.6,
            rotateY: pageTurnDirection === 'next' ? 6 : -6,
            scale: 0.99,
          }}
          animate={{
            opacity: 1,
            rotateY: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0.5,
            rotateY: pageTurnDirection === 'next' ? -6 : 6,
            scale: 0.99,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch my-auto py-2"
        >
          {/* ============================================================ */}
          {/* LEFT PAGE: Classical Framed Illustration & Epigraph          */}
          {/* ============================================================ */}
          <div className="flex flex-col justify-between space-y-4 px-2 sm:px-4">
            <div className="space-y-4">
              {/* Scene Chapter Banner */}
              <div className="flex items-center justify-between pb-1 border-b border-[#C6923C]/30">
                <span className="font-title text-xs font-bold text-[#8B261D] tracking-widest uppercase">
                  {currentScene.n}. Jelenet
                </span>
                <span className="text-[11px] font-serif italic text-[#24140D]/60">
                  {activeSceneIndex + 1} / {scenes.length}
                </span>
              </div>

              {/* Antique Gilt-Framed Illustration */}
              <div className="relative p-2 rounded-xl bg-[#EFE7D2]/60 border-2 border-[#C6923C]/50 shadow-md">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#24140D]/20 bg-[#24140D]">
                  {resolveSceneImage(lesson.lesson_id, currentScene.image) ? (
                    <img
                      src={resolveSceneImage(lesson.lesson_id, currentScene.image)!}
                      alt={currentScene.title}
                      className="w-full h-full object-cover animate-kenburns select-none filter contrast-[1.03] saturate-[1.05]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#EFE7D2]">
                      <ImageIcon className="w-12 h-12 text-[#C6923C]/60 mb-2" />
                      <p className="font-display font-bold text-base">
                        {currentScene.title}
                      </p>
                      <p className="text-xs text-[#EFE7D2]/60 mt-1 italic font-serif">
                        Illusztráció előkészületben...
                      </p>
                    </div>
                  )}

                  {/* Subtle inner vignette shadow on the painting */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_25px_rgba(0,0,0,0.4)]" />
                </div>

                {/* Corner gold accents */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#C6923C]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#C6923C]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#C6923C]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#C6923C]" />
              </div>

              {/* Classical Illuminated Quote Ribbon if present */}
              {currentScene.quote && (
                <div className="relative p-4 rounded-xl bg-[#F6F0E0] border border-[#C6923C]/40 shadow-xs">
                  <Quote className="w-8 h-8 text-[#C6923C]/30 absolute top-2 right-3 pointer-events-none" />
                  <p className="font-serif italic text-base sm:text-lg text-[#8B261D] leading-relaxed pr-6 font-semibold">
                    „{currentScene.quote}”
                  </p>
                </div>
              )}
            </div>

            {/* Left Page Footer (Page number & chapter) */}
            <div className="pt-3 border-t border-[#8B261D]/15 flex items-center justify-between text-[11px] font-title text-[#24140D]/60 tracking-wider">
              <span>— {leftPageNum}. lap —</span>
              <span className="italic font-serif text-[#8B261D]">Mérő Miska próbái</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT PAGE: Story Text with Drop Cap & Antique Task Pergamen */}
          {/* ============================================================ */}
          <div className="flex flex-col justify-between space-y-4 px-2 sm:px-4">
            <div className="space-y-4">
              {/* Scene Title with Calligraphic Fleuron Divider */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#24140D] tracking-wide leading-snug">
                  {currentScene.title}
                </h2>
                <div className="ornament-divider text-xs">
                  <span>❦</span>
                  <span>•</span>
                  <span>❦</span>
                </div>
              </div>

              {/* Story Narration Text with Illuminated Medieval Drop Cap */}
              <div className="font-serif-story text-base sm:text-[18px] text-[#24140D]/90 leading-[1.7] text-justify">
                {firstLetter && (
                  <span className="drop-cap">{firstLetter}</span>
                )}
                <span>{remainingText}</span>
              </div>

              {/* Embedded Antique Parchment Task Container */}
              {currentTaskCode && (
                <div className="mt-4 pt-2">
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-[#F4EEDC] border-2 border-[#C6923C]/60 shadow-md">
                    {/* Wax Seal / Próbatétel Crest Stamp */}
                    <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[#8B261D]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#8B261D] text-[#C6923C] flex items-center justify-center shadow-xs border border-[#C6923C]/50 font-title font-bold text-xs">
                          M
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-base text-[#8B261D]">
                            {currentScene.n}. Fizikai Próbatétel
                          </h4>
                          <p className="text-[11px] font-serif italic text-[#24140D]/70">
                            {lesson.topic || 'Mérés'} • Jutalom a Pontkövetőben
                          </p>
                        </div>
                      </div>

                      {isTaskCompleted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Próba kiállva
                        </span>
                      )}
                    </div>

                    {/* Task Component Dispatcher */}
                    <TaskDispatcher
                      taskCode={currentTaskCode}
                      scene={currentScene}
                      lessonTopic={lesson.topic || 'Mérés'}
                      submissionState={taskSubmissions[currentTaskCode]}
                      onSubmitted={(state) => onTaskSubmitted(currentTaskCode, state)}
                      isProjectorMode={isProjectorMode}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Page Footer (Page number & chapter) */}
            <div className="pt-3 border-t border-[#8B261D]/15 flex items-center justify-between text-[11px] font-title text-[#24140D]/60 tracking-wider">
              <span className="italic font-serif text-[#8B261D]">
                {lesson.title}
              </span>
              <span>— {rightPageNum}. lap —</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Book Bottom Page Turn Controls */}
      <div className="pt-4 mt-2 border-t border-[#8B261D]/15 flex items-center justify-between gap-3 text-xs font-title">
        <button
          id="btn-book-turn-prev"
          type="button"
          onClick={handlePrevScene}
          className="group inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#EFE7D2] hover:bg-[#E3D8BC] border border-[#C6923C]/50 text-[#24140D] font-bold shadow-xs transition-all active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4 text-[#8B261D] group-hover:-translate-x-1 transition-transform" />
          <span>{activeSceneIndex === 0 ? 'Tartalomjegyzék' : 'Előző lap'}</span>
        </button>

        {/* Scene Page Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {scenes.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPageTurnDirection(idx > activeSceneIndex ? 'next' : 'prev');
                setActiveSceneIndex(idx);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-title font-bold transition-all flex items-center justify-center ${
                idx === activeSceneIndex
                  ? 'bg-gradient-to-tr from-[#8B261D] to-[#B83828] text-white shadow-md ring-2 ring-[#E5B842]'
                  : 'bg-[#EFE7D2] text-[#24140D]/70 hover:bg-[#E3D8BC] border border-[#C6923C]/30'
              }`}
              title={`${s.n}. Jelenet: ${s.title}`}
            >
              {s.n}
            </button>
          ))}
        </div>

        <button
          id="btn-book-turn-next"
          type="button"
          onClick={handleNextScene}
          className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#8B261D] to-[#A83226] hover:from-[#731E16] hover:to-[#91281E] text-white font-bold shadow-md shadow-red-950/40 transition-all active:scale-[0.98]"
        >
          <span>
            {activeSceneIndex === scenes.length - 1
              ? lessonIndex < totalLessons - 1
                ? 'Következő fejezet'
                : 'Fejezet zárása'
              : 'Következő lap'}
          </span>
          <ChevronRight className="w-4 h-4 text-[#F4D068] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
