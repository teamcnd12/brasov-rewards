import { Copy, Check, ShoppingBag, Sparkles, HelpCircle, X, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { User, Reward } from '../../types';
import { sr } from '../../locales/sr';
import StarIcon from '../StarIcon';

const rewardImages: Record<string, string> = {
  'unsplash-pastry': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/coffee_tpyyxf.jpg',
  'unsplash-coffee': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/dessert_jpg2hj.jpg',
  'unsplash-latte': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/cocktail_nu9i8z.jpg',
  'unsplash-sandwich': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612790/salto_akhesb.png',
};

interface CustomerDashboardProps {
  user: User;
  rewards: Reward[];
  onGoToRewards: () => void;
}

export default function CustomerDashboard({ user, rewards, onGoToRewards }: CustomerDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const firstName = user.name.split(' ')[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(user.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToNext = useCallback(() => {
    if (rewards.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCarouselIndex(prev => (prev + 1) % rewards.length);
      setIsTransitioning(false);
    }, 300);
  }, [rewards.length]);

  useEffect(() => {
    if (rewards.length <= 1) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [goToNext, rewards.length]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-24 space-y-6" style={{ backgroundColor: '#faf9f6' }}>
      <div>
        <p className="text-sm" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Dobrodošli nazad,</p>
        <h1 className="text-3xl" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '700', color: '#2e2a27' }}>
          {firstName}
        </h1>
      </div>

      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2e2a27 0%, #4a4340 40%, #6f6a65 100%)',
          boxShadow: '0 8px 32px rgba(46, 42, 39, 0.3)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <button
          onClick={() => setShowHowToEarn(true)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          aria-label="Kako zaraditi zvezdice"
        >
          <HelpCircle className="w-5 h-5 text-white/70" />
        </button>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <StarIcon className="w-full h-full" style={{ filter: 'brightness(1.8) saturate(0.5)' }} />
            </div>
            <span
              className="text-5xl font-bold text-white"
              style={{ fontFamily: 'Cormorant Garamond', lineHeight: '1' }}
            >
              {(user.tokenBalance || 0)}
            </span>
          </div>

          <p className="text-white/60 text-sm" style={{ fontFamily: 'Poppins' }}>
            {sr.common.getStarWord((user.tokenBalance || 0))} dostupno
          </p>

          <div
            className="w-full h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
          />

          <p className="text-white/50 text-xs" style={{ fontFamily: 'Poppins' }}>
            Ukupno zaradjeno: {(user.totalTokensEarned || 0)} {sr.common.getStarWord((user.totalTokensEarned || 0))}
          </p>

          <div
            className="flex items-center justify-between rounded-lg px-4 py-3 mt-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Poppins' }}>
                Tvoj ID
              </p>
              <p className="text-white font-mono text-lg font-semibold tracking-wide">{user.userId}</p>
            </div>
            <button
              onClick={handleCopy}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
              aria-label="Kopiraj ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/50" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-xs font-medium -mt-2" style={{ fontFamily: 'Poppins' }}>
              Kopirano!
            </p>
          )}
        </div>
      </div>

      {rewards.length > 0 && (
        <div className="space-y-3">
          <div
            className="rounded-xl p-[2px] transition-all duration-200 hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #2e2a27 0%, #4a4340 40%, #6f6a65 100%)' }}
          >
            <button
              onClick={onGoToRewards}
              className="w-full flex items-center justify-between px-5 py-3 rounded-[10px]"
              style={{ backgroundColor: '#faf9f6' }}
            >
              <span className="text-sm font-semibold" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                Pogledaj nagrade
              </span>
              <ChevronRight className="w-5 h-5" style={{ color: '#4a4340' }} />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {rewards.map((reward, i) => {
              const hasEnough = (user.tokenBalance || 0) >= reward.tokenCost;
              const isActive = i === carouselIndex;
              return (
                <div
                  key={reward.id}
                  className="w-full transition-all duration-300"
                  style={{
                    opacity: isActive ? (isTransitioning ? 0 : 1) : 0,
                    position: isActive ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={rewardImages[reward.imageUrl]}
                      alt={reward.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${!hasEnough ? 'opacity-50' : ''}`}
                      style={{ transform: isActive && !isTransitioning ? 'scale(1)' : 'scale(1.05)' }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                      <p className="text-white font-semibold text-base" style={{ fontFamily: 'Poppins' }}>
                        {reward.name}
                      </p>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <div className="w-4 h-4">
                          <StarIcon className="w-full h-full" style={{ filter: 'brightness(1.8) saturate(0.5)' }} />
                        </div>
                        <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Poppins' }}>
                          {reward.tokenCost}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-center gap-1.5 py-3">
              {rewards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCarouselIndex(i);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: carouselIndex === i ? '16px' : '6px',
                    height: '6px',
                    backgroundColor: carouselIndex === i ? '#2e2a27' : '#d4cfc9',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-divider" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 className="text-xl mb-4" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', color: '#2e2a27' }}>
          Poslednje posete
        </h2>

        {(user.transactions || []).length === 0 ? (
          <p className="text-center py-6" style={{ color: '#6f6a65', fontFamily: 'Poppins', fontSize: '14px' }}>
            Nema dostupnih kupovina
          </p>
        ) : (
          <div className="space-y-1">
            {(user.transactions || []).slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f3f0' }}>
                    <StarIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                      {transaction.amountSpent} RSD
                    </p>
                    <p className="text-xs" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                    +{transaction.tokensEarned}
                  </p>
                  <p className="text-xs" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
                    {transaction.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showHowToEarn && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in" onClick={() => setShowHowToEarn(false)}>
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 space-y-5 transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '700', color: '#2e2a27' }}>
                Kako zaradjujes {sr.common.solice}?
              </h3>
              <button
                onClick={() => setShowHowToEarn(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              >
                <X className="w-5 h-5" style={{ color: '#6f6a65' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#faf9f6' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2e2a27' }}>
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                    Kupovina
                  </p>
                  <p className="text-sm" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
                    Kupis neki od nasih proizvoda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#faf9f6' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2e2a27' }}>
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                    Pokazi ID
                  </p>
                  <p className="text-sm" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
                    Procitaj zaposlenom svoj ID
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#faf9f6' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2e2a27' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#2e2a27', fontFamily: 'Poppins' }}>
                    Zaradi {sr.common.solice}
                  </p>
                  <p className="text-sm" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
                    100 RSD = 10 zvezdica
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToEarn(false)}
              className="w-full min-h-[44px] py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#2e2a27', fontFamily: 'Poppins', fontSize: '14px' }}
            >
              Razumem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
