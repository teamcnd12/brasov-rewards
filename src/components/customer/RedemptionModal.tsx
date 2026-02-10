import { X } from 'lucide-react';
import { Reward } from '../../types';
import { sr } from '../../locales/sr';
import StarIcon from '../StarIcon';

interface RedemptionModalProps {
  reward: Reward;
  onConfirm: () => void;
  onCancel: () => void;
}

const rewardImages: Record<string, string> = {
  'unsplash-pastry': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/coffee_tpyyxf.jpg',
  'unsplash-coffee': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/dessert_jpg2hj.jpg',
  'unsplash-latte': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612789/cocktail_nu9i8z.jpg',
  'unsplash-sandwich': 'https://res.cloudinary.com/djb0hrtqm/image/upload/v1768612790/salto_akhesb.png',
};

export default function RedemptionModal({ reward, onConfirm, onCancel }: RedemptionModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in" style={{ backgroundColor: 'rgba(46, 42, 39, 0.35)' }}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform animate-scale-in" style={{ borderRadius: '8px' }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '700', color: '#2e2a27' }}>Potvrdi preuzimanje</h2>
          <button
            onClick={onCancel}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors hover:opacity-60"
            style={{ color: '#6f6a65' }}
            aria-label="Zatvori"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <img
          src={rewardImages[reward.imageUrl]}
          alt={reward.name}
          className="w-full h-48 object-cover rounded-lg mb-5"
        />

        <div className="space-y-5">
          <div>
            <h3 className="text-lg" style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', color: '#2e2a27' }}>{reward.name}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4">
                <StarIcon className="w-full h-full" style={{ color: '#d4af37' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#6f6a65', fontFamily: 'Poppins' }}>{reward.tokenCost}</span>
            </div>
          </div>

          <p style={{ color: '#6f6a65', fontFamily: 'Poppins', fontSize: '14px', lineHeight: '1.5' }}>
            Sigurni ste da želite da preuzmete ovu nagradu? {reward.tokenCost} {sr.common.getStarWord(reward.tokenCost)} će biti korišćeno.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 min-h-[40px] px-6 py-2 border rounded-lg font-semibold hover:opacity-70 transition-all duration-200"
              style={{ borderColor: '#d4cfc9', color: '#2e2a27', fontFamily: 'Poppins', fontSize: '14px' }}
            >
              Otkaži
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 min-h-[40px] px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: '#2e2a27', fontFamily: 'Poppins', fontSize: '14px' }}
            >
              Potvrdi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
