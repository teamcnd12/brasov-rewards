import { useState } from 'react';
import { UserCheck, CheckCircle, XCircle, AlertTriangle, MinusCircle } from 'lucide-react';
import { User } from '../../types';

interface RemoveTokensProps {
  users: User[];
  onRemoveTokens: (userId: string, tokensToRemove: number, reason: string) => Promise<{ success: boolean; message: string }>;
}

export default function RemoveTokens({ users, onRemoveTokens }: RemoveTokensProps) {
  const [userId, setUserId] = useState('');
  const [tokensToRemove, setTokensToRemove] = useState('');
  const [reason, setReason] = useState('');
  const [lookedUpUser, setLookedUpUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentBalance = lookedUpUser?.tokenBalance || 0;
  const removeAmount = Number(tokensToRemove) || 0;
  const newBalance = Math.max(currentBalance - removeAmount, 0);
  const isOverBalance = removeAmount > currentBalance;

  const handleLookup = () => {
    setMessage(null);
    const user = users.find(u => u.userId.toLowerCase() === userId.toLowerCase());

    if (user) {
      setLookedUpUser(user);
    } else {
      setMessage({ type: 'error', text: 'Korisnik nije pronađen. Proverite ID i pokušajte ponovo.' });
      setLookedUpUser(null);
    }
  };

  const handleRemove = async () => {
    if (!tokensToRemove || removeAmount <= 0) {
      setMessage({ type: 'error', text: 'Unesite validan broj tokena veći od 0.' });
      return;
    }

    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Morate uneti razlog za oduzimanje tokena.' });
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    if (lookedUpUser) {
      const result = await onRemoveTokens(lookedUpUser.userId, removeAmount, reason.trim());
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      setShowConfirm(false);

      if (result.success) {
        const updatedUser = users.find(u => u.userId === lookedUpUser.userId);
        if (updatedUser) {
          setLookedUpUser(updatedUser);
          setTokensToRemove('');
          setReason('');
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 border-2 border-red-400">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <MinusCircle className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-red-700">Oduzmi tokene</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="removeUserId" className="block text-sm font-semibold text-gray-700 mb-2">
            Unesi korisnički ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              id="removeUserId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="npr. USER123"
              className="flex-1 min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors font-mono text-base"
            />
            <button
              onClick={handleLookup}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg text-base"
            >
              Pronađi
            </button>
          </div>
        </div>

        {lookedUpUser && (
          <div className="bg-red-50 rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in border-2 border-red-300">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Oduzimate tokene od</p>
              <p className="text-xl sm:text-2xl font-bold text-black break-words">{lookedUpUser.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 font-mono break-all">{lookedUpUser.userId}</p>
              <p className="text-base sm:text-lg text-gray-700 mt-2">Stanje: {currentBalance} / 800 tokena</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentBalance / 800) * 100}%` }}
                />
              </div>
            </div>

            <div className="border-t-2 border-red-200 pt-4">
              <label htmlFor="removeAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                Broj tokena za oduzimanje
              </label>
              <input
                id="removeAmount"
                type="number"
                value={tokensToRemove}
                onChange={(e) => {
                  setTokensToRemove(e.target.value);
                  setShowConfirm(false);
                }}
                placeholder="Unesi broj tokena"
                min="1"
                max={currentBalance}
                step="1"
                className="w-full min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-base"
              />

              {tokensToRemove && removeAmount > 0 && (
                <div className={`mt-3 flex items-center gap-2 p-3 bg-white rounded-lg border-2 ${isOverBalance ? 'border-red-500' : 'border-amber-500'}`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isOverBalance ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    {isOverBalance ? (
                      <p className="text-xs sm:text-sm font-semibold text-red-600">
                        Korisnik ima samo {currentBalance} tokena
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-amber-600">
                        {currentBalance} - {removeAmount} = <span className="text-base sm:text-lg">{newBalance} tokena</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t-2 border-red-200 pt-4">
              <label htmlFor="removeReason" className="block text-sm font-semibold text-gray-700 mb-2">
                Razlog za oduzimanje *
              </label>
              <input
                id="removeReason"
                type="text"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setShowConfirm(false);
                }}
                placeholder="npr. Korekcija, greška u unosu..."
                className="w-full min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-base"
              />
            </div>

            {showConfirm && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-700">Potvrdite oduzimanje</p>
                </div>
                <p className="text-sm text-red-600">
                  Oduzimate <span className="font-bold">{removeAmount} tokena</span> od <span className="font-bold">{lookedUpUser.name}</span>.
                  Novo stanje: <span className="font-bold">{newBalance} tokena</span>.
                </p>
              </div>
            )}

            <button
              onClick={handleRemove}
              disabled={!tokensToRemove || removeAmount <= 0 || isOverBalance || !reason.trim()}
              className={`w-full min-h-[44px] px-6 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                showConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {showConfirm ? 'Da, oduzmi tokene' : 'Oduzmi tokene'}
            </button>
          </div>
        )}

        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg animate-fade-in ${
              message.type === 'success'
                ? 'bg-[#4CAF50]/10 text-[#4CAF50] border-2 border-[#4CAF50]'
                : 'bg-red-50 text-red-600 border-2 border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <p className="font-semibold">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
