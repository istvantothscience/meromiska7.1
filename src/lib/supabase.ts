import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export const SUPABASE_URL = 'https://zmzjnqvsywizojqoewus.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable__3LQKcB2Zli37v72Ve4rDg_F0S9L3vr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SubmitScoreParams {
  item: string;
  points: number;
  note: string;
  mode?: 'once' | 'highest';
}

export interface SubmitScoreResult {
  success: boolean;
  totalPoints?: number;
  message?: string;
  isMockDemo?: boolean;
}

/**
 * Get the currently logged-in student info using the app_whoami RPC
 */
export async function getStudentProfile(): Promise<UserProfile | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return null;
    }

    const { data, error } = await supabase.rpc('app_whoami');
    if (error) {
      console.warn('Failed to call app_whoami RPC:', error.message);
      // Fallback to session email if available
      return {
        class_code: '7. évfolyam',
        name: sessionData.session.user.email?.split('@')[0] || 'Diák',
        email: sessionData.session.user.email,
      };
    }

    if (Array.isArray(data) && data.length > 0) {
      const student = data[0];
      return {
        class_code: student.class_code || '7. osztály',
        name: student.name || 'Diák',
        email: sessionData.session.user.email,
      };
    }

    return null;
  } catch (err) {
    console.error('Error fetching student profile:', err);
    return null;
  }
}

/**
 * Sign in student using Supabase auth and retrieve profile via app_whoami
 */
export async function signInStudent(
  email: string,
  password: string
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        success: false,
        error: error.message === 'Invalid login credentials'
          ? 'Hibás e-mail cím vagy jelszó! Kérlek ellenőrizd a beírt adatokat.'
          : `Bejelentkezési hiba: ${error.message}`,
      };
    }

    const { data: whoamiData, error: whoamiError } = await supabase.rpc('app_whoami');
    if (whoamiError) {
      console.warn('app_whoami RPC notice:', whoamiError.message);
    }

    if (Array.isArray(whoamiData) && whoamiData.length > 0) {
      const student = whoamiData[0];
      return {
        success: true,
        profile: {
          class_code: student.class_code || '7. osztály',
          name: student.name || email.split('@')[0],
          email,
        },
      };
    }

    // Account exists but not bound to class
    return {
      success: true,
      profile: {
        class_code: 'Nincs osztály',
        name: email.split('@')[0],
        email,
      },
      error: 'A fiókod még nincs osztályhoz rendelve a Pontkövetőben. Kérlek látogass el a fizika-pontkoveto.vercel.app oldalra az osztály beállításához!',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Hiba történt: ${msg}` };
  }
}

/**
 * Sign out the currently logged in student
 */
export async function signOutStudent(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

/**
 * Submit task score using app_submit_score RPC
 */
export async function submitTaskScore({
  item,
  points,
  note,
  mode = 'once',
}: SubmitScoreParams): Promise<SubmitScoreResult> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If not logged in, allow demo local progress with a notice
    if (!sessionData?.session) {
      return {
        success: true,
        isMockDemo: true,
        message: 'Helyes válasz! Bejelentkezés nélkül csak helyi próbaként lett mentve. Jelentkezz be a Pontkövető fiókoddal a valódi pontokért!',
      };
    }

    const { data, error } = await supabase.rpc('app_submit_score', {
      p_app: 'mero-miska-meres',
      p_topic: 'Mérés',
      p_item: item,
      p_points: points,
      p_category: 'feladat',
      p_note: note,
      p_mode: mode,
    });

    if (error) {
      console.error('Supabase app_submit_score RPC error:', error);
      return {
        success: false,
        message: `Hiba a pont beküldésekor: ${error.message}`,
      };
    }

    const totalPoints = Array.isArray(data) && data.length > 0 ? data[0]?.ossz_pont : undefined;

    return {
      success: true,
      totalPoints,
      message: 'Sikeres beküldés! A pont jóváírva a Fizika Pontkövetőben.',
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Submit score exception:', errMsg);
    return {
      success: false,
      message: `Nem sikerült beküldeni a pontot: ${errMsg}`,
    };
  }
}
