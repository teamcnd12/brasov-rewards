import { sr } from '../../locales/sr';

interface WelcomePageProps {
  onSignUp: () => void;
  onLogIn: () => void;
  onStaffAccess: () => void;
  onAdminAccess: () => void;
}

export default function WelcomePage({ onSignUp, onLogIn, onStaffAccess, onAdminAccess }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf9f6' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="flex justify-center">
            <img src="/logodarkbrown.svg" alt="Logo" className="w-40 h-40" />
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#2e2a27' }}>{sr.landing.nagrade}</h1>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', lineHeight: '1.8', color: '#6f6a65' }} className="text-xl">{sr.landing.opis}</p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={onSignUp}
              style={{ backgroundColor: '#2e2a27' }}
              className="w-full min-h-[50px] px-6 py-4 text-white font-bold text-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 rounded-lg"
            >
              {sr.landing.registruj_se}
            </button>

            <button
              onClick={onLogIn}
              style={{ backgroundColor: '#eae8e4', color: '#2e2a27' }}
              className="w-full min-h-[50px] px-6 py-4 font-bold text-lg hover:opacity-90 transition-all duration-200 rounded-lg"
            >
              {sr.landing.prijavi_se}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        <div className="flex gap-4 justify-center text-xs mb-4" style={{ color: '#6f6a65' }}>
          <button
            onClick={onStaffAccess}
            className="hover:underline transition-colors"
          >
            {sr.landing.pristup_osoblja}
          </button>
          <span style={{ color: '#d5d0cb' }}>|</span>
          <button
            onClick={onAdminAccess}
            className="hover:underline transition-colors"
          >
            {sr.admin.pristup_admina}
          </button>
        </div>
        <p>© 2026 {sr.landing.nagrade}. All rights reserved.</p>
      </div>
    </div>
  );
}
