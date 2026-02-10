import { useState } from 'react';
import { Copy, Check, Trash2, LogOut, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { User, FormErrors } from '../../types';
import FormInput from '../FormInput';
import { validateEmail } from '../../utils/validation';
import { sr } from '../../locales/sr';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
  onDeleteAccount: () => void;
  onLogOut: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export default function ProfilePage({
  user,
  onUpdateProfile,
  onDeleteAccount,
  onLogOut,
  onChangePassword,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user.name,
    email: user.email,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordMessage(null);

    if (!oldPassword) {
      setPasswordErrors({ oldPassword: 'Trenutna lozinka je obavezna' });
      return;
    }

    if (!newPassword) {
      setPasswordErrors({ newPassword: 'Nova lozinka je obavezna' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'Lozinka mora imati najmanje 8 karaktera' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Lozinke se ne poklapaju' });
      return;
    }

    const result = await onChangePassword(oldPassword, newPassword);
    if (result.success) {
      setPasswordMessage({ type: 'success', text: result.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage(null);
      }, 2000);
    } else {
      setPasswordMessage({ type: 'error', text: result.message });
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
    setPasswordMessage(null);
  };

  const initials = `${user.name.charAt(0)}${user.name.split(' ')[1]?.charAt(0) || ''}`.toUpperCase();
  const memberSinceDate = new Date(user.memberSince);
  const memberSinceText = memberSinceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateEditField = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    validateEditField(field, value);
  };

  const validateEditField = (field: string, value: string) => {
    let isValid = false;
    let error = '';

    switch (field) {
      case 'fullName':
        isValid = value.trim().length >= 2;
        error = isValid ? '' : 'Ime mora imati najmanje 2 karaktera';
        break;
      case 'email':
        isValid = validateEmail(value);
        error = isValid ? '' : 'Unesite validnu email adresu';
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

  const handleSaveChanges = () => {
    const newErrors: FormErrors = {};

    if (!editData.fullName.trim() || editData.fullName.trim().length < 2) {
      newErrors.fullName = 'Ime mora imati najmanje 2 karaktera';
    }

    if (!validateEmail(editData.email)) {
      newErrors.email = 'Unesite validnu email adresu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedUser: User = {
      ...user,
      name: editData.fullName,
      email: editData.email,
    };

    onUpdateProfile(updatedUser);
    setIsEditing(false);
    setMessage({ type: 'success', text: 'Profil ažuriran!' });
    setTimeout(() => setMessage(null), 3000);
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6" style={{ backgroundColor: '#faf9f6' }}>
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-2 border-green-300'
              : 'bg-red-50 text-red-600 border-2 border-red-300'
          }`}
        >
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-lg p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#2e2a27' }}>
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>

        <h1 className="text-3xl mb-1" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', color: '#2e2a27' }}>{user.name}</h1>
        <p style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Član od {memberSinceText}</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg mb-5" style={{ fontFamily: 'Poppins', fontWeight: '600', color: '#2e2a27' }}>Informacije o profilu</h2>

        {!isEditing ? (
          <div className="space-y-5">
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs mb-2" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Ime i prezime</p>
              <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem' }}>{user.name}</p>
            </div>

            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs mb-2" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Email adresa</p>
              <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem' }}>{user.email}</p>
            </div>

            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs mb-2" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Tvoj ID</p>
              <div className="flex items-center justify-between">
                <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>{user.userId}</p>
                <button
                  onClick={handleCopyId}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white rounded-lg transition-all duration-300"
                  style={{ backgroundColor: '#2e2a27' }}
                  aria-label="Kopuj ID"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <p className="text-xs mb-1" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Ukupno {sr.common.getStarWord(user.totalTokensEarned)} (sve)</p>
                <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem' }}>{user.totalTokensEarned}</p>
              </div>

              <div>
                <p className="text-xs mb-1" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Ukupno potrošeno</p>
                <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem' }}>{user.totalSpent.toLocaleString()} RSD</p>
              </div>

              <div>
                <p className="text-xs mb-1" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Trenutno stanje {sr.common.getStarWord(user.tokenBalance)} </p>
                <p style={{ color: '#2e2a27', fontFamily: 'Poppins', fontWeight: '500', fontSize: '1rem' }}>{user.tokenBalance} {sr.common.getStarWord(user.tokenBalance)}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full min-h-[40px] px-6 py-2 text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md mt-6"
              style={{ backgroundColor: '#2e2a27' }}
            >
              Izmeni profil
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormInput
              label="Ime i prezime"
              value={editData.fullName}
              onChange={(value) => updateEditField('fullName', value)}
              error={errors.fullName}
              isValid={validFields.has('fullName')}
              required
            />

            <FormInput
              label="Email adresa"
              type="email"
              value={editData.email}
              onChange={(value) => updateEditField('email', value)}
              error={errors.email}
              isValid={validFields.has('email')}
              required
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    fullName: user.name,
                    email: user.email,
                  });
                  setErrors({});
                  setValidFields(new Set());
                }}
                className="flex-1 min-h-[44px] px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Otkaži
              </button>

              <button
                onClick={handleSaveChanges}
                className="flex-1 min-h-[44px] px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#45a049] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sačuvaj izmene
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 space-y-3 shadow-sm">
        <h2 className="text-lg mb-4" style={{ fontFamily: 'Poppins', fontWeight: '600', color: '#2e2a27' }}>Podešavanja naloga</h2>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full min-h-[40px] px-6 py-2 flex items-center gap-3 text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#2e2a27' }}
        >
          <Lock className="w-5 h-5" />
          Promeni lozinku
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full min-h-[40px] px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
        >
          Obriši nalog
        </button>

        <button
          onClick={onLogOut}
          className="w-full min-h-[40px] px-6 py-2 flex items-center gap-3 rounded-lg font-semibold transition-all duration-300"
          style={{ backgroundColor: '#f3f4f6', color: '#6f6a65' }}
        >
          <LogOut className="w-5 h-5" />
          Odjavi se
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform animate-scale-in space-y-4">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>Promeni lozinku</h2>

            {passwordMessage && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {passwordMessage.text}
                </p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormInput
                label="Trenutna lozinka"
                type="password"
                value={oldPassword}
                onChange={(value) => setOldPassword(value)}
                error={passwordErrors.oldPassword}
              />

              <FormInput
                label="Nova lozinka (min 8 karaktera)"
                type="password"
                value={newPassword}
                onChange={(value) => setNewPassword(value)}
                error={passwordErrors.newPassword}
              />

              <FormInput
                label="Potvrdi novu lozinku"
                type="password"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value)}
                error={passwordErrors.confirmPassword}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 min-h-[44px] px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] px-6 py-3 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#2e2a27' }}
                >
                  Ažuriraj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform animate-scale-in space-y-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-2">Obriši nalog</h2>
              <p className="text-gray-700 text-sm">
                Da li ste sigurni? Ova akcija se ne može poništiti. Svi vaši tokeni i nagrade će biti izgubljeni.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 min-h-[44px] px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Otkaži
              </button>

              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="flex-1 min-h-[44px] px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Obriši nalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
