import React from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { badgeHidvero, badgeReveszBaratja, badgeVasariElesSzem } from '../content/lessons';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedPoints: number;
  totalPointsAvailable: number;
  completedTasksCount: number;
  studentName?: string;
  currentLessonId?: string;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  earnedPoints,
  totalPointsAvailable,
  completedTasksCount,
  studentName,
  currentLessonId = 'l3',
}) => {
  if (!isOpen) return null;

  const isL3 = currentLessonId === 'l3';
  const isL2 = currentLessonId === 'l2';

  const badgeInfo = isL3
    ? {
        name: 'VÁSÁRI ÉLES SZEM',
        subtitle: '3. Óra Hőse — Fizikai Jelvény',
        quote: '„Aki pontosan mér és számol, azt a vásár kalmárai sem tudják becsapni!”',
        image: badgeVasariElesSzem,
        tasks: [
          '1. Négy egylépéses átváltás (2,4 m, 3500 g, 0,75 l, 0,8 km)',
          '2. Az italmérő trükkje (8 × 3 dl = 2,4 l vs 3 l, 600 ml hiány)',
          '3. Csalás-feladvány & Megoldókulcs (e ≥ 2·d szabály ellenőrzése)',
        ],
      }
    : isL2
    ? {
        name: 'A RÉVÉSZ BARÁTJA',
        subtitle: '2. Óra Hőse — Fizikai Jelvény',
        quote: '„Megfejtetted a révész próbáját a térfogat és tömeg pontos vizsgálatával!”',
        image: badgeReveszBaratja,
        tasks: [
          '1. Kiszorításos térfogatmérés hengerrel',
          '2. Tömeg és térfogat hányadosának (sűrűség) vizsgálata',
          '3. Tudományos indoklás a hamis bor leleplezésére',
        ],
      }
    : {
        name: 'HÍDVERŐ',
        subtitle: '1. Óra Hőse — Fizikai Jelvény',
        quote: '„Aki egységesen, ellenőrizve mér, azt nem lehet becsapni.”',
        image: badgeHidvero,
        tasks: [
          '1. Mértékegység-átváltás (350 cm, 1,2 km, 45 mm)',
          '2. Páros mérés és számtani közép (átlag) számítása',
          '3. Fizikusi érvelés a szabványos mértékegységekről',
        ],
      };

  const isUnlocked = completedTasksCount >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        id="badge-modal-dialog"
        className="w-full max-w-md bg-[#FAF8F2] rounded-3xl shadow-2xl border-2 border-[#C28B38]/40 overflow-hidden relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-[#2E1B14]/60 hover:text-[#2E1B14] p-1.5 rounded-full bg-white/70 backdrop-blur-sm shadow transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Hero Header */}
        <div className="bg-gradient-to-b from-[#2E1B14] to-[#40261c] text-white p-6 pt-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C28B38_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative mx-auto w-32 h-32 rounded-2xl p-1 bg-gradient-to-br from-[#C28B38] to-[#B85042] shadow-xl mb-4">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#2E1B14] relative flex items-center justify-center">
              <img
                src={badgeInfo.image}
                alt={badgeInfo.name}
                className={`w-full h-full object-contain p-1 transition-transform duration-500 ${isUnlocked ? 'scale-100 hover:scale-105' : 'grayscale opacity-60'}`}
                referrerPolicy="no-referrer"
              />
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white/80 drop-shadow" />
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C28B38]/30 border border-[#C28B38]/50 text-amber-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {badgeInfo.subtitle}
          </div>

          <h2 className="text-2xl font-bold font-title tracking-wider text-amber-100">
            {badgeInfo.name}
          </h2>
          <p className="text-xs text-amber-200/80 max-w-xs mx-auto mt-1">
            {badgeInfo.quote}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-[#2E1B14] space-y-2">
            <div className="flex items-center justify-between font-semibold text-amber-950">
              <span>Feloldási feltétel:</span>
              <span className="font-bold text-[#B85042]">{completedTasksCount} / 3 feladat kész</span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-200/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B85042] to-[#C28B38] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (completedTasksCount / 3) * 100)}%` }}
              />
            </div>
            <ul className="space-y-1 pt-1 text-[11px] text-[#2E1B14]/80">
              {badgeInfo.tasks.map((taskLabel, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${completedTasksCount > idx ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{taskLabel}</span>
                </li>
              ))}
            </ul>
          </div>

          {isUnlocked ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Gratulálunk{studentName ? `, ${studentName}` : ''}! Sikeresen megszerezted a {badgeInfo.name} kitüntetést!
              </p>
              <p className="text-[11px] text-emerald-700">
                A megszerzett {earnedPoints} pontod rögzítve lett. A jelvényt a tanár a Fizika Pontkövető tanári felületén hitelesíti.
              </p>
            </div>
          ) : (
            <p className="text-xs text-center text-[#2E1B14]/70">
              Oldd meg mind a 3 próbatételt a mesében a {badgeInfo.name} jelvény elnyeréséhez!
            </p>
          )}

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://fizika-pontkoveto.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#B85042] hover:underline font-semibold"
            >
              <span>Pontkövető felület megnyitása</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2E1B14] text-white text-xs font-semibold hover:bg-[#43271d]"
            >
              Vissza a meséhez
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
