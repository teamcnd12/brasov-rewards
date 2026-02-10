import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Reward, RedemptionCode, Transaction } from '../types';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useRewards: Starting to fetch rewards...');
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    console.log('Fetching rewards from database...');
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', true)
      .order('id');

    console.log('Rewards data:', data, 'Error:', error);

    if (data) {
      setRewards(data.map(r => ({
        id: r.id,
        name: r.name,
        tokenCost: r.token_cost,
        imageUrl: r.image_url,
      })));
    }
    setLoading(false);
  };

  return { rewards, loading, refetch: fetchRewards };
}

export function useUserData(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [userId]);

  const fetchUser = async () => {
    if (!userId) return;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userData) {
      setUser(null);
      setLoading(false);
      return;
    }

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

    setUser({
      id: userData.id,
      userId: userData.user_id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      tokenBalance: userData.token_balance || 0,
      totalTokensEarned: userData.total_tokens_earned || 0,
      totalSpent: Number(userData.total_spent || 0),
      memberSince: userData.member_since,
      createdBy: userData.created_by,
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

    setLoading(false);
  };

  return { user, loading, refetch: fetchUser };
}

export function useAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data.map(u => ({
        id: u.id,
        userId: u.user_id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: u.password,
        role: u.role,
        tokenBalance: u.token_balance || 0,
        totalTokensEarned: u.total_tokens_earned || 0,
        totalSpent: Number(u.total_spent || 0),
        memberSince: u.member_since,
        createdBy: u.created_by,
        tokensAddedToday: u.tokens_added_today || 0,
        redemptionsVerifiedToday: u.redemptions_verified_today || 0,
        transactions: [],
        activityLog: [],
      })));
    }
    setLoading(false);
  };

  return { users, loading, refetch: fetchUsers };
}

export function useRedemptionCodes() {
  const [redemptionCodes, setRedemptionCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const { data } = await supabase
      .from('redemption_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setRedemptionCodes(data.map(rc => ({
        code: rc.code,
        userId: rc.user_id,
        rewardId: rc.reward_id,
        expiresAt: new Date(rc.expires_at),
        redeemed: rc.redeemed,
        createdAt: new Date(rc.created_at),
      })));
    }
    setLoading(false);
  };

  return { redemptionCodes, loading, refetch: fetchCodes };
}
