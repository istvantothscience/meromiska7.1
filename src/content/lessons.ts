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

// Lesson 2 images
import l2Img01 from '../assets/images/l2_01_folyohoz_erkezes_1790163587745.jpg';
import l2Img02 from '../assets/images/l2_02_reves_probaja_1790163600220.jpg';
import l2Img03 from '../assets/images/l2_03_tanakodas_1790163610951.jpg';
import l2Img04 from '../assets/images/l2_04_a_megoldas_1790163625224.jpg';
import l2Img05 from '../assets/images/l2_05_gyozelem_1790163638580.jpg';
import l2Img06 from '../assets/images/l2_06_a_fordulat_1790163650674.jpg';
import badgeReveszBaratja from '../assets/images/badge_revesz_baratja_1790163662114.jpg';

// Lesson 3 images
import l3Img01 from '../assets/images/l3_01_a_vasarter_1790662371493.jpg';
import l3Img02 from '../assets/images/l3_02_a_gyogyito_lany_1790662389888.jpg';
import l3Img03 from '../assets/images/l3_03_a_harom_sator_1790662404677.jpg';
import l3Img04 from '../assets/images/l3_04_a_leleplezes_1790662424617.jpg';
import l3Img05 from '../assets/images/l3_05_gyozelem_1790662442362.jpg';
import l3Img06 from '../assets/images/l3_06_a_fordulat_1790662471448.jpg';
import badgeVasariElesSzem from '../assets/images/badge_vasari_eles_szem_1790662485796.jpg';

// Lesson 4 images (A toronyóra-készítő)
import l4Img01 from '../assets/images/l4_scene1_clockmaker_1792051610202.jpg';
import l4Img02 from '../assets/images/l4_scene2_pendulum_task_1792051611290.jpg';
import l4Img03 from '../assets/images/l4_scene3_workshop_measuring_1792051613366.jpg';
import l4Img04 from '../assets/images/l4_scene4_swinging_pendulum_1792051612461.jpg';
import l4Img05 from '../assets/images/l4_scene5_clock_restarted_1792051613839.jpg';
import l4Img06 from '../assets/images/l4_scene6_crossroads_mountain_1792051613830.jpg';

// Lesson 5 images (Tűz és jég között)
import l5Img01 from '../assets/images/l5_scene1_split_gatekeeper_1792051615328.jpg';
import l5Img02 from '../assets/images/l5_scene2_three_tubs_1792051616344.jpg';
import l5Img03 from '../assets/images/l5_scene3_glass_thermometer_1792051617014.jpg';
import l5Img04 from '../assets/images/l5_scene4_strange_markings_1792051618381.jpg';
import l5Img05 from '../assets/images/l5_scene5_crossing_ford_1792051618633.jpg';
import l5Img06 from '../assets/images/l5_scene6_princess_revealed_1792051619595.jpg';

const badgeIdoUra = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#FFF6D6"/>
      <stop offset="65%" stop-color="#E5B842"/>
      <stop offset="100%" stop-color="#8B261D"/>
    </radialGradient>
  </defs>
  <circle cx="80" cy="80" r="74" fill="url(#bg)" stroke="#5A2318" stroke-width="5"/>
  <circle cx="80" cy="80" r="64" fill="none" stroke="#FAF7EE" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- Clock dial ticks -->
  <g stroke="#2E1B14" stroke-width="3" stroke-linecap="round">
    <line x1="80" y1="22" x2="80" y2="30"/>
    <line x1="80" y1="130" x2="80" y2="138"/>
    <line x1="22" y1="80" x2="30" y2="80"/>
    <line x1="130" y1="80" x2="138" y2="80"/>
  </g>
  <!-- Swinging Pendulum & Hourglass motif -->
  <line x1="80" y1="32" x2="96" y2="106" stroke="#2E1B14" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="80" cy="32" r="5" fill="#B85042" stroke="#2E1B14" stroke-width="2"/>
  <circle cx="96" cy="110" r="13" fill="#B85042" stroke="#2E1B14" stroke-width="3"/>
  <circle cx="92" cy="106" r="4" fill="#FFF2B2" opacity="0.7"/>
  <path d="M56 112 Q80 124 104 112" fill="none" stroke="#8B261D" stroke-width="2.5" stroke-dasharray="3 3"/>
</svg>
`)}`;

