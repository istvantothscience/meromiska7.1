import React, { useState } from 'react';
import type { TaskSubmissionState, Scene } from '../types';
import { TaskAtvaltas } from './TaskAtvaltas';
import { TaskMeres } from './TaskMeres';
import { TaskIndoklas } from './TaskIndoklas';
import { TaskAveraging } from './tasks/TaskAveraging';
import { TaskGoogleEarth } from './tasks/TaskGoogleEarth';
import { submitTaskScore } from '../lib/supabase';
import { Sparkles, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskDispatcherProps {
  taskCode: string;
  scene: Scene;
  lessonTopic?: string;
  submissionState?: TaskSubmissionState;
  onSubmitted: (state: TaskSubmissionState) => void;
  isProjectorMode?: boolean;
}

export const TaskDispatcher: React.FC<TaskDispatcherProps> = ({
  taskCode,
  scene,
  lessonTopic = 'Mérés',
  submissionState,
  onSubmitted,
  isProjectorMode = false,
}) => {
  // Built-in handlers for the 1st lesson's specific physical tasks
  if (taskCode === 'l1_a_atvaltas') {
    return (
      <TaskAtvaltas
        submissionState={submissionState}
        onSubmitted={onSubmitted}
        isProjectorMode={isProjectorMode}
      />
    );
  }

  if (taskCode === 'l1_b_meres_atlagolas') {
    return (
      <div className="p-2 sm:p-4 rounded-2xl bg-white/90 border border-[#B85042]/30">
        <TaskAveraging
          user={null}
          onCompleted={() => {
            onSubmitted({
              isCompleted: true,
              pointsAwarded: 1,
              submittedAt: new Date().toISOString(),
            });
          }}
        />
      </div>
    );
  }

  if (taskCode === 'l1_b_meres') {
    return (
      <TaskMeres
        submissionState={submissionState}
        onSubmitted={onSubmitted}
        isProjectorMode={isProjectorMode}
      />
    );
  }

  if (taskCode === 'l1_c_indoklas') {
    return (
      <TaskIndoklas
        submissionState={submissionState}
        onSubmitted={onSubmitted}
        isProjectorMode={isProjectorMode}
      />
    );
  }

  if (taskCode === 'l1_d_google_earth') {
    return (
      <div className="p-2 sm:p-4 rounded-2xl bg-white/90 border border-[#B85042]/30">
        <TaskGoogleEarth
          user={null}
          onCompleted={() => {
            onSubmitted({
              isCompleted: true,
              pointsAwarded: 1,
              submittedAt: new Date().toISOString(),
            });
          }}
        />
      </div>
    );
  }

  // Generic data-driven task runner for any future lessons added in l2.json, l3.json, etc.
  return (
    <GenericTaskRunner
      taskCode={taskCode}
      scene={scene}
      lessonTopic={lessonTopic}
      submissionState={submissionState}
      onSubmitted={onSubmitted}
      isProjectorMode={isProjectorMode}
    />
  );
};

interface GenericTaskRunnerProps {
  taskCode: string;
  scene: Scene;
  lessonTopic: string;
  submissionState?: TaskSubmissionState;
  onSubmitted: (state: TaskSubmissionState) => void;
  isProjectorMode?: boolean;
}

const GenericTaskRunner: React.FC<GenericTaskRunnerProps> = ({
  taskCode,
  scene,
  lessonTopic,
  submissionState,
  onSubmitted,
  isProjectorMode,
}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setErrorMessage('Kérlek, írd be a megoldásodat a válaszmezőbe!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const points = scene.taskPoints ?? 1;
    const result = await submitTaskScore({
      item: taskCode,
      points,
      note: `${scene.title} — Feladat megoldva`,
    });

    if (result.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onSubmitted({
        isCompleted: true,
        pointsAwarded: points,
        submittedAt: new Date().toISOString(),
        responseSummary: answer.trim(),
      });
    } else {
      setErrorMessage(result.message || 'A beküldés sikertelen. Kérlek, próbáld újra!');
    }
    setIsSubmitting(false);
  };

  const isCompleted = submissionState?.isCompleted;

  return (
    <div
      id={`generic-task-${taskCode}`}
      className={`p-5 rounded-2xl border ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-[#FAF8F2] border-[#B85042]/30 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85042] text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-serif-story text-sm text-[#2E1B14]">
              {scene.taskTitle || `${scene.title} — Próbatétel`}
            </h4>
            <p className="text-[11px] text-[#2E1B14]/70">
              Jutalompont: {scene.taskPoints ?? 1} pont a Fizika Pontkövetőbe
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Megoldva (+{submissionState.pointsAwarded} p)
          </span>
        )}
      </div>

      {isCompleted ? (
        <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#2E1B14] space-y-1">
          <p className="font-bold text-emerald-800">Sikeres próbatétel!</p>
          {submissionState.responseSummary && (
            <p className="italic text-[#2E1B14]/80">„{submissionState.responseSummary}”</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Írd ide a próbatétel megoldását vagy a mérési eredményeidet..."
            rows={isProjectorMode ? 2 : 3}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#2E1B14]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B85042]"
          />

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B85042] text-white text-xs font-bold hover:bg-[#a03f32] disabled:opacity-50 transition-all flex items-center gap-2 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Ellenőrzés...' : 'Megoldás beküldése'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
