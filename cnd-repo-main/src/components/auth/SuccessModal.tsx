import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessModalProps {
  title: string;
  message: string;
  userId: string;
  onClose: () => void;
}

export default function SuccessModal({ title, message, userId, onClose }: SuccessModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center transform animate-scale-in space-y-6 border-2 border-black">
        <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
          <p className="text-gray-700">Osvojili ste 50 tokena!</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border-2 border-black">
          <p className="text-sm text-gray-600 mb-1">Vaš ID</p>
          <p className="text-2xl font-mono font-bold text-black">{userId}</p>
        </div>

        <p className="text-sm text-gray-600">
          Preusmeravanje za 3.5 sekundi...
        </p>
      </div>
    </div>
  );
}
