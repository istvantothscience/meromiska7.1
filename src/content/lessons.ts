import type { Lesson, LessonMeta } from '../types';

// Static image imports for known images
import img01 from '../assets/images/proclamation_herald_1789029483517.jpg';
import img02 from '../assets/images/brothers_running_1789029567245.jpg';
import img03 from '../assets/images/father_farewell_1789029507758.jpg';
import img04 from '../assets/images/bridge_wanderer_1789029493892.jpg';
import img05 from '../assets/images/hero_hid_bridge_1789029472973.jpg';
import img06 from '../assets/images/careful_measuring_1789029520169.jpg';
import img07 from '../assets/images/hero_hid_bridge_1789029472973.jpg';
import badgeHidvero from '../assets/images/badge_hidvero_1789029580372.jpg';
import miskaCoverImg from '../assets/images/mero_miska_cover_1789723256782.jpg';

export { badgeHidvero, miskaCoverImg };

// Known image alias map for l1
const KNOWN_IMAGES: Record<string, string> = {
  '01_miska_a_faluban.png': img01,
  '02_meresi_zurzavar.png': img05,
  '03_miska_megmeri_a_hidat.png': img06,
  '01_hirdetmeny.png': img01,
  '02_ket_baty.png': img02,
  '03_apa_bucsuja.png': img03,
  '04_hid_es_vandor.png': img04,
  '05_zurzavar.png': img05,
  '06_megoldas.png': img06,
  '07_gyozelem.png': img07,
  'badge_hidvero.png': badgeHidvero,
};

// Dynamic image glob to auto-detect any future assets placed in assets/images/
const dynamicImages = import.meta.glob<string | { default: string }>(
  '../assets/images/*',
  { eager: true }
);

/**
 * Dynamically loads all lesson JSON files present in this directory.
 * When the user adds l2.json, l3.json, etc., they are automatically discovered!
 * Absolutely NO hardcoded future lessons or placeholders.
 */
const lessonModules = import.meta.glob<Record<string, unknown>>('./*.json', {
  eager: true,
});

function parseLessonOrder(lessonId: string, orderVal?: number): number {
  if (typeof orderVal === 'number') return orderVal;
  const numMatch = lessonId.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 999;
}

/**
 * Returns all currently existing lessons loaded dynamically from content JSON files.
 */
export function getAllLessons(): Lesson[] {
  const lessons: Lesson[] = [];

  for (const path in lessonModules) {
    const raw = lessonModules[path];
    const data = ((raw && 'default' in raw ? raw.default : raw) as unknown) as Lesson;

    if (data && data.lesson_id && data.title && Array.isArray(data.scenes)) {
      const order = parseLessonOrder(data.lesson_id, data.order);
      lessons.push({
        ...data,
        topic: data.topic || 'Mérés',
        order,
      });
    }
  }

  // Sort strictly by lesson order (1, 2, 3...)
  lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return lessons;
}

/**
 * Calculates metadata strictly from the available lessons.
 * The Table of Contents is generated from this.
 */
export function getLessonsMeta(): LessonMeta[] {
  const lessons = getAllLessons();

  return lessons.map((l, index) => {
    let taskCount = 0;
    for (const s of l.scenes) {
      if (Array.isArray(s.task)) {
        taskCount += s.task.length;
      } else if (s.task) {
        taskCount += 1;
      }
    }
    const pointsAvailable = taskCount;

    return {
      id: l.lesson_id,
      lessonNumber: l.order ?? index + 1,
      title: l.title,
      subtitle: l.subtitle,
      topic: l.topic || 'Mérés',
      taskCount,
      pointsAvailable,
      badgeName: l.badgeName || (index === 0 ? 'Hídverő' : undefined),
      badgeDescription: l.badgeDescription,
      sceneCount: l.scenes.length,
    };
  });
}

/**
 * Get single lesson by id
 */
export function getLessonById(id: string): Lesson | undefined {
  const all = getAllLessons();
  return all.find((l) => l.lesson_id === id) || all[0];
}

/**
 * Resolves the illustration URL for a scene dynamically
 */
export function resolveSceneImage(lessonId: string, imageName: string): string | null {
  if (!imageName) return null;

  // 1. Direct match in known aliases
  if (KNOWN_IMAGES[imageName]) {
    return KNOWN_IMAGES[imageName];
  }

  // 2. Search dynamic images for matching filename
  const cleanName = imageName.split('/').pop() || imageName;
  for (const key in dynamicImages) {
    if (key.endsWith(cleanName)) {
      const mod = dynamicImages[key];
      return typeof mod === 'string' ? mod : mod?.default || null;
    }
  }

  // 3. Fallback: check if it's already an absolute or relative path
  if (imageName.startsWith('http://') || imageName.startsWith('https://') || imageName.startsWith('/')) {
    return imageName;
  }

  return null;
}
