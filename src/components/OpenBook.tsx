import React from 'react';
import type { Lesson, UserProfile, TaskSubmissionState } from '../types';
import { StoryBookFlip } from './StoryBookFlip';

interface OpenBookProps {
  lessons: Lesson[];
  activeLessonIndex: number | null;
  onSelectLessonIndex: (index: number | null) => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenBadge: () => void;
  earnedPoints: number;
  completedTasksCount: number;
  taskSubmissions: Record<string, TaskSubmissionState>;
  onTaskSubmitted: (itemCode: string, state: TaskSubmissionState) => void;
  isProjectorMode: boolean;
}

export const OpenBook: React.FC<OpenBookProps> = ({
  lessons,
  activeLessonIndex,
  onSelectLessonIndex,
  userProfile,
  onOpenAuth,
  onOpenBadge,
  earnedPoints,
  completedTasksCount,
  taskSubmissions,
  onTaskSubmitted,
  isProjectorMode,
}) => {
  const currentLesson =
    activeLessonIndex !== null && lessons[activeLessonIndex]
      ? lessons[activeLessonIndex]
      : lessons[0];

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center p-12 text-[#EFE7D2] font-serif">
        Könyv betöltése...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 sm:px-4">
      <StoryBookFlip
        lesson={currentLesson}
        user={userProfile}
        onUserChanged={(u) => {
          if (u) {
            onTaskSubmitted('auth_user_change', {
              isCompleted: true,
              pointsAwarded: 0,
              submittedAt: new Date().toISOString(),
              partnerName: u.partnerName,
            });
          }
        }}
        onPointsUpdated={(pts) => {
          onTaskSubmitted('points_sync', {
            isCompleted: true,
            pointsAwarded: 1,
            submittedAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
};
