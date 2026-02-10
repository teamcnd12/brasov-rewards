import { useState } from 'react';
import { Reward, User, RedemptionCode } from '../../types';
import { sr } from '../../locales/sr';
import RedemptionModal from './RedemptionModal';
import RedemptionCodeDisplay from './RedemptionCodeDisplay';
import StarIcon from '../StarIcon';

interface RewardsPageProps {
  user: User;
  rewards: Reward[];
  onRedeem: (rewardId: number) => Promise<RedemptionCode | null>;
}

const rewardImages: Record<string, string> = {
  'unsplash-pastry': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/coffee_tpyyxf.jpg',
  'unsplash-coffee': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/dessert_jpg2hj.jpg',
  'unsplash-latte': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/cocktail_nu9i8z.jpg',
  'unsplash-sandwich': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612790/salto_akhesb.png',
};

export default function RewardsPage({ user, rewards, onRedeem }: RewardsPageProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redemptionCode, setRedemptionCode] = useState<RedemptionCode | null>(null);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
  };

  const handleConfirmRedemption = async () => {
    if (selectedReward) {
      const code = await onRedeem(selectedReward.id);
      if (code) {
        setRedemptionCode(code);
        setRedeemedReward(selectedReward);
      }
      setSelectedReward(null);
    }
  };

  const handleCloseCode = () => {
    setRedemptionCode(null);
    setRedeemedReward(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 mt-16" style={{ backgroundColor: '#faf9f6' }}>
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '700', color: '#2e2a27' }}>Dostupne nagrade</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewards.map((reward) => {
            const hasEnoughTokens = user.tokenBalance >= reward.tokenCost;
            const soliceNeeded = reward.tokenCost - user.tokenBalance;

            return (
              <div
                key={reward.id}
                className="bg-white rounded-lg overflow-hidden border-0 transition-all duration-300 transform hover:-translate-y-1"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '8px' }}
              >
                <div className="relative">
                  <img
                    src={rewardImages[reward.imageUrl]}
                    alt={reward.name}
                    className={`w-full h-48 object-cover ${!hasEnoughTokens ? 'opacity-60' : ''}`}
                  />
                  <div className="absolute top-3 right-3">
                    {hasEnoughTokens ? (
                      <span className="px-3 py-1.5 rounded-md font-semibold text-xs" style={{ fontFamily: 'Poppins', backgroundColor: '#e8e3de', color: '#2e2a27' }}>
                        Dostupno
                      </span>
                    ) : (
                      <span className="bg-gray-400 text-white px-3 py-1.5 rounded-md font-semibold text-xs" style={{ fontFamily: 'Poppins' }}>
                        Još {soliceNeeded} {sr.common.getStarWord(soliceNeeded)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div>
                    <h3 className="text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', color: '#2e2a27' }}>{reward.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5">
                        <StarIcon className="w-full h-full" style={{ color: '#d4af37' }} />
                      </div>
                      <span className="text-base font-medium" style={{ color: '#6f6a65', fontFamily: 'Poppins', lineHeight: '1' }}>{reward.tokenCost}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!hasEnoughTokens}
                    className={`w-full min-h-[40px] px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      hasEnoughTokens
                        ? 'text-white hover:opacity-90'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    style={hasEnoughTokens ? { backgroundColor: '#2e2a27', fontFamily: 'Poppins', fontSize: '14px' } : { fontFamily: 'Poppins', fontSize: '14px' }}
                  >
                    {hasEnoughTokens ? 'Preuzmi' : 'Nedostupno'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedReward && (
        <RedemptionModal
          reward={selectedReward}
          onConfirm={handleConfirmRedemption}
          onCancel={() => setSelectedReward(null)}
        />
      )}

      {redemptionCode && redeemedReward && (
        <RedemptionCodeDisplay
          redemptionCode={redemptionCode}
          reward={redeemedReward}
          onClose={handleCloseCode}
        />
      )}
    </>
  );
}
