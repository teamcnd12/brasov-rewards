import { useState } from 'react';
import { ChevronLeft, Loader, AlertCircle } from 'lucide-react';
import FormInput from '../FormInput';
import { validateEmail, validatePassword, generateUserId } from '../../utils/validation';
import { FormErrors, User } from '../../types';
import { supabase } from '../../lib/supabase';
import { sr } from '../../locales/sr';
import TermsModal from './TermsModal';

interface SignUpPageProps {
  onSignUpSuccess: (user: User) => void;
  onBack: () => void;
}

export default function SignUpPage({ onSignUpSuccess, onBack }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
      case 'fullName':
        isValid = value.trim().length >= 2;
        error = isValid ? '' : 'Ime mora da ima najmanje 2 karaktera';
        break;
      case 'email':
        isValid = validateEmail(value);
        error = isValid ? '' : 'Unesite validnu email adresu';
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        isValid = passwordValidation.isValid;
        error = passwordValidation.message;
        break;
      case 'confirmPassword':
        isValid = value === formData.password && value.length > 0;
        error = isValid ? '' : 'Lozinke se ne poklapaju';
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

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Ime mora da ima najmanje 2 karaktera';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Unesite validnu email adresu';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Morate da se slažete sa Uslovima korišćenja';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'Ovaj email je već registrovan' });
        } else {
          setErrors({ submit: authError.message });
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrors({ submit: 'Greška pri kreiranju naloga. Pokušajte ponovno.' });
        setIsLoading(false);
        return;
      }

      const userId = generateUserId();
      const today = new Date().toISOString().split('T')[0];

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          user_id: userId,
          name: formData.fullName,
          email: formData.email.toLowerCase(),
          role: 'customer',
          token_balance: 50,
          total_tokens_earned: 50,
          total_spent: 0,
          member_since: today,
          email_verified: true,
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user profile:', userError);
        setErrors({ submit: 'Greška pri kreiranju naloga. Pokušajte ponovno.' });
        setIsLoading(false);
        return;
      }

      await supabase.from('transactions').insert({
        user_id: newUser.id,
        date: today,
        amount_spent: 0,
        tokens_earned: 50,
        timestamp: 'Welcome Bonus',
      });

      const user: User = {
        id: newUser.id,
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        tokenBalance: newUser.token_balance,
        totalTokensEarned: newUser.total_tokens_earned,
        totalSpent: Number(newUser.total_spent),
        memberSince: newUser.member_since,
        transactions: [],
      };

      setIsLoading(false);
      onSignUpSuccess(user);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: 'Došlo je do greške. Pokušajte ponovno.' });
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

        <div className="space-y-6">
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2e2a27' }} className="text-4xl font-bold mb-2">Pridruži se {sr.landing.nagrade}</h1>
            <p style={{ color: '#6f6a65' }} className="text-lg">Preuzmi 50 besplatnih {sr.common.getStarWord(50)} kada se registruješ!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
            {errors.submit && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-600 font-medium">
                {errors.submit}
              </div>
            )}

            <FormInput
              label="Ime i prezime"
              value={formData.fullName}
              onChange={(value) => updateField('fullName', value)}
              error={errors.fullName}
              isValid={validFields.has('fullName')}
              placeholder="Petar Petrović"
              required
            />

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
              placeholder="Najmanje 8 karaktera sa brojem"
              required
            />

            <FormInput
              label="Potvrdi lozinku"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              isValid={validFields.has('confirmPassword')}
              placeholder="Ponovi lozinku"
              required
            />

            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }));
                  if (errors.agreeToTerms) {
                    const newErrors = { ...errors };
                    delete newErrors.agreeToTerms;
                    setErrors(newErrors);
                  }
                }}
                className="w-4 h-4 mt-1.5 accent-black cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                Slažem se sa{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Uslovima korišćenja
                </button>
              </label>
            </div>

            {errors.agreeToTerms && (
              <p className="text-red-600 text-sm font-medium">{errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[50px] px-6 py-4 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2e2a27' }}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Pravi se nalog...
                </>
              ) : (
                'Napravi nalog'
              )}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#6f6a65' }}>
              Već imaš nalog?{' '}
              <button
                onClick={onBack}
                className="font-bold hover:opacity-70 transition-colors"
                style={{ color: '#2e2a27' }}
              >
                Prijavi se
              </button>
            </p>
          </div>
        </div>

        {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
      </div>
    </div>
  );
}
