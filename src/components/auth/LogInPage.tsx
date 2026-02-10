import { useState } from 'react';
import { ChevronLeft, Loader, AlertCircle } from 'lucide-react';
import FormInput from '../FormInput';
import { validateEmail } from '../../utils/validation';
import { User, FormErrors } from '../../types';
import { supabase } from '../../lib/supabase';
import { sr } from '../../locales/sr';

interface LogInPageProps {
  onLogInSuccess: (user: User) => void;
  onBack: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

export default function LogInPage({ onLogInSuccess, onBack, onSignUp, onForgotPassword }: LogInPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    let isValid = false;
    let error = '';

    switch (field) {
      case 'email':
        isValid = validateEmail(value);
        error = isValid ? '' : 'Unesite validnu email adresu';
        break;
      case 'password':
        isValid = value.length >= 1;
        error = '';
        break;
    }

    if (isValid) {
      setValidFields(prev => new Set(prev).add(field));
    } else {
      setValidFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Unesite validnu email adresu';
    }

    if (formData.password.length === 0) {
      newErrors.password = 'Lozinka je obavezna';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (authError) {
        setIsLoading(false);
        setErrors({ submit: 'Nevalidan email ili lozinka' });
        return;
      }

      if (!authData.user) {
        setIsLoading(false);
        setErrors({ submit: 'Greška pri prijavi. Pokušajte ponovno.' });
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (!user) {
        setIsLoading(false);
        setErrors({ submit: 'Profil nije pronađen' });
        return;
      }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: activityLog } = user.role === 'staff'
        ? await supabase
            .from('activity_log')
            .select('*')
            .eq('staff_id', user.id)
            .order('created_at', { ascending: false })
        : { data: [] };

      const userObj: User = {
        id: user.id,
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tokenBalance: user.token_balance || 0,
        totalTokensEarned: user.total_tokens_earned || 0,
        totalSpent: Number(user.total_spent || 0),
        memberSince: user.member_since,
        createdBy: user.created_by,
        tokensAddedToday: user.tokens_added_today || 0,
        redemptionsVerifiedToday: user.redemptions_verified_today || 0,
        transactions: transactions?.map(t => ({
          id: t.id,
          date: t.date,
          amountSpent: Number(t.amount_spent),
          tokensEarned: t.tokens_earned,
          timestamp: t.timestamp,
          addedBy: t.added_by,
          staffId: t.staff_id,
        })) || [],
        activityLog: activityLog?.map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          action: a.action,
          customerId: a.customer_id,
          customerName: a.customer_name,
          details: a.details,
        })) || [],
      };

      if (formData.rememberMe) {
        localStorage.setItem('userSession', JSON.stringify({
          userId: user.id,
          email: user.email,
          timestamp: Date.now(),
        }));
      } else {
        localStorage.removeItem('userSession');
      }

      setIsLoading(false);
      onLogInSuccess(userObj);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setErrors({ submit: 'Došlo je do greške. Pokušajte ponovno.' });
    }
  };

  const handleForgotPasswordClick = () => {
    onForgotPassword();
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
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2e2a27' }} className="text-4xl font-bold mb-1">Dobrodošli nazad</h1>
            <p style={{ color: '#6f6a65' }} className="text-sm">Prijavi se na svoj {sr.landing.nagrade} nalog</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
            {errors.submit && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">{errors.submit}</span>
              </div>
            )}

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              error={errors.email}
              isValid={validFields.has('email')}
              placeholder="petar@primer.rs"
              required
            />

            <FormInput
              label="Lozinka"
              type="password"
              value={formData.password}
              onChange={(value) => updateField('password', value)}
              error={errors.password}
              isValid={validFields.has('password')}
              placeholder="Unesite vašu lozinku"
              required
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))
                  }
                  className="w-4 h-4 accent-black cursor-pointer flex-shrink-0"
                />
                <label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">
                  Zapamti me
                </label>
              </div>

              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-xs hover:opacity-70 transition-colors"
                style={{ color: '#6f6a65' }}
              >
                Zaboravili ste lozinku?
              </button>
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
                  Prijava u toku...
                </>
              ) : (
                'Prijavi se'
              )}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#6f6a65' }}>
              Nemaš nalog?{' '}
              <button
                onClick={onSignUp}
                className="font-bold hover:opacity-70 transition-colors"
                style={{ color: '#2e2a27' }}
              >
                Registruj se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
