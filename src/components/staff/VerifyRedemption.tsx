import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { RedemptionCode, User, Reward } from '../../types';
import { supabase } from '../../lib/supabase';

interface VerifyRedemptionProps {
  redemptionCodes: RedemptionCode[];
  users: User[];
  rewards: Reward[];
  onMarkAsRedeemed: (code: string) => Promise<{ success: boolean; message: string }>;
}

export default function VerifyRedemption({
  redemptionCodes,
  users,
  rewards,
  onMarkAsRedeemed,
}: VerifyRedemptionProps) {
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState<{
    code: RedemptionCode;
    user: User;
    reward: Reward;
  } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setMessage(null);
    setVerifiedCode(null);
    setLoading(true);

    try {
      const { data: dbCode } = await supabase
        .from('redemption_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (!dbCode) {
        setMessage({ type: 'error', text: 'Nevažeći kod. Proverite i pokušajte ponovo.' });
        setLoading(false);
        return;
      }

      if (dbCode.redeemed) {
        setMessage({ type: 'error', text: 'Ovaj kod je već iskorišćen.' });
        setLoading(false);
        return;
      }

      const now = new Date();
      const expiresAt = new Date(dbCode.expires_at);
      if (expiresAt < now) {
        setMessage({ type: 'error', text: 'Ovaj kod je istekao.' });
        setLoading(false);
        return;
      }

      const user = users.find(u => u.id === dbCode.user_id);
      const reward = rewards.find(r => r.id === dbCode.reward_id);

      if (user && reward) {
        setVerifiedCode({
          code: {
            code: dbCode.code,
            userId: dbCode.user_id,
            rewardId: dbCode.reward_id,
            expiresAt,
            redeemed: dbCode.redeemed,
            createdAt: new Date(dbCode.created_at),
          },
          user,
          reward,
        });
      } else {
        setMessage({ type: 'error', text: 'Greška pri učitavanju detalja koda.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Greška pri pronalaženju koda.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRedeemed = async () => {
    if (verifiedCode) {
      const result = await onMarkAsRedeemed(verifiedCode.code.code);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });

      if (result.success) {
        setVerifiedCode(null);
        setCode('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 border-2 border-black">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-black">Verifikuj iskorišćenje</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
            Unesi 6-cifreni kod
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 min-h-[44px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4CAF50] focus:outline-none transition-colors font-mono text-lg sm:text-xl text-center tracking-widest"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#45a049] transition-all duration-300 shadow-md hover:shadow-lg text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Učitavање...' : 'Verifikuj'}
            </button>
          </div>
        </div>

        {verifiedCode && (
          <div className="bg-[#4CAF50]/10 border-2 border-[#4CAF50] rounded-lg p-4 sm:p-5 space-y-4 animate-scale-in">
            <div className="flex items-center gap-2 text-[#4CAF50] mb-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <p className="text-base sm:text-lg font-bold">Validan kod</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Kupac</p>
                <p className="text-lg sm:text-xl font-bold text-black break-words">{verifiedCode.user.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 font-mono break-all">{verifiedCode.user.userId}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Nagrada</p>
                <p className="text-lg sm:text-xl font-bold text-black break-words">{verifiedCode.reward.name}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Ističe</p>
                <p className="text-base sm:text-lg font-semibold text-gray-700">
                  {verifiedCode.code.expiresAt.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleMarkAsRedeemed}
              className="w-full min-h-[44px] px-6 py-3 sm:py-4 bg-[#4CAF50] text-white rounded-lg text-base sm:text-lg font-bold hover:bg-[#45a049] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Označi kao iskorišćeno
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
