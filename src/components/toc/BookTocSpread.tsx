import React from 'react';
import { Lock, CheckCircle, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { getAllLessons } from '../../content/lessons';

interface Props {
  onOpenLesson: (lessonId: string) => void;
}

interface ChapterEntry {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  topic: string;
}

const ALL_8_CHAPTERS: ChapterEntry[] = [
  {
    number: 1,
    id: 'l1',
    title: 'A híd próbája',
    subtitle: 'Alapmértékegységek és szabványos mérés',
    topic: 'Mérés',
  },
  {
    number: 2,
    id: 'l2',
    title: 'A két hordó és az űrmérték',
    subtitle: 'Térfogatmérés folyadékokkal és edényekkel',
    topic: 'Térfogat',
  },
  {
    number: 3,
    id: 'l3',
    title: 'A mérleg egyensúlya',
    subtitle: 'Tömeg, nehézkedés és egyensúly',
    topic: 'Tömeg',
  },
  {
    number: 4,
    id: 'l4',
    title: 'Az idő homokszemei',
    subtitle: 'Időmérés, periódus és pontosság',
    topic: 'Idő',
  },
  {
    number: 5,
    id: 'l5',
    title: 'A sűrűség próbája',
    subtitle: 'Arany vagy hamisítvány? Anyagok sűrűsége',
    topic: 'Sűrűség',
  },
  {
    number: 6,
    id: 'l6',
    title: 'A testek mozgása',
    subtitle: 'Pálya, út és elmozdulás',
    topic: 'Mozgástan',
  },
  {
    number: 7,
    id: 'l7',
    title: 'A sebesség versenye',
    subtitle: 'Átlagsebesség és egyenletes haladás',
    topic: 'Sebesség',
  },
  {
    number: 8,
    id: 'l8',
    title: 'A királyi udvar végső próbája',
    subtitle: 'Összefoglaló próbatétel fél királyságért',
    topic: 'Összefoglalás',
  },
];

export const BookTocLeft: React.FC<Props> = ({ onOpenLesson }) => {
  const existingLessons = getAllLessons();
  const availableIds = new Set(existingLessons.map((l) => l.lesson_id));

  const chaptersPart1 = ALL_8_CHAPTERS.slice(0, 4);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-none">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
            Fizika 7.
          </span>
          <span className="text-xs font-serif italic text-[#8C6D58]">
            Éves tananyag-mesekönyv
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B261D] mb-1">
          Tartalomjegyzék
        </h2>
        <p className="text-xs text-[#5A4232] italic mb-4">
          I. Kötet: A mérés alapjai (1–4. fejezet)
        </p>

        <div className="space-y-2.5">
          {chaptersPart1.map((ch) => {
            const isAvailable = availableIds.has(ch.id);

            return (
              <div
                key={ch.id}
                className={`p-3 rounded-lg border transition-all ${
                  isAvailable
                    ? 'bg-[#FBF6EC] border-[#C6923C] hover:shadow-md cursor-pointer hover:border-[#B85042]'
                    : 'bg-[#F0E9DA]/60 border-[#DFCDB3]/50 opacity-70'
                }`}
                onClick={() => isAvailable && onOpenLesson(ch.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-serif font-bold flex items-center justify-center ${
                        isAvailable
                          ? 'bg-[#B85042] text-white'
                          : 'bg-[#C8B89E] text-[#5A4232]'
                      }`}
                    >
                      {ch.number}
                    </span>
                    <div>
                      <h4
                        className={`font-serif text-sm sm:text-base font-bold leading-snug ${
                          isAvailable ? 'text-[#8B261D]' : 'text-[#5A4232]'
                        }`}
                      >
                        {ch.title}
                      </h4>
                      <p className="text-xs text-[#7A6150] line-clamp-1">
                        {ch.subtitle}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <BookOpen className="w-3 h-3" /> Olvasás
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#8C6D58] bg-[#E5DBC7] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Hamarosan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#DFCDB3] text-xs text-[#8C6D58] font-serif italic text-center">
        „Aki jól mér, az nem téved.” — Lapozz tovább a 2. oldalra →
      </div>
    </div>
  );
};

export const BookTocRight: React.FC<Props> = ({ onOpenLesson }) => {
  const existingLessons = getAllLessons();
  const availableIds = new Set(existingLessons.map((l) => l.lesson_id));

  const chaptersPart2 = ALL_8_CHAPTERS.slice(4, 8);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-none">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-serif italic text-[#8C6D58]">
            II. Kötet: Mozgások és anyagok (5–8. fejezet)
          </span>
          <span className="text-xs font-mono text-[#8C6D58]">8 óra</span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-4">
          A próbák folytatása
        </h3>

        <div className="space-y-2.5">
          {chaptersPart2.map((ch) => {
            const isAvailable = availableIds.has(ch.id);

            return (
              <div
                key={ch.id}
                className={`p-3 rounded-lg border transition-all ${
                  isAvailable
                    ? 'bg-[#FBF6EC] border-[#C6923C] hover:shadow-md cursor-pointer hover:border-[#B85042]'
                    : 'bg-[#F0E9DA]/60 border-[#DFCDB3]/50 opacity-70'
                }`}
                onClick={() => isAvailable && onOpenLesson(ch.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-serif font-bold flex items-center justify-center ${
                        isAvailable
                          ? 'bg-[#B85042] text-white'
                          : 'bg-[#C8B89E] text-[#5A4232]'
                      }`}
                    >
                      {ch.number}
                    </span>
                    <div>
                      <h4
                        className={`font-serif text-sm sm:text-base font-bold leading-snug ${
                          isAvailable ? 'text-[#8B261D]' : 'text-[#5A4232]'
                        }`}
                      >
                        {ch.title}
                      </h4>
                      <p className="text-xs text-[#7A6150] line-clamp-1">
                        {ch.subtitle}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <BookOpen className="w-3 h-3" /> Olvasás
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#8C6D58] bg-[#E5DBC7] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Hamarosan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFCDB3] space-y-2">
        <button
          onClick={() => onOpenLesson('l1')}
          className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          <BookOpen className="w-4 h-4" />
          1. Fejezet megnyitása: A híd próbája
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
