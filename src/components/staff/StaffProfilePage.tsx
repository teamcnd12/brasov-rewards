import { useState } from 'react';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../../types';
import FormInput from '../FormInput';

interface StaffProfilePageProps {
  staffUser: User;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export default function StaffProfilePage({ staffUser, onChangePassword }: StaffProfilePageProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    if (!oldPassword) {
      setErrors({ oldPassword: 'Trenutna lozinka je obavezna' });
      return;
    }

    if (!newPassword) {
      setErrors({ newPassword: 'Nova lozinka je obavezna' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Lozinka mora imati najmanje 8 karaktera' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Lozinke se ne poklapaju' });
      return;
    }

    const result = await onChangePassword(oldPassword, newPassword);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const memberSinceDate = new Date(staffUser.memberSince).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-black text-white rounded-lg p-4 sm:p-6 border-2 border-black">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Informacije o osoblju</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-300">Ime i prezime</p>
              <p className="text-base sm:text-lg font-semibold break-words">{staffUser.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-300">Email</p>
              <p className="text-base sm:text-lg font-semibold break-all">{staffUser.email}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-300">Telefon</p>
              <p className="text-base sm:text-lg font-semibold">{staffUser.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 border-2 border-black rounded-lg p-4 min-h-[80px] flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-gray-600">Uloga</p>
            <p className="text-base sm:text-lg font-semibold text-black">Osoblje</p>
          </div>

          <div className="bg-gray-50 border-2 border-black rounded-lg p-4 min-h-[80px] flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-gray-600">Član od</p>
            <p className="text-base sm:text-lg font-semibold text-black">{memberSinceDate}</p>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors min-h-[44px]"
          >
            <Key className="w-5 h-5 flex-shrink-0" />
            Promeni lozinku
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-h-[100px] flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-600">Tokeni dodati</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{staffUser.tokensAddedToday || 0}</p>
        </div>
        <div className="bg-gray-50 border-2 border-black rounded-lg p-4 min-h-[100px] flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-600">Verifikovana</p>
          <p className="text-2xl sm:text-3xl font-bold text-black">{staffUser.redemptionsVerifiedToday || 0}</p>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-4 sm:p-6 border-2 border-black max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-4">Promeni lozinku</h3>

            {message && (
              <div
                className={`flex items-start gap-3 mb-4 p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {message.text}
                </p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormInput
                label="Trenutna lozinka"
                type="password"
                value={oldPassword}
                onChange={(value) => setOldPassword(value)}
                error={errors.oldPassword}
              />

              <FormInput
                label="Nova lozinka (min 8 karaktera)"
                type="password"
                value={newPassword}
                onChange={(value) => setNewPassword(value)}
                error={errors.newPassword}
              />

              <FormInput
                label="Potvrdi novu lozinku"
                type="password"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value)}
                error={errors.confirmPassword}
              />

              <div className="flex gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrors({});
                    setMessage(null);
                  }}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors min-h-[44px] text-sm sm:text-base"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 sm:py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors min-h-[44px] text-sm sm:text-base"
                >
                  Ažuriraj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
