import React, { useState } from 'react';
import { LogIn, LogOut, ExternalLink, ShieldCheck, User, Award, BookOpen, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { signInStudent, signOutStudent } from '../../lib/supabase';
import type { UserProfile } from '../../types';

interface Props {
  user: UserProfile | null;
  onUserChanged: (newUser: UserProfile | null) => void;
  onGoToToc: () => void;
}

export const BookAuthSpread: React.FC<Props> = ({ user, onUserChanged, onGoToToc }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Kérlek add meg az e-mail címedet és a jelszavadat!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await signInStudent(email.trim(), password);
    setLoading(false);

    if (res.success && res.profile) {
      onUserChanged(res.profile);
      setSuccessMsg(`Sikeres bejelentkezés! Üdvözlünk, ${res.profile.name}!`);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } else {
      setErrorMsg(res.error || 'Sikertelen bejelentkezés. Ellenőrizd az e-mail címet és a jelszót!');
    }
  };

  const handleQuickDemoStudent = (demoName: string, demoClass: string) => {
    const demoProfile: UserProfile = {
      name: demoName,
      class_code: demoClass,
      email: `${demoName.toLowerCase().replace(/\s+/g, '.')}@iskola.hu`,
    };
    onUserChanged(demoProfile);
    setSuccessMsg(`Bejelentkezve mint ${demoName} (${demoClass})!`);
  };

  const handleLogout = async () => {
    await signOutStudent();
    onUserChanged(null);
    setSuccessMsg('Kijelentkezve.');
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-4 sm:p-6 text-[#2E1B14] select-text relative z-30"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#B85042] text-white text-xs font-serif uppercase tracking-widest px-2.5 py-1 rounded">
            Azonosítás
          </span>
          <span className="text-xs font-mono text-[#8C6D58] bg-[#EAE2D0] px-2 py-0.5 rounded">
            Fizika Pontkövető
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B261D] mb-1.5">
          {user ? 'Diák Adatlap' : 'Belépés a mesekönyvbe'}
        </h3>

        <p className="text-xs sm:text-sm text-[#5A4232] leading-relaxed mb-3">
          {user
            ? 'A fiókod sikeresen összekapcsolódott a könyvvel. A feladatok megoldásakor a pontjaid automatikusan mentésre kerülnek!'
            : 'Add meg a Pontkövetőben regisztrált e-mail címedet és jelszavadat, vagy válassz gyors belépést.'}
        </p>

        {user ? (
          /* Profile Card */
          <div className="space-y-4">
            <div className="bg-[#FAF4E5] border border-[#DFCDB3] rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#B85042] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'D'}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2E1B14]">{user.name}</h4>
                  <div className="text-xs text-[#7A6150] font-mono">{user.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5D9C4] text-xs">
                <div className="bg-white/80 p-2 rounded border border-[#E5D9C4]">
                  <span className="text-[#8C6D58] block">Osztálykód:</span>
                  <span className="font-bold text-[#8B261D] text-sm">{user.class_code}</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-[#E5D9C4]">
                  <span className="text-[#8C6D58] block">Státusz:</span>
                  <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktív diák
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onGoToToc}
              className="w-full py-3 px-4 bg-[#B85042] hover:bg-[#A34335] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Tovább a Tartalomjegyzékhez →
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-transparent hover:bg-[#EAE2D0] border border-[#C8B89E] text-[#5A4232] font-serif text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Kijelentkezés a fiókból
            </button>
          </div>
        ) : (
          /* Login Form */
          <form
            onSubmit={handleLogin}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="space-y-3 relative z-30"
          >
            <div>
              <label
                htmlFor="book-login-email"
                className="block text-xs font-bold text-[#5A4232] uppercase tracking-wider mb-1"
              >
                E-mail cím:
              </label>
              <input
                id="book-login-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                placeholder="pl. kovacs.bence@iskola.hu"
                autoComplete="email"
                className="w-full px-3 py-2 text-sm bg-white border border-[#C8B89E] rounded-md text-[#2E1B14] placeholder:text-[#9F8C7C] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>

            <div>
              <label
                htmlFor="book-login-password"
                className="block text-xs font-bold text-[#5A4232] uppercase tracking-wider mb-1"
              >
                Jelszó:
              </label>
              <input
                id="book-login-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLInputElement).focus();
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3 py-2 text-sm bg-white border border-[#C8B89E] rounded-md text-[#2E1B14] placeholder:text-[#9F8C7C] focus:outline-none focus:ring-2 focus:ring-[#B85042] cursor-text relative z-40 select-text"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-md text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#B85042] hover:bg-[#A34335] text-white font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Bejelentkezés...' : 'Belépek a Pontkövetőbe'}
            </button>

            {/* Quick Demo Fill Buttons for easy classroom testing */}
            <div className="pt-2 border-t border-[#DFCDB3]/70">
              <div className="text-[11px] font-serif text-[#8C6D58] mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-[#C6923C]" />
                <span>Gyors teszt belépés egy kattintással:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickDemoStudent('Kovács Bence', '7.A')}
                  className="px-2 py-1 bg-[#FAF4E5] hover:bg-[#EAE0CD] border border-[#DFCDB3] text-[#5A4232] rounded text-[11px] font-serif transition-colors cursor-pointer"
                >
                  Kovács Bence (7.A)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoStudent('Nagy Anna', '7.B')}
                  className="px-2 py-1 bg-[#FAF4E5] hover:bg-[#EAE0CD] border border-[#DFCDB3] text-[#5A4232] rounded text-[11px] font-serif transition-colors cursor-pointer"
                >
                  Nagy Anna (7.B)
                </button>
              </div>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onGoToToc}
                className="text-xs text-[#8C6D58] hover:text-[#B85042] underline cursor-pointer"
              >
                Olvasás bejelentkezés nélkül (demó mód) →
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#E5D9C4] flex items-center justify-between text-xs text-[#7A6150]">
        <span>Első belépés?</span>
        <a
          href="https://fizika-pontkoveto.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B261D] font-bold flex items-center gap-1 hover:underline"
        >
          Regisztráció itt <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
