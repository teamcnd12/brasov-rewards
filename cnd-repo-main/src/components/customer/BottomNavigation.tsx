import { Home, Gift, User } from 'lucide-react';
import { CustomerPage } from '../../types';

interface BottomNavigationProps {
  currentPage: CustomerPage;
  onPageChange: (page: CustomerPage) => void;
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-40" style={{ boxShadow: '0 -4px 12px 0 rgba(0, 0, 0, 0.08)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onPageChange('home')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-300 min-h-[44px] ${
              currentPage === 'home'
                ? 'opacity-100'
                : 'opacity-50 hover:opacity-70'
            }`}
            style={currentPage === 'home' ? { color: '#2e2a27' } : { color: '#6f6a65' }}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Početna</span>
          </button>

          <button
            onClick={() => onPageChange('rewards')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-300 min-h-[44px] ${
              currentPage === 'rewards'
                ? 'opacity-100'
                : 'opacity-50 hover:opacity-70'
            }`}
            style={currentPage === 'rewards' ? { color: '#2e2a27' } : { color: '#6f6a65' }}
          >
            <Gift className="w-6 h-6" />
            <span className="text-xs font-semibold">Nagrade</span>
          </button>

          <button
            onClick={() => onPageChange('profile')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-300 min-h-[44px] ${
              currentPage === 'profile'
                ? 'opacity-100'
                : 'opacity-50 hover:opacity-70'
            }`}
            style={currentPage === 'profile' ? { color: '#2e2a27' } : { color: '#6f6a65' }}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-semibold">Profil</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
