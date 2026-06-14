// src/useStore.js — dual-mode state management (localStorage ↔ Supabase)
import { useState, useEffect, useCallback } from 'react';
import { supabase, isConfigured } from './supabaseClient';

const STORAGE_KEY = 'splittab_data';

// ─── Local Storage helpers ────────────────────────────────────────────────────
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        profiles: parsed.profiles || [],
        groups: parsed.groups || [],
      };
    }
  } catch (err) {
    console.warn('Could not load local SplitTab data:', err);
  }
  return { profiles: [], groups: [] };
}
function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── DB → JS shape mappers ────────────────────────────────────────────────────
function mapProfile(p) {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    createdAt: p.created_at,
    transactions: (p.transactions || []).map(mapTx),
  };
}
function mapTx(t) {
  return {
    id: t.id,
    amount: parseFloat(t.amount),
    note: t.note,
    direction: t.direction,
    date: t.date,
    createdAt: t.created_at,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useStore() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => !!supabase);  // waiting for Supabase auth check
  const [dataLoading, setDataLoading] = useState(false);

  const [localData, setLocalData] = useState(loadLocal);
  const [cloudProfiles, setCloudProfiles] = useState([]);

  const isCloud = isConfigured && !!session;

  // ── Auth listener ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      return;
    }
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch cloud data when session starts ─────────────────────────────────────
  const fetchCloud = useCallback(async () => {
    if (!supabase || !session) return;
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, emoji, created_at,
          transactions ( id, amount, note, direction, date, created_at )
        `)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setCloudProfiles((data || []).map(mapProfile));
    } catch (err) {
      console.error('fetchCloud error:', err.message);
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (session) {
        fetchCloud();
      } else {
        setCloudProfiles([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [session, fetchCloud]);

  // ── Persist local data ────────────────────────────────────────────────────────
  useEffect(() => {
    saveLocal(localData);
  }, [localData]);

  // ─── Auth actions ─────────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    if (!supabase) return alert('Supabase not configured.');
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) alert('Sign-in failed: ' + error.message);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setCloudProfiles([]);
  };

  // ─── Local→Cloud migration ────────────────────────────────────────────────────
  const importLocalToCloud = async () => {
    if (!supabase || !session || localData.profiles.length === 0) return;
    setDataLoading(true);
    try {
      for (const lp of localData.profiles) {
        const { data: dbProfile, error: pe } = await supabase
          .from('profiles')
          .insert([{ name: lp.name, emoji: lp.emoji, user_id: session.user.id }])
          .select()
          .single();
        if (pe) throw pe;

        if (lp.transactions.length > 0) {
          const rows = lp.transactions.map(t => ({
            profile_id: dbProfile.id,
            amount: t.amount,
            note: t.note,
            direction: t.direction,
            date: t.date,
          }));
          const { error: te } = await supabase.from('transactions').insert(rows);
          if (te) throw te;
        }
      }
      // Clear local data after successful migration
      setLocalData(d => ({ ...d, profiles: [] }));
      await fetchCloud();
    } catch (err) {
      console.error('Migration failed:', err.message);
      alert('Failed to sync some data: ' + err.message);
    } finally {
      setDataLoading(false);
    }
  };

  // ─── Profile CRUD ─────────────────────────────────────────────────────────────
  const addProfile = async (name, emoji = '👤') => {
    if (isCloud) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ name, emoji, user_id: session.user.id }])
        .select()
        .single();
      if (error) { alert('Error: ' + error.message); return; }
      const newP = { ...mapProfile(data), transactions: [] };
      setCloudProfiles(prev => [...prev, newP]);
      return newP.id;
    } else {
      const id = crypto.randomUUID();
      const profile = { id, name, emoji, createdAt: new Date().toISOString(), transactions: [] };
      setLocalData(d => ({ ...d, profiles: [...d.profiles, profile] }));
      return id;
    }
  };

  const deleteProfile = async (profileId) => {
    if (isCloud) {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) { alert('Error: ' + error.message); return; }
      setCloudProfiles(prev => prev.filter(p => p.id !== profileId));
    } else {
      setLocalData(d => ({ ...d, profiles: d.profiles.filter(p => p.id !== profileId) }));
    }
  };

  const updateProfile = async (profileId, { name, emoji }) => {
    if (isCloud) {
      const { error } = await supabase
        .from('profiles')
        .update({ name, emoji })
        .eq('id', profileId);
      if (error) { alert('Error: ' + error.message); return; }
      setCloudProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, name, emoji } : p
      ));
    } else {
      setLocalData(d => ({
        ...d,
        profiles: d.profiles.map(p =>
          p.id === profileId ? { ...p, name, emoji } : p
        ),
      }));
    }
  };

  const clearTransactions = async (profileId) => {
    if (isCloud) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('profile_id', profileId);
      if (error) { alert('Error: ' + error.message); return; }
      setCloudProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, transactions: [] } : p
      ));
    } else {
      setLocalData(d => ({
        ...d,
        profiles: d.profiles.map(p =>
          p.id === profileId ? { ...p, transactions: [] } : p
        ),
      }));
    }
  };

  const getProfile = (profileId) =>
    (isCloud ? cloudProfiles : localData.profiles).find(p => p.id === profileId);

  // ─── Group CRUD ──────────────────────────────────────────────────────────────
  const addGroup = ({ name, emoji = '👥', members }) => {
    const now = new Date().toISOString();
    const cleanMembers = members
      .map(member => ({
        id: crypto.randomUUID(),
        name: member.name.trim(),
        emoji: member.emoji || '👤',
      }))
      .filter(member => member.name);

    const group = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji,
      members: cleanMembers,
      expenses: [],
      createdAt: now,
    };

    setLocalData(d => ({ ...d, groups: [...(d.groups || []), group] }));
    return group.id;
  };

  const deleteGroup = (groupId) => {
    setLocalData(d => ({
      ...d,
      groups: (d.groups || []).filter(group => group.id !== groupId),
    }));
  };

  const getGroup = (groupId) =>
    (localData.groups || []).find(group => group.id === groupId);

  const addGroupExpense = (groupId, {
    title,
    amount,
    paidByMemberId,
    participantIds,
    date,
    note = '',
  }) => {
    const txDate = date || new Date().toISOString().split('T')[0];
    const parsedAmount = parseFloat(amount);
    const expense = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parsedAmount,
      paidByMemberId,
      participantIds,
      splitType: 'equal',
      note,
      date: txDate,
      createdAt: new Date().toISOString(),
    };

    setLocalData(d => ({
      ...d,
      groups: (d.groups || []).map(group =>
        group.id === groupId
          ? { ...group, expenses: [...group.expenses, expense] }
          : group
      ),
    }));
  };

  const deleteGroupExpense = (groupId, expenseId) => {
    setLocalData(d => ({
      ...d,
      groups: (d.groups || []).map(group =>
        group.id === groupId
          ? { ...group, expenses: group.expenses.filter(expense => expense.id !== expenseId) }
          : group
      ),
    }));
  };

  const getGroupBalances = (groupId) => {
    const group = getGroup(groupId);
    if (!group) return {};

    const balances = Object.fromEntries(group.members.map(member => [member.id, 0]));

    group.expenses.forEach(expense => {
      const participants = expense.participantIds?.length
        ? expense.participantIds
        : group.members.map(member => member.id);
      const share = expense.amount / participants.length;

      balances[expense.paidByMemberId] = (balances[expense.paidByMemberId] || 0) + expense.amount;
      participants.forEach(memberId => {
        balances[memberId] = (balances[memberId] || 0) - share;
      });
    });

    return balances;
  };

  const getGroupSettlements = (groupId) => {
    const group = getGroup(groupId);
    if (!group) return [];

    const balances = getGroupBalances(groupId);
    const byMemberId = Object.fromEntries(group.members.map(member => [member.id, member]));
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      const rounded = Math.round(balance * 100) / 100;
      if (rounded < -0.01) debtors.push({ memberId, amount: Math.abs(rounded) });
      if (rounded > 0.01) creditors.push({ memberId, amount: rounded });
    });

    const settlements = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        fromMemberId: debtor.memberId,
        fromName: byMemberId[debtor.memberId]?.name || 'Someone',
        toMemberId: creditor.memberId,
        toName: byMemberId[creditor.memberId]?.name || 'Someone',
        amount,
      });

      debtor.amount = Math.round((debtor.amount - amount) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - amount) * 100) / 100;
      if (debtor.amount <= 0.01) debtorIndex += 1;
      if (creditor.amount <= 0.01) creditorIndex += 1;
    }

    return settlements;
  };

  // ─── Transaction CRUD ─────────────────────────────────────────────────────────
  const addTransaction = async (profileId, { amount, note = '', direction, date }) => {
    const txDate = date || new Date().toISOString().split('T')[0];
    const parsedAmount = parseFloat(amount);
    if (isCloud) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ profile_id: profileId, amount: parsedAmount, note, direction, date: txDate }])
        .select()
        .single();
      if (error) { alert('Error: ' + error.message); return; }
      const tx = mapTx(data);
      setCloudProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, transactions: [...p.transactions, tx] } : p
      ));
    } else {
      const tx = {
        id: crypto.randomUUID(),
        amount: parsedAmount,
        note,
        direction,
        date: txDate,
        createdAt: new Date().toISOString(),
      };
      setLocalData(d => ({
        ...d,
        profiles: d.profiles.map(p =>
          p.id === profileId ? { ...p, transactions: [...p.transactions, tx] } : p
        ),
      }));
    }
  };

  const updateTransaction = async (profileId, txId, { amount, note = '', direction, date }) => {
    const txDate = date || new Date().toISOString().split('T')[0];
    const parsedAmount = parseFloat(amount);
    const updates = { amount: parsedAmount, note, direction, date: txDate };

    if (isCloud) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', txId)
        .select()
        .single();
      if (error) { alert('Error: ' + error.message); return; }
      const updatedTx = mapTx(data);
      setCloudProfiles(prev => prev.map(p =>
        p.id === profileId
          ? { ...p, transactions: p.transactions.map(t => t.id === txId ? updatedTx : t) }
          : p
      ));
    } else {
      setLocalData(d => ({
        ...d,
        profiles: d.profiles.map(p =>
          p.id === profileId
            ? {
                ...p,
                transactions: p.transactions.map(t =>
                  t.id === txId ? { ...t, ...updates } : t
                ),
              }
            : p
        ),
      }));
    }
  };

  const deleteTransaction = async (profileId, txId) => {
    if (isCloud) {
      const { error } = await supabase.from('transactions').delete().eq('id', txId);
      if (error) { alert('Error: ' + error.message); return; }
      setCloudProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, transactions: p.transactions.filter(t => t.id !== txId) } : p
      ));
    } else {
      setLocalData(d => ({
        ...d,
        profiles: d.profiles.map(p =>
          p.id === profileId ? { ...p, transactions: p.transactions.filter(t => t.id !== txId) } : p
        ),
      }));
    }
  };

  // ─── Balance ──────────────────────────────────────────────────────────────────
  const getBalance = (profileId) => {
    const profile = getProfile(profileId);
    if (!profile) return 0;
    return profile.transactions.reduce(
      (acc, tx) => (tx.direction === 'i_paid' ? acc + tx.amount : acc - tx.amount),
      0
    );
  };

  return {
    // Data
    profiles: isCloud ? cloudProfiles : localData.profiles,
    groups: localData.groups || [],
    localProfileCount: localData.profiles.length,
    // Auth state
    session,
    user: session?.user ?? null,
    isCloud,
    isConfigured,
    authLoading,
    dataLoading,
    // Auth actions
    loginWithGoogle,
    logout,
    importLocalToCloud,
    // CRUD
    addProfile,
    deleteProfile,
    updateProfile,
    clearTransactions,
    getProfile,
    addGroup,
    deleteGroup,
    getGroup,
    addGroupExpense,
    deleteGroupExpense,
    getGroupBalances,
    getGroupSettlements,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance,
  };
}
