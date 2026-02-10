import { useState, useEffect } from 'react';
import WelcomePage from './components/auth/WelcomePage';
import SignUpPage from './components/auth/SignUpPage';
import LogInPage from './components/auth/LogInPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import SuccessModal from './components/auth/SuccessModal';
import CustomerDashboard from './components/customer/CustomerDashboard';
import RewardsPage from './components/customer/RewardsPage';
import ProfilePage from './components/customer/ProfilePage';
import BottomNavigation from './components/customer/BottomNavigation';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminLoginGate from './components/admin/AdminLoginGate';
import AdminDashboard from './components/admin/AdminDashboard';
import { ViewMode, CustomerPage, User, RedemptionCode } from './types';

import { supabase } from './lib/supabase';
import { useRewards, useAllUsers, useRedemptionCodes } from './hooks/useSupabaseData';

type AuthPage = 'welcome' | 'signup' | 'login' | 'forgot-password' | 'reset-password' | 'admin-login' | 'admin';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function App() {
  const [authPage, setAuthPage] = useState<AuthPage>('welcome');
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [customerPage, setCustomerPage] = useState<CustomerPage>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newUserData, setNewUserData] = useState<{ userId: string; name: string } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { rewards } = useRewards();
  const { users, refetch: refetchUsers } = useAllUsers();
  const { redemptionCodes, refetch: refetchCodes } = useRedemptionCodes();

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          if (user) {
            const { data: transactions } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            const { data: activityLog } = user.role === 'staff'
              ? await supabase
                  .from('activity_log')
                  .select('*')
                  .eq('staff_id', user.id)
                  .order('created_at', { ascending: false })
              : { data: [] };

            const userObj: User = {
              id: user.id,
              userId: user.user_id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              tokenBalance: user.token_balance || 0,
              totalTokensEarned: user.total_tokens_earned || 0,
              totalSpent: Number(user.total_spent || 0),
              memberSince: user.member_since,
              createdBy: user.created_by,
              tokensAddedToday: user.tokens_added_today || 0,
              redemptionsVerifiedToday: user.redemptions_verified_today || 0,
              transactions: transactions?.map(t => ({
                id: t.id,
                date: t.date,
                amountSpent: Number(t.amount_spent),
                tokensEarned: t.tokens_earned,
                timestamp: t.timestamp,
                addedBy: t.added_by,
                staffId: t.staff_id,
              })) || [],
              activityLog: activityLog?.map(a => ({
                id: a.id,
                date: a.date,
                time: a.time,
                action: a.action,
                customerId: a.customer_id,
                customerName: a.customer_name,
                details: a.details,
              })) || [],
            };

            setCurrentUser(userObj);
            if (user.role === 'staff') {
              setViewMode('staff');
            } else {
              setViewMode('customer');
              setCustomerPage('home');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuthSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setAuthPage('welcome');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

useEffect(() => {
  // Check if URL contains password reset hash
  const hash = window.location.hash;
  
  if (hash.includes('type=recovery') || hash.includes('type=reset')) {
    setAuthPage('reset-password');
  }
}, []);

  useEffect(() => {
    if (currentUser) {
      refreshUserData();
    }
  }, [currentUser?.userId]);

  const refreshUserData = async () => {
    if (!currentUser) return;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (userData) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      const { data: activityLog } = userData.role === 'staff'
        ? await supabase
            .from('activity_log')
            .select('*')
            .eq('staff_id', userData.id)
            .order('created_at', { ascending: false })
        : { data: [] };

      setCurrentUser({
        ...currentUser,
        tokenBalance: userData.token_balance || 0,
        totalTokensEarned: userData.total_tokens_earned || 0,
        totalSpent: Number(userData.total_spent || 0),
        tokensAddedToday: userData.tokens_added_today || 0,
        redemptionsVerifiedToday: userData.redemptions_verified_today || 0,
        transactions: transactions?.map(t => ({
          id: t.id,
          date: t.date,
          amountSpent: Number(t.amount_spent),
          tokensEarned: t.tokens_earned,
          timestamp: t.timestamp,
          addedBy: t.added_by,
          staffId: t.staff_id,
        })) || [],
        activityLog: activityLog?.map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          action: a.action,
          customerId: a.customer_id,
          customerName: a.customer_name,
          details: a.details,
        })) || [],
      });
    }
  };

  const handleSignUp = (newUser: User) => {
    refetchUsers();
    setNewUserData({ userId: newUser.userId, name: newUser.name });
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setCurrentUser(newUser);
      setAuthPage('welcome');
      setViewMode('customer');
    }, 3500);
  };

  const handleLogIn = (user: User) => {
    setCurrentUser(user);
    setAuthPage('welcome');
    if (user.role === 'staff') {
      setViewMode('staff');
    } else {
      setViewMode('customer');
      setCustomerPage('home');
    }
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userSession');
    setCurrentUser(null);
    setViewMode('customer');
    setCustomerPage('home');
    setAuthPage('welcome');
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    if (!updatedUser.id) return;

    await supabase
      .from('users')
      .update({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      })
      .eq('id', updatedUser.id);

    setCurrentUser(updatedUser);
    refetchUsers();
  };

  const handleDeleteAccount = async () => {
    if (currentUser && currentUser.id) {
      await supabase
        .from('users')
        .delete()
        .eq('id', currentUser.id);

      localStorage.removeItem('userSession');
      setCurrentUser(null);
      setAuthPage('welcome');
      setViewMode('customer');
      refetchUsers();
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.email) {
        return { success: false, message: 'Email not found.' };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: oldPassword,
      });

      if (signInError) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return { success: false, message: 'Failed to update password.' };
      }

      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      return { success: false, message: 'An error occurred while changing password.' };
    }
  };

  const handleAddTokens = async (userId: string, amountSpent: number): Promise<{ success: boolean; message: string }> => {
    const user = users.find(u => u.userId === userId);

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    if (amountSpent <= 0) {
      return { success: false, message: 'Amount must be greater than 0.' };
    }

    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString());

    const recentSameTransaction = recentTransactions?.find(t => Number(t.amount_spent) === amountSpent);

    if (recentSameTransaction) {
      return { success: false, message: 'Duplicate transaction detected. Please wait 5 minutes before adding the same amount.' };
    }

    const currentBalance = user.tokenBalance || 0;
    const rawTokens = Math.floor(amountSpent / 10);
    const tokensEarned = Math.min(rawTokens, Math.max(800 - currentBalance, 0));
    const newBalance = Math.min(currentBalance + tokensEarned, 800);
    const now = new Date();

    if (tokensEarned <= 0) {
      return { success: false, message: 'Korisnik već ima maksimalnih 800 tokena.' };
    }

    await supabase.from('transactions').insert({
      user_id: user.id,
      date: now.toISOString().split('T')[0],
      amount_spent: amountSpent,
      tokens_earned: tokensEarned,
      timestamp: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      added_by: currentUser?.name,
      staff_id: currentUser?.id,
    });

    await supabase
      .from('users')
      .update({
        token_balance: newBalance,
        total_tokens_earned: (user.totalTokensEarned || 0) + tokensEarned,
        total_spent: Number(user.totalSpent || 0) + amountSpent,
      })
      .eq('id', user.id);

    const cappedNote = rawTokens > tokensEarned ? ` (ograničeno sa ${rawTokens})` : '';

    if (currentUser?.role === 'staff') {
      await supabase
        .from('activity_log')
        .insert({
          staff_id: currentUser.id,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          action: 'added_tokens',
          customer_id: user.id,
          customer_name: user.name,
          details: `${amountSpent} RSD → ${tokensEarned} tokens${cappedNote}`,
        });

      const { data: staffData } = await supabase
        .from('users')
        .select('tokens_added_today')
        .eq('id', currentUser.id)
        .maybeSingle();

      await supabase
        .from('users')
        .update({ tokens_added_today: (staffData?.tokens_added_today || 0) + tokensEarned })
        .eq('id', currentUser.id);

      await refreshUserData();
    }

    refetchUsers();
    if (currentUser && currentUser.userId === userId) {
      await refreshUserData();
    }

    return {
      success: true,
      message: `${user.name}: ${amountSpent} RSD → ${tokensEarned} tokena. Novo stanje: ${newBalance} tokena.${cappedNote}`,
    };
  };

  const handleRemoveTokens = async (userId: string, tokensToRemove: number, reason: string): Promise<{ success: boolean; message: string }> => {
    const user = users.find(u => u.userId === userId);

    if (!user) {
      return { success: false, message: 'Korisnik nije pronađen.' };
    }

    if (tokensToRemove <= 0) {
      return { success: false, message: 'Broj tokena mora biti veći od 0.' };
    }

    const currentBalance = user.tokenBalance || 0;

    if (tokensToRemove > currentBalance) {
      return { success: false, message: `Korisnik ima samo ${currentBalance} tokena. Ne možete oduzeti ${tokensToRemove}.` };
    }

    const { data: recentRemovals } = await supabase
      .from('activity_log')
      .select('*')
      .eq('action', 'removed_tokens')
      .eq('customer_id', user.id)
      .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString());

    const recentSame = recentRemovals?.find(a => a.details?.includes(`-${tokensToRemove} tokena`));

    if (recentSame) {
      return { success: false, message: 'Duplikat. Sačekajte 5 minuta pre oduzimanja istog broja tokena.' };
    }

    const newBalance = currentBalance - tokensToRemove;
    const now = new Date();

    await supabase
      .from('users')
      .update({ token_balance: newBalance })
      .eq('id', user.id);

    if (currentUser?.role === 'staff') {
      await supabase
        .from('activity_log')
        .insert({
          staff_id: currentUser.id,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          action: 'removed_tokens',
          customer_id: user.id,
          customer_name: user.name,
          details: `-${tokensToRemove} tokena | Razlog: ${reason}`,
        });
    }

    refetchUsers();
    if (currentUser && currentUser.userId === userId) {
      await refreshUserData();
    }

    return {
      success: true,
      message: `${user.name}: -${tokensToRemove} tokena. Novo stanje: ${newBalance} tokena.`,
    };
  };

  const handleRedeem = async (rewardId: number): Promise<RedemptionCode | null> => {
    if (!currentUser || !currentUser.id) return null;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return null;

    if (currentUser.tokenBalance < reward.tokenCost) {
      return null;
    }

    const code = generateCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60000);

    await supabase.from('redemption_codes').insert({
      code,
      user_id: currentUser.id,
      reward_id: reward.id,
      expires_at: expiresAt.toISOString(),
      redeemed: false,
    });

    await supabase
      .from('users')
      .update({
        token_balance: currentUser.tokenBalance - reward.tokenCost,
      })
      .eq('id', currentUser.id);

    setCurrentUser({
      ...currentUser,
      tokenBalance: currentUser.tokenBalance - reward.tokenCost,
    });

    refetchCodes();

    return {
      code,
      userId: currentUser.userId,
      rewardId: reward.id,
      expiresAt,
      redeemed: false,
      createdAt: now,
    };
  };

  const handleMarkAsRedeemed = async (code: string): Promise<{ success: boolean; message: string }> => {
    const { data: redemption } = await supabase
      .from('redemption_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (!redemption) {
      return { success: false, message: 'Code not found.' };
    }

    if (redemption.redeemed) {
      return { success: false, message: 'Code already redeemed.' };
    }

    const now = new Date();
    const expiresAt = new Date(redemption.expires_at);
    if (expiresAt < now) {
      return { success: false, message: 'Code has expired.' };
    }

    await supabase
      .from('redemption_codes')
      .update({
        redeemed: true,
        redeemed_at: now.toISOString(),
        redeemed_by: currentUser?.name,
        redeemed_by_staff_id: currentUser?.id,
      })
      .eq('code', code);

    if (currentUser?.role === 'staff') {
      const reward = rewards.find(r => r.id === redemption.reward_id);
      const customer = users.find(u => u.id === redemption.user_id);

      await supabase
        .from('activity_log')
        .insert({
          staff_id: currentUser.id,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          action: 'verified_redemption',
          customer_id: redemption.user_id,
          customer_name: customer?.name || 'Unknown',
          details: reward?.name || 'Unknown reward',
        });

      const { data: staffData } = await supabase
        .from('users')
        .select('redemptions_verified_today')
        .eq('id', currentUser.id)
        .maybeSingle();

      await supabase
        .from('users')
        .update({ redemptions_verified_today: (staffData?.redemptions_verified_today || 0) + 1 })
        .eq('id', currentUser.id);

      await refreshUserData();
    }

    refetchCodes();
    return { success: true, message: 'Reward successfully redeemed!' };
  };

  // Show loading state while checking for saved session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <img src="/logodarkbrown.svg" alt="Logo" className="w-16 h-16 mx-auto mb-4 opacity-70 animate-pulse" />
          <p style={{ color: '#6f6a65' }} className="text-sm">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {authPage === 'welcome' && (
          <WelcomePage
            onSignUp={() => setAuthPage('signup')}
            onLogIn={() => setAuthPage('login')}
            onStaffAccess={() => setAuthPage('login')}
            onAdminAccess={() => setAuthPage('admin-login')}
          />
        )}

        {authPage === 'admin-login' && (
          <AdminLoginGate
            onAuthenticated={() => setAuthPage('admin')}
            onBack={() => setAuthPage('welcome')}
          />
        )}

        {authPage === 'admin' && (
          <AdminDashboard onLogOut={() => setAuthPage('welcome')} />
        )}

        {authPage === 'signup' && (
          <SignUpPage
            onSignUpSuccess={handleSignUp}
            onBack={() => setAuthPage('welcome')}
          />
        )}

        {authPage === 'login' && (
          <LogInPage
            onLogInSuccess={handleLogIn}
            onBack={() => setAuthPage('welcome')}
            onSignUp={() => setAuthPage('signup')}
            onForgotPassword={() => setAuthPage('forgot-password')}
          />
        )}

        {authPage === 'forgot-password' && (
          <ForgotPasswordPage
            onBack={() => setAuthPage('login')}
          />
        )}

        {authPage === 'reset-password' && (
  <ResetPasswordPage
    onSuccess={() => setAuthPage('login')}
  />
)}

        {showSuccessModal && newUserData && (
          <SuccessModal
            title="Dobrodošli u Prekoputa Rewards!"
            message="Dobili ste 50 besplatnih zvezdica!"
            userId={newUserData.userId}
            onClose={() => {
              setShowSuccessModal(false);
              setCurrentUser(users.find(u => u.userId === newUserData.userId) || null);
            }}
          />
        )}
      </>
    );
  }

  if (currentUser.role === 'staff') {
    return (
      <StaffDashboard
        staffUser={currentUser}
        users={users}
        rewards={rewards}
        redemptionCodes={redemptionCodes}
        onAddStamp={handleAddTokens}
        onRemoveTokens={handleRemoveTokens}
        onMarkAsRedeemed={handleMarkAsRedeemed}
        onChangePassword={handleChangePassword}
        onLogOut={handleLogOut}
        onUpdateUser={async (updatedUser) => {
          setCurrentUser(updatedUser);
          await refreshUserData();
        }}
        onRefreshCodes={refetchCodes}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <>
        {customerPage === 'home' && (
          <CustomerDashboard user={currentUser} rewards={rewards} onGoToRewards={() => setCustomerPage('rewards')} />
        )}

        {customerPage === 'rewards' && (
          <RewardsPage user={currentUser} rewards={rewards} onRedeem={handleRedeem} />
        )}

        {customerPage === 'profile' && (
          <ProfilePage
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
            onLogOut={handleLogOut}
            onChangePassword={handleChangePassword}
          />
        )}

        <BottomNavigation currentPage={customerPage} onPageChange={setCustomerPage} />
      </>
    </div>
  );
}

export default App;