import React, { useState } from 'react';
import { supabase, getStudentProfile } from '../lib/supabase';
import type { UserProfile } from '../types';
import { X, LogIn, ExternalLink, UserCheck, AlertCircle, Users, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  currentProfile: UserProfile | null;
  onLogout: () => void;
  onUpdatePartner: (partnerName: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
  onLogout,
  onUpdatePartner,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerName, setPartnerName] = useState(currentProfile?.partnerName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      const profile = await getStudentProfile();
      if (profile) {
        const fullProfile = {
          ...profile,
          partnerName: partnerName.trim() || undefined,
        };
        onSuccess(fullProfile);
        onClose();
      } else {
        // Fallback profile if whoami failed
        const fallback: UserProfile = {
          class_code: '7. osztály',
          name: email.split('@')[0],
          email,
          partnerName: partnerName.trim() || undefined,
        };
        onSuccess(fallback);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Hibás e-mail cím vagy jelszó! Kérlek, ellenőrizd a Fizika Pontkövetőben használt belépési adataidat.');
      } else {
        setErrorMessage(`Sikertelen bejelentkezés: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePartner(partnerName.trim());
    onClose();
  };

  const handleGuestDemo = () => {
    const demoProfile: UserProfile = {
      class_code: '7. minta',
      name: 'Próba Diák',
      email: 'demo@iskola.hu',
      partnerName: partnerName.trim() || 'Próba Pár',
    };
    onSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        id="auth-modal-dialog"
        className="w-full max-w-md bg-[#FAF8F2] rounded-2xl shadow-2xl border border-[#B85042]/30 overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-[#2E1B14] text-white p-6 relative">
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B85042] flex items-center justify-center text-white">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-story tracking-wide">
                Fizika Pontkövető Belépés
              </h2>
              <p className="text-xs text-[#E7E8D1]/80">
                Közös pontgyűjtés 7. évfolyamos fizikához
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {currentProfile ? (
            /* Already logged in view */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <UserCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Bejelentkezve mint:</p>
                  <p className="text-base font-bold text-emerald-950">{currentProfile.name}</p>
                  <p className="text-xs text-emerald-800">
                    Osztály: <span className="font-semibold">{currentProfile.class_code}</span> ({currentProfile.email || 'Pontkövető fiók'})
                  </p>
                </div>
              </div>

              {/* Partner name editing */}
              <form onSubmit={handlePartnerSave} className="p-4 rounded-xl bg-white border border-[#2E1B14]/15 space-y-3">
                <label htmlFor="input-partner-existing" className="block text-xs font-semibold text-[#2E1B14] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#B85042]" />
                  Páros partner neve az órán:
                </label>
                <input
                  id="input-partner-existing"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="pl. Kis János"
                  className="w-full px-3 py-2 rounded-lg border border-[#2E1B14]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#B85042]"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-[#E7E8D1] text-[#2E1B14] text-xs font-semibold hover:bg-[#dedfbe] transition-colors"
                >
                  Páros partner mentése
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between">
                <button
                  id="btn-sign-out"
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline"
                >
                  Kijelentkezés ebből a fiókból
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#2E1B14] text-white text-xs font-semibold"
                >
                  Rendben, vissza a meséhez
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-[#2E1B14] uppercase tracking-wider mb-1">
                  E-mail cím (Pontkövető fiók)
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="diak@iskola.hu"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2E1B14]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#B85042]"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#2E1B14] uppercase tracking-wider mb-1">
                  Jelszó
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2E1B14]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#B85042]"
                />
              </div>

              <div>
                <label htmlFor="auth-partner" className="block text-xs font-semibold text-[#2E1B14] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#B85042]" />
                  Párban dolgoztok? Partnered neve (opcionális):
                </label>
                <input
                  id="auth-partner"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="pl. Szabó Anna"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2E1B14]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#B85042]"
                />
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#B85042] text-white font-semibold text-sm shadow hover:bg-[#a24336] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Bejelentkezés folyamatban...' : 'Bejelentkezés & Pontok mentése'}
              </button>

              <div className="pt-2 border-t border-[#2E1B14]/10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  className="w-full py-2.5 rounded-xl bg-[#E7E8D1]/70 hover:bg-[#E7E8D1] text-[#2E1B14] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B85042]" />
                  Vendég / Tanári próba belépés nélkül
                </button>

                <a
                  href="https://fizika-pontkoveto.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-[#B85042] hover:text-[#903a2e] font-semibold"
                >
                  <span>Még nincs fiókod? Regisztráció / Első belépés a Pontkövetőn</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
