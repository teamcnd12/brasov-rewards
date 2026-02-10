import { useState } from 'react';
import { Shield, Users, Activity, LogOut } from 'lucide-react';
import StaffManagement from './StaffManagement';
import StaffActivityViewer from './StaffActivityViewer';
import { sr } from '../../locales/sr';

type AdminPage = 'staff' | 'activity';

interface AdminDashboardProps {
  onLogOut: () => void;
}

export default function AdminDashboard({ onLogOut }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('staff');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{sr.admin.panel}</h1>
                <p className="text-xs sm:text-sm text-gray-300">{sr.admin.upravljanje_osobljem}</p>
              </div>
            </div>
            <button
              onClick={onLogOut}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors text-sm sm:text-base min-h-[44px] whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{sr.admin.zatvori}</span>
              <span className="sm:hidden">{sr.common.izlaz}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6 sm:py-6 pb-24 sm:pb-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-black">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentPage('staff')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors min-h-[44px] text-sm sm:text-base ${
                currentPage === 'staff'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{sr.admin.osoblje}</span>
            </button>
            <button
              onClick={() => setCurrentPage('activity')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors min-h-[44px] text-sm sm:text-base ${
                currentPage === 'activity'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{sr.admin.aktivnost}</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {currentPage === 'staff' && <StaffManagement />}
            {currentPage === 'activity' && <StaffActivityViewer />}
          </div>
        </div>
      </div>
    </div>
  );
}
