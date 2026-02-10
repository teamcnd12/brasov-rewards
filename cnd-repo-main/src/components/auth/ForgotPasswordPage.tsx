import { useState } from 'react';
import { ChevronLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import FormInput from '../FormInput';
import { validateEmail } from '../../utils/validation';
import { FormErrors } from '../../types';
import { supabase } from '../../lib/supabase';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Unesite validnu email adresu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}`,
});

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Proverite vašu email adresu za link za resetovanje lozinke!' });
        setSubmitted(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Greška pri slanju. Pokušajte ponovno.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 transition-colors mb-6 min-h-[44px] hover:opacity-70"
          style={{ color: '#2e2a27' }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Nazad</span>
        </button>

        <div className="space-y-5">
          <div className="flex justify-center mb-2">
            <img src="/logodarkbrown.svg" alt="Logo" className="w-12 h-12 opacity-70" />
          </div>

          <div className="text-center">
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2e2a27' }} className="text-4xl font-bold mb-1">Zaboravili ste lozinku?</h1>
            <p style={{ color: '#6f6a65' }} className="text-sm">Unesite vašu email adresu da biste resetovali lozinku</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
              {message && (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-50 border-2 border-red-300 text-red-600'
                    : 'bg-green-50 border-2 border-green-300 text-green-700'
                }`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm">{message.text}</span>
                </div>
              )}

              <FormInput
                label="Email adresa"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (errors.email) {
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }
                }}
                error={errors.email}
                placeholder="petar@primer.rs"
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[50px] px-6 py-4 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#2e2a27' }}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Slanje...
                  </>
                ) : (
                  'Pošalji link za resetovanje'
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-lg p-6 space-y-4 text-center" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#d1fae5' }}>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#2e2a27' }}>Proverite vašu email!</h2>
              <p style={{ color: '#6f6a65' }} className="text-sm">
                Poslali smo link za resetovanje lozinke na <strong>{email}</strong>. Kliknite na link da postavite novu lozinku.
              </p>
              <button
                onClick={onBack}
                className="w-full min-h-[50px] px-6 py-4 text-white rounded-lg font-bold transition-all duration-200"
                style={{ backgroundColor: '#2e2a27' }}
              >
                Nazad na prijavu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
