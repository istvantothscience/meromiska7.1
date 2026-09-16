export interface Scene {
  n: number;
  title: string;
  text: string;
  quote: string | null;
  image: string;
  task?: string | string[];
  taskTitle?: string;
  taskPoints?: number;
}

export interface Lesson {
  lesson_id: string;
  title: string;
  subtitle?: string;
  topic?: string;
  order?: number;
  badgeName?: string;
  badgeDescription?: string;
  badgeImage?: string;
  scenes: Scene[];
}

export interface LessonMeta {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle?: string;
  topic: string;
  taskCount: number;
  pointsAvailable: number;
  badgeName?: string;
  badgeDescription?: string;
  sceneCount: number;
}

export interface UserProfile {
  class_code: string;
  name: string;
  email?: string;
  partnerName?: string;
}

export interface TaskSubmissionState {
  isCompleted: boolean;
  pointsAwarded: number;
  submittedAt?: string;
  responseSummary?: string;
  error?: string;
}

export type ViewMode = 'book' | 'projector';
