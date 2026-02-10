import { useState, useEffect } from 'react';
import { Loader, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import FormInput from '../FormInput';
import { FormErrors } from '../../types';
import { supabase } from '../../lib/supabase';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export default function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have a valid session/token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({ 
          type: 'error', 
          text: 'Link je istekao ili nije validan. Pokušajte ponovo.' 
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!password || password.length < 6) {
      newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Lozinka uspešno promenjena!' 
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Greška pri promeni lozinke. Pokušajte ponovno.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-md mx-auto">
        <div className="space-y-5">
          <div className="flex justify-center mb-2">
            <img src="/logodarkbrown.svg" alt="Logo" className="w-12 h-12 opacity-70" />
          </div>

          <div className="text-center">
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2e2a27' }} className="text-4xl font-bold mb-1">
              Nova Lozinka
            </h1>
            <p style={{ color: '#6f6a65' }} className="text-sm">
              Unesite vašu novu lozinku
            </p>
          </div>

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

            <div>
              <FormInput
                label="Nova Lozinka"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (errors.password) {
                    const newErrors = { ...errors };
                    delete newErrors.password;
                    setErrors(newErrors);
                  }
                }}
                error={errors.password}
                placeholder="Unesite novu lozinku"
                required
              />
            </div>

            <div>
              <FormInput
                label="Potvrdite Lozinku"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  if (errors.confirmPassword) {
                    const newErrors = { ...errors };
                    delete newErrors.confirmPassword;
                    setErrors(newErrors);
                  }
                }}
                error={errors.confirmPassword}
                placeholder="Potvrdite novu lozinku"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[50px] px-6 py-4 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2e2a27' }}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                'Sačuvaj novu lozinku'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}