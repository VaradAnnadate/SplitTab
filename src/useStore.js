// src/useStore.js — dual-mode state management (localStorage ↔ Supabase)
import { useState, useEffect, useCallback } from 'react';
import { supabase, isConfigured } from './supabaseClient';

const STORAGE_KEY = 'splittab_data';

// ─── Local Storage helpers ────────────────────────────────────────────────────
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { profiles: [] };
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
  const [authLoading, setAuthLoading] = useState(true);  // waiting for Supabase auth check
  const [dataLoading, setDataLoading] = useState(false);

  const [localData, setLocalData] = useState(loadLocal);
  const [cloudProfiles, setCloudProfiles] = useState([]);

  const isCloud = isConfigured && !!session;

  // ── Auth listener ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
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
    if (session) {
      fetchCloud();
    } else {
      setCloudProfiles([]);
    }
  }, [session, fetchCloud]);

  // ── Persist local data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCloud) saveLocal(localData);
  }, [localData, isCloud]);

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
          .insert([{ name: lp.name, emoji: lp.emoji }])
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
      setLocalData({ profiles: [] });
      localStorage.removeItem(STORAGE_KEY);
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

  const getProfile = (profileId) =>
    (isCloud ? cloudProfiles : localData.profiles).find(p => p.id === profileId);

  // ─── Transaction CRUD ─────────────────────────────────────────────────────────
  const addTransaction = async (profileId, { amount, note = '', direction, date }) => {
    const txDate = date || new Date().toISOString().split('T')[0];
    if (isCloud) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ profile_id: profileId, amount: parseFloat(amount), note, direction, date: txDate }])
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
        amount: parseFloat(amount),
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
    getProfile,
    addTransaction,
    deleteTransaction,
    getBalance,
  };
}
