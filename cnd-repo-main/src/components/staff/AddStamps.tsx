import { useState } from 'react';
import { UserCheck, CheckCircle, XCircle, Calculator } from 'lucide-react';
import { User } from '../../types';

interface AddStampsProps {
  users: User[];
  onAddStamp: (userId: string, amountSpent: number) => Promise<{ success: boolean; message: string }>;
}

export default function AddStamps({ users, onAddStamp }: AddStampsProps) {
  const [userId, setUserId] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [lookedUpUser, setLookedUpUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentBalance = lookedUpUser?.tokenBalance || 0;
  const rawTokens = Math.floor(Number(amountSpent) / 10);
  const tokensToEarn = Math.min(rawTokens, Math.max(800 - currentBalance, 0));
  const isCapped = rawTokens > tokensToEarn;

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

  const handleAddTokens = async () => {
    if (!amountSpent || Number(amountSpent) <= 0) {
      setMessage({ type: 'error', text: 'Unesite validan iznos veći od 0.' });
      return;
    }

    if (lookedUpUser) {
      const result = await onAddStamp(lookedUpUser.userId, Number(amountSpent));
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });

      if (result.success) {
        const updatedUser = users.find(u => u.userId === lookedUpUser.userId);
        if (updatedUser) {
          setLookedUpUser(updatedUser);
          setAmountSpent('');
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
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 border-2 border-black">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-black">Dodaj tokene</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 mb-2">
            Unesi korisnički ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="npr. USER123"
              className="flex-1 min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-mono text-base"
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
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in border-2 border-black">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Dodaješ tokene za</p>
              <p className="text-xl sm:text-2xl font-bold text-black break-words">{lookedUpUser.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 font-mono break-all">{lookedUpUser.userId}</p>
              <p className="text-base sm:text-lg text-gray-700 mt-2">Stanje: {lookedUpUser.tokenBalance} / 800 tokena</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(lookedUpUser.tokenBalance / 800) * 100}%` }}
                />
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                Iznos potrošen (RSD)
              </label>
              <input
                id="amount"
                type="number"
                value={amountSpent}
                onChange={(e) => setAmountSpent(e.target.value)}
                placeholder="Unesi iznos"
                min="0"
                step="1"
                className="w-full min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors text-base"
              />

              {amountSpent && Number(amountSpent) > 0 && (
                <div className={`mt-3 flex items-center gap-2 p-3 bg-white rounded-lg border-2 ${isCapped ? 'border-amber-500' : 'border-[#4CAF50]'}`}>
                  <Calculator className={`w-5 h-5 flex-shrink-0 ${isCapped ? 'text-amber-500' : 'text-[#4CAF50]'}`} />
                  <div>
                    <p className={`text-xs sm:text-sm font-semibold ${isCapped ? 'text-amber-600' : 'text-[#4CAF50]'}`}>
                      {amountSpent} RSD = <span className="text-base sm:text-lg">{tokensToEarn} tokena</span>
                    </p>
                    {isCapped && (
                      <p className="text-xs text-amber-500 mt-0.5">
                        Maksimum 800 tokena po nalogu (ograničeno sa {rawTokens})
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAddTokens}
              disabled={!amountSpent || Number(amountSpent) <= 0}
              className="w-full min-h-[44px] px-6 py-3 sm:py-4 bg-black text-white rounded-lg text-base sm:text-lg font-bold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dodaj tokene
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
