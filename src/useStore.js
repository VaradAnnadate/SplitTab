// useStore.js — localStorage-backed state management
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'splittab_data';

const defaultData = {
  profiles: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return defaultData;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // --- Profile Actions ---
  const addProfile = (name, emoji) => {
    const profile = {
      id: crypto.randomUUID(),
      name,
      emoji,
      createdAt: new Date().toISOString(),
      transactions: [],
    };
    setData(d => ({ ...d, profiles: [...d.profiles, profile] }));
    return profile.id;
  };

  const deleteProfile = (profileId) => {
    setData(d => ({
      ...d,
      profiles: d.profiles.filter(p => p.id !== profileId),
    }));
  };

  const getProfile = (profileId) =>
    data.profiles.find(p => p.id === profileId);

  // --- Transaction Actions ---
  const addTransaction = (profileId, { amount, note, direction, date }) => {
    const tx = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      note: note || '',
      direction, // 'i_paid' | 'they_paid'
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setData(d => ({
      ...d,
      profiles: d.profiles.map(p =>
        p.id === profileId
          ? { ...p, transactions: [...p.transactions, tx] }
          : p
      ),
    }));
  };

  const deleteTransaction = (profileId, txId) => {
    setData(d => ({
      ...d,
      profiles: d.profiles.map(p =>
        p.id === profileId
          ? { ...p, transactions: p.transactions.filter(t => t.id !== txId) }
          : p
      ),
    }));
  };

  // --- Balance Calculation ---
  // Positive = they owe me, Negative = I owe them
  const getBalance = (profileId) => {
    const profile = getProfile(profileId);
    if (!profile) return 0;
    return profile.transactions.reduce((acc, tx) => {
      return tx.direction === 'i_paid'
        ? acc + tx.amount   // I paid → they owe me
        : acc - tx.amount;  // They paid → I owe them
    }, 0);
  };

  return {
    profiles: data.profiles,
    addProfile,
    deleteProfile,
    getProfile,
    addTransaction,
    deleteTransaction,
    getBalance,
  };
}