const badgeTuzEsJeg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <defs>
    <radialGradient id="bg5" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#FFF8E7"/>
      <stop offset="65%" stop-color="#E5A842"/>
      <stop offset="100%" stop-color="#8B261D"/>
    </radialGradient>
  </defs>
  <circle cx="80" cy="80" r="74" fill="url(#bg5)" stroke="#5A2318" stroke-width="5"/>
  <circle cx="80" cy="80" r="64" fill="none" stroke="#FAF7EE" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- Thermometer motif in the center -->
  <rect x="74" y="30" width="12" height="60" rx="6" fill="#FAF5E8" stroke="#2E1B14" stroke-width="2.5"/>
  <circle cx="80" cy="98" r="14" fill="#B85042" stroke="#2E1B14" stroke-width="3"/>
  <rect x="77" y="48" width="6" height="46" rx="3" fill="#B85042"/>
  <!-- Flame accent on left -->
  <path d="M50 78 Q42 62 54 48 Q60 60 55 72 Z" fill="#D9534F" opacity="0.9"/>
  <!-- Snowflake crystal on right -->
  <g stroke="#3A6B88" stroke-width="2.5" stroke-linecap="round">
    <line x1="108" y1="46" x2="108" y2="72"/>
    <line x1="95" y1="59" x2="121" y2="59"/>
    <line x1="99" y1="50" x2="117" y2="68"/>
    <line x1="99" y1="68" x2="117" y2="50"/>
  </g>
</svg>
`)}`;

export { badgeHidvero, badgeReveszBaratja, badgeVasariElesSzem, badgeIdoUra, badgeTuzEsJeg, miskaCoverImg };

// Known image alias map for all lessons
const KNOWN_IMAGES: Record<string, string> = {
  // Lesson 1: A híd próbája
  'l1:01_hirdetmeny.png': img01,
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

  // Lesson 2: A révész hordói
  'l2:01_folyohoz_erkezes.png': l2Img01,
  'l2:02_reves_probaja.png': l2Img02,
  'l2:03_tanakodas.png': l2Img03,
  'l2:04_a_megoldas.png': l2Img04,
  'l2:05_gyozelem.png': l2Img05,
  'l2:06_a_fordulat.png': l2Img06,
  '01_folyohoz_erkezes.png': l2Img01,
  '02_reves_probaja.png': l2Img02,
  '03_tanakodas.png': l2Img03,
  '04_a_megoldas.png': l2Img04,
  'badge_revesz_baratja.png': badgeReveszBaratja,

  // Lesson 3: A vásár csalói
  'l3:01_a_vasarter.png': l3Img01,
  'l3:02_a_gyogyito_lany.png': l3Img02,
  'l3:03_a_harom_sator.png': l3Img03,
  'l3:04_a_leleplezes.png': l3Img04,
  'l3:05_gyozelem.png': l3Img05,
  'l3:06_a_fordulat.png': l3Img06,
  '01_a_vasarter.png': l3Img01,
  '02_a_gyogyito_lany.png': l3Img02,
  '03_a_harom_sator.png': l3Img03,
  '04_a_leleplezes.png': l3Img04,
  'badge_vasari_eles_szem.png': badgeVasariElesSzem,

  // Lesson 4: A toronyóra-készítő
  'l4:01_toronyora_keszito.png': l4Img01,
  'l4:02_a_feladat.png': l4Img02,
  'l4:03_munkahoz_latnak.png': l4Img03,
  'l4:04_a_lengo_inga.png': l4Img04,
  'l4:05_az_ora_ujraindul.png': l4Img05,
  'l4:06_a_fordulat.png': l4Img06,
  '01_toronyora_keszito.png': l4Img01,
  '02_a_feladat.png': l4Img02,
  '03_munkahoz_latnak.png': l4Img03,
  '04_a_lengo_inga.png': l4Img04,
  '05_az_ora_ujraindul.png': l4Img05,
  '06_a_fordulat.png': l4Img06,

  // Lesson 5: Tűz és jég között
  'l5:01_az_utelagazas.png': l5Img01,
  'l5:02_a_hazug_kezek.png': l5Img02,
  'l5:03_a_varazsuveg.png': l5Img03,
  'l5:04_a_furcsa_feliratok.png': l5Img04,
  'l5:05_a_gazlo.png': l5Img05,
  'l5:06_a_kiralylany.png': l5Img06,
  '01_az_utelagazas.png': l5Img01,
  '02_a_hazug_kezek.png': l5Img02,
  '03_a_varazsuveg.png': l5Img03,
  '04_a_furcsa_feliratok.png': l5Img04,
  '05_a_gazlo.png': l5Img05,
  '06_a_kiralylany.png': l5Img06,
  'badge_tuz_es_jeg.png': badgeTuzEsJeg,
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

  // 1. Direct match in namespaced aliases or global aliases
  if (KNOWN_IMAGES[`${lessonId}:${imageName}`]) {
    return KNOWN_IMAGES[`${lessonId}:${imageName}`];
  }
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
