import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Info, Scale } from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
}

export const TaskHanyados: React.FC<Props> = ({ user, onPointsUpdated, onCompleted }) => {
  // 3 sample bodies: mass m (g), volume V (cm3), quotient m/V (g/cm3)
  const [m1, setM1] = useState('');
  const [v1, setV1] = useState('');
  const [q1, setQ1] = useState('');

  const [m2, setM2] = useState('');
  const [v2, setV2] = useState('');
  const [q2, setQ2] = useState('');

  const [m3, setM3] = useState('');
  const [v3, setV3] = useState('');
  const [q3, setQ3] = useState('');

  const [conclusion, setConclusion] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const parseVal = (str: string): number | null => {
    const clean = str.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const checkQuotients = () => {
    const numM1 = parseVal(m1);
    const numV1 = parseVal(v1);
    const numQ1 = parseVal(q1);

    const numM2 = parseVal(m2);
    const numV2 = parseVal(v2);
    const numQ2 = parseVal(q2);

    const numM3 = parseVal(m3);
    const numV3 = parseVal(v3);
    const numQ3 = parseVal(q3);

    if (
      numM1 === null || numV1 === null || numQ1 === null ||
      numM2 === null || numV2 === null || numQ2 === null ||
      numM3 === null || numV3 === null || numQ3 === null
    ) {
      return { allFieldsFilled: false, correctMath: false };
    }

    if (numV1 <= 0 || numV2 <= 0 || numV3 <= 0 || numM1 <= 0 || numM2 <= 0 || numM3 <= 0) {
      return { allFieldsFilled: false, correctMath: false };
    }

    const exp1 = numM1 / numV1;
    const exp2 = numM2 / numV2;
    const exp3 = numM3 / numV3;

    // Tolerance ±0.06 to allow for rounding (e.g., 2.7 or 7.8)
    const c1 = Math.abs(numQ1 - exp1) < 0.06;
    const c2 = Math.abs(numQ2 - exp2) < 0.06;
    const c3 = Math.abs(numQ3 - exp3) < 0.06;

    return {
      allFieldsFilled: true,
      correctMath: c1 && c2 && c3,
      c1,
      c2,
      c3,
    };
  };

  const checkConclusion = (text: string): boolean => {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const keywords = [
      'azonos',
      'ugyanannyi',
      'allando',
      'nem valtozik',
      'egyenlo',
      'egyforma',
      'megegyezik',
      'valtozatlan',
      'kozel azonos',
      'suruseg',
    ];
    return text.trim().length >= 10 && keywords.some((k) => lower.includes(k));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mathCheck = checkQuotients();
    if (!mathCheck.allFieldsFilled) {
      setStatus('error');
      setMessage('Kérlek töltsd ki mindhárom hasáb tömegét, térfogatát és hányadosát!');
      return;
    }

    if (!mathCheck.correctMath) {
      setStatus('error');
      setMessage('Legalább egy hányados számítása hibás. A tömeget oszd el a térfogattal (m ÷ V), és ellenőrizd a számolást!');
      return;
    }

    const hasGoodConclusion = checkConclusion(conclusion);

    // Points rule:
    // 1 point: all 3 quotients correct
    // +1 point: conclusion mentions that the ratio is constant / same for identical material
    const points = hasGoodConclusion ? 2 : 1;

    setStatus('submitting');
    setMessage('Számítások ellenőrzése és pont beküldése...');

    const res = await submitTaskScore({
      item: 'l2_b_hanyados',
      points: points,
      note: `A révész hordói — 2. óra: Hányados próba (${points}/2 pont)`,
      mode: 'once',
    });

    if (res.success) {
      soundFx.playSuccess();
      confetti({
        particleCount: points === 2 ? 80 : 45,
        spread: 70,
        origin: { y: 0.65 },
      });
      setStatus('success');
      setPointsAwarded(points);

      if (points === 2) {
        setMessage('Fantasztikus! Mindhárom hányados helyes, és a következtetésed is pontos. Megkaptad a maximális 2 pontot!');
      } else {
        setMessage('A számításaid helyesek (+1 pont)! Ha kiegészíted a szöveges következtetést azzal, hogy a hányados azonos anyagnál állandó, megszerezheted a 2. pontot is.');
      }

      if (res.totalPoints && onPointsUpdated) {
        onPointsUpdated(res.totalPoints);
      }
      if (onCompleted) {
        onCompleted();
      }
    } else {
      setStatus('error');
      setMessage(res.message || 'Hiba történt a beküldéskor.');
    }
  };

  const isDone = status === 'success' && pointsAwarded === 2;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-text">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded font-bold">
              2. Próba
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-1.5 py-0.5 rounded">
              l2_b_hanyados
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-[#8B261D] bg-[#FFF2B2] px-2 py-0.5 rounded border border-[#E5B842]">
            Max. 2 pont
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1">
          Tömeg és térfogat hányadosa
        </h3>
        <p className="text-xs text-[#5A4232] mb-3 leading-relaxed">
          Vizsgálj meg 3 azonos anyagú testet! Oszd el a tömeget a térfogattal (m ÷ V), és figyeld meg a kapott számokat.
        </p>

        {/* Info formula toggle */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-1 text-xs text-[#8B261D] hover:underline font-serif italic cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showFormula ? 'Magyarázat elrejtése' : 'Hogyan számoljuk a hányadost?'}</span>
          </button>
        </div>

        {showFormula && (
          <div className="mb-3 p-3 bg-[#FAF4E5] border border-[#C8B89E] rounded-lg text-xs text-[#4A382D] space-y-1 animate-fadeIn">
            <div className="font-bold text-[#8B261D]">A hányados képlete:</div>
            <div className="font-mono text-center py-1 text-xs bg-white rounded border border-[#DFCDB3]">
              Hányados = Tömeg (m) ÷ Térfogat (V) &nbsp; [g/cm³]
            </div>
            <p className="text-[11px] text-[#7A6150]">
              Ha a testek ugyanabból az anyagból készültek (pl. tiszta vas, fa vagy víz), a tömegük és térfogatuk hányadosa megegyezik!
            </p>
          </div>
        )}

        {/* Form with 3 bodies */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1.5 text-[11px] font-serif font-bold text-[#5A4232] px-1">
            <div className="col-span-3">Test</div>
            <div className="col-span-3">Tömeg (m) [g]</div>
            <div className="col-span-3">Térfogat (V) [cm³]</div>
            <div className="col-span-3 text-center text-[#8B261D]">m ÷ V [g/cm³]</div>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-1.5 items-center p-2 bg-white/70 rounded-lg border border-[#DFCDB3]">
            <div className="col-span-3 font-serif text-xs font-bold text-[#2E1B14] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#B85042]" /> 1. hasáb
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={m1}
                onChange={(e) => setM1(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={v1}
                onChange={(e) => setV1(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs font-bold text-[#8B261D] bg-[#FFF9ED] border border-[#B85042]/40 rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-12 gap-1.5 items-center p-2 bg-white/70 rounded-lg border border-[#DFCDB3]">
            <div className="col-span-3 font-serif text-xs font-bold text-[#2E1B14] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#B85042]" /> 2. hasáb
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={m2}
                onChange={(e) => setM2(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={v2}
                onChange={(e) => setV2(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs font-bold text-[#8B261D] bg-[#FFF9ED] border border-[#B85042]/40 rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-12 gap-1.5 items-center p-2 bg-white/70 rounded-lg border border-[#DFCDB3]">
            <div className="col-span-3 font-serif text-xs font-bold text-[#2E1B14] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#B85042]" /> 3. hasáb
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={m3}
                onChange={(e) => setM3(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={v3}
                onChange={(e) => setV3(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs bg-white border border-[#C8B89E] rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="decimal"
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                disabled={isDone}
                placeholder=""
                className="w-full px-2 py-1 text-xs font-bold text-[#8B261D] bg-[#FFF9ED] border border-[#B85042]/40 rounded text-center focus:ring-1 focus:ring-[#B85042] cursor-text"
              />
            </div>
          </div>

          {/* Conclusion Textarea */}
          <div className="p-3 bg-white/80 rounded-xl border border-[#DFCDB3]">
            <label className="block text-xs font-serif font-bold text-[#8B261D] mb-1">
              Következtetés: Mit tapasztaltál a hányadosokról azonos anyagnál?
            </label>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              disabled={isDone}
              placeholder="Fogalmazd meg a következtetésedet..."
              className="w-full p-2 text-xs bg-white border border-[#C8B89E] rounded text-[#2E1B14] focus:outline-none focus:ring-1 focus:ring-[#B85042] cursor-text resize-none"
            />
            <span className="text-[10px] text-[#8C6D58] block mt-0.5">
              (Hányadosok helyessége: 1 pont; azonos/állandó tulajdonság megfogalmazása: +1 pont)
            </span>
          </div>

          {/* Submit Button */}
          {!isDone && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] disabled:opacity-50 text-white font-serif font-bold text-xs sm:text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'submitting' ? 'Ellenőrzés...' : 'Eredmények beküldése (2 pontért)'}</span>
            </button>
          )}
        </form>
      </div>

      {/* Feedback Messages */}
      <div className="mt-3">
        {status === 'error' && message && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{message}</div>
          </div>
        )}

        {status === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Próba Sikeres!</span>
                <span className="text-[11px] text-emerald-700">{message}</span>
              </div>
            </div>
            {pointsAwarded !== null && (
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs shrink-0 ml-2">
                +{pointsAwarded} pont
              </span>
            )}
          </div>
        )}

        {!user && (
          <p className="text-[11px] text-[#8C6D58] italic text-center mt-2">
            💡 Jelentkezz be a 2. oldalon a pontok mentéséhez!
          </p>
        )}
      </div>
    </div>
  );
};
