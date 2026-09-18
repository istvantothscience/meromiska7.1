import React, { useState } from 'react';
import { CheckCircle2, XCircle, Send, HelpCircle, MessageSquareQuote, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitTaskScore } from '../lib/supabase';
import type { TaskSubmissionState } from '../types';

interface TaskIndoklasProps {
  submissionState?: TaskSubmissionState;
  onSubmitted: (state: TaskSubmissionState) => void;
  isProjectorMode?: boolean;
}

// Hungarian keywords related to why steps/spans are unreliable
const VALID_KEYWORDS = [
  'emberenként',
  'eltérő',
  'valtozik',
  'változik',
  'nem egyforma',
  'nem azonos',
  'különböző',
  'kulonbozo',
  'egyéni',
  'egyni',
  'magasság',
  'láb',
  'kéz',
  'testméret',
  'szabvány',
  'nem szabványos',
  'lépéshossz',
  'pontatlan',
  'arasz',
  'subjektív',
  'szubjektív',
];

export const TaskIndoklas: React.FC<TaskIndoklasProps> = ({
  submissionState,
  onSubmitted,
  isProjectorMode = false,
}) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed?: boolean;
    message?: string;
  } | null>(null);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);

  const isCompleted = submissionState?.isCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted && !isProjectorMode) return;

    const trimmed = text.trim();
    if (trimmed.length < 20) {
      setFeedback({
        passed: false,
        message: `Kérlek, fejtsd ki részletesebben a választ! Legalább 20 karakter szükséges (jelenleg: ${trimmed.length} karakter).`,
      });
      return;
    }

    const lower = trimmed.toLowerCase();
    const hasKeyword = VALID_KEYWORDS.some((kw) => lower.includes(kw));

    if (hasKeyword) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#B85042', '#A7BEAE', '#E7E8D1', '#C28B38'],
        });
      } catch {
        // ignore confetti
      }

      setIsSubmitting(true);
      const res = await submitTaskScore({
        item: 'l1_c_indoklas',
        points: 1,
        note: 'Indoklás: miért nem megbízható a lépés/arasz — A híd próbája',
        mode: 'once',
      });
      setIsSubmitting(false);

      setFeedback({
        passed: true,
        message: res.message || 'Kitűnő fizikusi indoklás! Felismerted, hogy a testméretek különbözősége miatt nincs egységes mérce. 1 pont jóváírva!',
      });

      onSubmitted({
        isCompleted: true,
        pointsAwarded: 1,
        responseSummary: trimmed,
      });
    } else {
      setFeedback({
        passed: false,
        message: 'Jó gondolat, de próbáljatok konkrétabban utalni arra, hogy miért nem egyforma mindenki lépése vagy arasza. Egészítsétek ki a mondatot!',
      });
    }
  };

  return (
    <div id="task-indoklas-container" className="p-6 md:p-8 rounded-2xl bg-[#FAF8F2] border-2 border-[#B85042]/30 shadow-md">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#B85042]/20">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#B85042] text-white flex items-center justify-center font-bold text-sm">
            3
          </span>
          <div>
            <h3 className="text-xl font-bold text-[#2E1B14] font-serif-story">
              3. Feladat: Fizikusi indoklás
            </h3>
            <p className="text-xs text-[#2E1B14]/70">
              Miért nem megbízható mértékegység a lépés vagy az arasz? Fogalmazzátok meg saját szavaitokkal!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Teljesítve (1 pont)
            </span>
          )}
          {isProjectorMode && (
            <button
              id="btn-teacher-guide-indoklas"
              type="button"
              onClick={() => setShowTeacherGuide(!showTeacherGuide)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-[#E7E8D1] text-[#2E1B14] hover:bg-[#d8d9be] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showTeacherGuide ? 'Mintaválaszok elrejtése' : 'Mintaválaszok'}
            </button>
          )}
        </div>
      </div>

      {showTeacherGuide && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#2E1B14] space-y-1.5">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-700" />
            Tanári minta-indoklások (kulcsszavak a javítókulcs szerint):
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-950">
            <li><em>„A lépés és az arasz emberenként eltérő méretű, mert a testmagasságunk és lábunk nem egyforma.”</em></li>
            <li><em>„Nem tekinthető megbízható mértékegységnek, mivel nincs mögötte egyértelmű, rögzített szabvány.”</em></li>
            <li><em>„Ugyanaz a távolság egy magas embernek kevesebb lépés, egy alacsonyabbnak több lépés, így zűrzavar keletkezik.”</em></li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="textarea-indoklas" className="block text-sm font-semibold text-[#2E1B14] mb-1.5">
            A ti páros indoklásotok:
          </label>
          <textarea
            id="textarea-indoklas"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCompleted && !isProjectorMode}
            placeholder="Írjátok le, hogy szerintetek miért keletkezett zűrzavar a hídnál a vándorok különböző lépései miatt..."
            className="w-full p-3.5 rounded-xl border border-[#2E1B14]/20 focus:outline-none focus:ring-2 focus:ring-[#B85042] text-[#2E1B14] leading-relaxed resize-y"
            required
          />
          <div className="flex justify-between items-center mt-1 text-xs text-[#2E1B14]/60">
            <span>Minimum 20 karakter szükséges</span>
            <span>{text.trim().length} karakter beírva</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
              feedback.passed ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {feedback.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{feedback.message}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#2E1B14]/60">
            A megadott szöveget a tanár a Pontkövető felületén is megtekintheti.
          </p>
          {(!isCompleted || isProjectorMode) && (
            <button
              id="btn-submit-indoklas"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B85042] text-white font-medium shadow hover:bg-[#a24336] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Ellenőrzés & Mentés...' : 'Indoklás elküldése (1 pont)'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
