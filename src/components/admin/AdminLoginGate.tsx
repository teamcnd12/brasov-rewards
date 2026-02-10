import { useState } from 'react';
import { Shield, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sr } from '../../locales/sr';

interface AdminLoginGateProps {
  onAuthenticated: () => void;
  onBack: () => void;
}

export default function AdminLoginGate({ onAuthenticated, onBack }: AdminLoginGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bolec2008') {
      onAuthenticated();
    } else {
      setError(sr.admin.pogresna_lozinka);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{sr.common.nazad}</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">{sr.admin.panel}</h1>
            <p className="text-gray-500 text-sm mt-2">{sr.admin.unesite_lozinku}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={sr.admin.lozinka}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors min-h-[50px]"
            >
              {sr.admin.pristupi}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
