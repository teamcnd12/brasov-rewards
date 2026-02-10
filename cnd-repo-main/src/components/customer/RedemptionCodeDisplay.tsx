import { Copy, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RedemptionCode, Reward } from '../../types';
import { sr } from '../../locales/sr';

interface RedemptionCodeDisplayProps {
  redemptionCode: RedemptionCode;
  reward: Reward;
  onClose: () => void;
}

export default function RedemptionCodeDisplay({ redemptionCode, reward, onClose }: RedemptionCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = redemptionCode.expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Isteklo');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [redemptionCode.expiresAt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(redemptionCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in" style={{ backgroundColor: '#faf9f6' }}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 transform animate-scale-in" style={{ borderRadius: '8px' }}>
        <button
          onClick={onClose}
          className="flex items-center gap-2 transition-colors mb-8 min-h-[44px] font-semibold"
          style={{ color: '#6f6a65', fontFamily: 'Poppins' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Nazad na nagrade</span>
        </button>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
            <Check className="w-12 h-12 text-white" />
          </div>

          <div>
            <h2 className="text-3xl mb-2" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '700', color: '#2e2a27' }}>Preuzimanje uspešno!</h2>
            <p className="text-base" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>{reward.name}</p>
          </div>

          <div className="rounded-lg p-6 space-y-4" style={{ backgroundColor: '#faf9f6' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Vaš kod</p>

            <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #ebe7e2' }}>
              <p className="text-5xl font-mono font-bold tracking-wider" style={{ color: '#2e2a27', letterSpacing: '0.1em' }}>
                {redemptionCode.code}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full min-h-[40px] flex items-center justify-center gap-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#2e2a27', fontFamily: 'Poppins', fontSize: '14px' }}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Kopirano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Kopuj kod</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: '#d9d9d9' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>Preostalo vreme</p>
            <p className="text-3xl font-bold font-mono" style={{ color: '#6f6a65' }}>{timeRemaining}</p>
          </div>

          <p className="text-sm font-medium" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>
            Pokažite ovaj kod zaposlenom da preuzmete nagradu.
          </p>
        </div>
      </div>
    </div>
  );
}
