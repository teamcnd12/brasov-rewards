import { useState } from 'react';
import { Briefcase, PlusCircle, MinusCircle, CheckCircle, List, User, LogOut } from 'lucide-react';
import { User as UserType, Reward, RedemptionCode } from '../../types';
import AddStamps from './AddStamps';
import RemoveTokens from './RemoveTokens';
import VerifyRedemption from './VerifyRedemption';
import StaffActivityLog from './StaffActivityLog';
import StaffProfilePage from './StaffProfilePage';

type StaffPage = 'add-tokens' | 'remove-tokens' | 'verify-codes' | 'activity' | 'profile';

interface StaffDashboardProps {
  staffUser: UserType;
  users: UserType[];
  rewards: Reward[];
  redemptionCodes: RedemptionCode[];
  onAddStamp: (userId: string, amountSpent: number) => Promise<{ success: boolean; message: string }>;
  onRemoveTokens: (userId: string, tokensToRemove: number, reason: string) => Promise<{ success: boolean; message: string }>;
  onMarkAsRedeemed: (code: string) => Promise<{ success: boolean; message: string }>;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  onLogOut: () => void;
  onUpdateUser: (updatedUser: UserType) => void;
  onRefreshCodes: () => void;
}

export default function StaffDashboard({
  staffUser,
  users,
  rewards,
  redemptionCodes,
  onAddStamp,
  onRemoveTokens,
  onMarkAsRedeemed,
  onChangePassword,
  onLogOut,
  onUpdateUser,
  onRefreshCodes,
}: StaffDashboardProps) {
  const [currentPage, setCurrentPage] = useState<StaffPage>('add-tokens');

  const navItems: { page: StaffPage; icon: typeof PlusCircle; label: string; onClick?: () => void }[] = [
    { page: 'add-tokens', icon: PlusCircle, label: 'Dodaj' },
    { page: 'remove-tokens', icon: MinusCircle, label: 'Oduzmi' },
    { page: 'verify-codes', icon: CheckCircle, label: 'Kodovi', onClick: onRefreshCodes },
    { page: 'activity', icon: List, label: 'Aktivnost' },
    { page: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Prekoputa Rewards</h1>
                <p className="text-xs sm:text-sm text-gray-300 truncate">Dobrodošli, {staffUser.name}</p>
              </div>
            </div>
            <button
              onClick={onLogOut}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors text-sm sm:text-base min-h-[44px] whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Odjavi se</span>
              <span className="sm:hidden">Odjava</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6 sm:py-6 pb-24">
        {currentPage === 'add-tokens' && (
          <AddStamps
            users={users}
            onAddStamp={async (userId, amount) => {
              const result = await onAddStamp(userId, amount);
              if (result.success) {
                await onUpdateUser(staffUser);
              }
              return result;
            }}
          />
        )}

        {currentPage === 'remove-tokens' && (
          <RemoveTokens
            users={users}
            onRemoveTokens={async (userId, tokensToRemove, reason) => {
              const result = await onRemoveTokens(userId, tokensToRemove, reason);
              if (result.success) {
                await onUpdateUser(staffUser);
              }
              return result;
            }}
          />
        )}

        {currentPage === 'verify-codes' && (
          <VerifyRedemption
            redemptionCodes={redemptionCodes}
            users={users}
            rewards={rewards}
            onMarkAsRedeemed={async (code) => {
              const result = await onMarkAsRedeemed(code);
              if (result.success) {
                await onUpdateUser(staffUser);
              }
              return result;
            }}
          />
        )}

        {currentPage === 'activity' && (
          <StaffActivityLog staffUser={staffUser} />
        )}

        {currentPage === 'profile' && (
          <StaffProfilePage
            staffUser={staffUser}
            onChangePassword={onChangePassword}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white z-40" style={{ boxShadow: '0 -4px 12px 0 rgba(0, 0, 0, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ page, icon: Icon, label, onClick }) => {
              const isActive = currentPage === page;
              const isRemove = page === 'remove-tokens';
              return (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    onClick?.();
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-300 min-h-[44px] ${
                    isActive ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                  }`}
                  style={{
                    color: isActive
                      ? isRemove ? '#dc2626' : '#1a1a1a'
                      : '#6b7280',
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
