import React, { useEffect, useState, useCallback } from 'react';
import type { Lesson, UserProfile, ViewMode, TaskSubmissionState } from './types';
import { getAllLessons } from './content/lessons';
import { supabase, getStudentProfile } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { OpenBook } from './components/OpenBook';
import { StoryViewer } from './components/StoryViewer';
import { AuthModal } from './components/AuthModal';
import { BadgeModal } from './components/BadgeModal';
import { MagicalEmbers } from './components/MagicalEmbers';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'mero_miska_task_submissions_v1';
const LOCAL_STORAGE_PARTNER_KEY = 'mero_miska_partner_name';

export default function App() {
  // Dynamically loaded lessons from all JSON files in content/
  const [lessons, setLessons] = useState<Lesson[]>([]);
  // activeLessonIndex: null = Table of Contents / Front Matter spread, 0..N = active lesson
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('book');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, TaskSubmissionState>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load all lessons dynamically
  useEffect(() => {
    const loaded = getAllLessons();
    setLessons(loaded);
  }, []);

  // Load submissions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (saved) {
        setTaskSubmissions(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize Supabase profile
  useEffect(() => {
    getStudentProfile().then((profile) => {
      if (profile) {
        const savedPartner = localStorage.getItem(LOCAL_STORAGE_PARTNER_KEY) || undefined;
        setUserProfile({
          ...profile,
          partnerName: savedPartner,
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const prof = await getStudentProfile();
        if (prof) {
          const savedPartner = localStorage.getItem(LOCAL_STORAGE_PARTNER_KEY) || undefined;
          setUserProfile({
            ...prof,
            partnerName: savedPartner,
          });
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleTaskSubmitted = useCallback(
    (itemCode: string, state: TaskSubmissionState) => {
      setTaskSubmissions((prev) => {
        const updated = {
          ...prev,
          [itemCode]: state,
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      setNotification({
        type: 'success',
        message: 'Próbatétel sikeres! Pont jóváírva a Fizika Pontkövetőbe.',
      });
      setTimeout(() => setNotification(null), 4500);
    },
    []
  );

  const handlePartnerUpdate = (partnerName: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PARTNER_KEY, partnerName);
    } catch {
      // ignore
    }
    setUserProfile((prev) => {
      if (!prev) return null;
      return { ...prev, partnerName };
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setNotification({
      type: 'info',
      message: 'Sikeresen kijelentkeztél.',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Calculate points
  const submissionsList = Object.values(taskSubmissions) as TaskSubmissionState[];

  const earnedPoints = submissionsList.reduce((sum, item) => {
    return sum + (item.isCompleted ? item.pointsAwarded : 0);
  }, 0);

  const completedTasksCount = submissionsList.filter(
    (item) => item.isCompleted
  ).length;

  const currentLesson =
    activeLessonIndex !== null && lessons[activeLessonIndex]
      ? lessons[activeLessonIndex]
      : lessons[0] || null;

  return (
    <div className="min-h-screen flex flex-col text-[#24140D] font-serif-story selection:bg-[#8B261D]/30 relative overflow-x-hidden">
      {/* Ambient Floating Magical Embers / Particles (Slot Symbol Atmosphere) */}
      <MagicalEmbers />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-[#24140D] text-[#FAF6EC] shadow-2xl border-2 border-[#C6923C] text-xs font-serif font-bold flex items-center gap-2.5 animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C6923C] animate-ping" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentMode={viewMode}
        onToggleMode={setViewMode}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBadge={() => setIsBadgeModalOpen(true)}
        onOpenTableOfContents={() => {
          setActiveLessonIndex(null);
          setViewMode('book');
        }}
        earnedPoints={earnedPoints}
        completedTasksCount={completedTasksCount}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        currentLessonTitle={currentLesson?.title}
        lessons={lessons}
        activeLessonIndex={activeLessonIndex}
        onSelectLessonIndex={(idx) => {
          setActiveLessonIndex(idx);
          if (idx !== null && viewMode !== 'book') {
            setViewMode('book');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {viewMode === 'book' ? (
          /* Dynamic Open Book (matching the uploaded drawing aesthetic) */
          <OpenBook
            lessons={lessons}
            activeLessonIndex={activeLessonIndex}
            onSelectLessonIndex={setActiveLessonIndex}
            userProfile={userProfile}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenBadge={() => setIsBadgeModalOpen(true)}
            earnedPoints={earnedPoints}
            completedTasksCount={completedTasksCount}
            taskSubmissions={taskSubmissions}
            onTaskSubmitted={handleTaskSubmitted}
            isProjectorMode={false}
          />
        ) : (
          /* Projector presentation mode for classroom beamers/smartboards */
          currentLesson && (
            <StoryViewer
              lesson={currentLesson}
              taskSubmissions={taskSubmissions}
              onTaskSubmitted={handleTaskSubmitted}
              onBackToBook={() => setViewMode('book')}
            />
          )
        )}
      </main>

      {/* Auth Modal for Fizika Pontkövető */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setUserProfile(profile);
          setNotification({
            type: 'success',
            message: `Üdvözlünk, ${profile.name}! Pontjaid rögzítésre kerülnek.`,
          });
          setTimeout(() => setNotification(null), 4000);
        }}
        currentProfile={userProfile}
        onLogout={handleLogout}
        onUpdatePartner={handlePartnerUpdate}
      />

      {/* Badge Modal for Hídverő & Progress */}
      <BadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        earnedPoints={earnedPoints}
        totalPointsAvailable={3}
        completedTasksCount={completedTasksCount}
        studentName={userProfile?.name}
      />
    </div>
  );
}
