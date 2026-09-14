import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext.jsx';
import { accountsService } from '../services/accountsService.js';

const AccountsContext = createContext();

export const useAccounts = () => useContext(AccountsContext);

// ---------- Platform metadata (colors, icons, names) ----------
export const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'bi-instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    description: 'Photo & video sharing',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'bi-facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(45deg, #1877F2, #0a54c4)',
    description: 'Social networking',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'bi-twitter-x',
    color: '#000000',
    gradient: 'linear-gradient(45deg, #000000, #333333)',
    description: 'Real-time microblogging',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'bi-linkedin',
    color: '#0A66C2',
    gradient: 'linear-gradient(45deg, #0A66C2, #004182)',
    description: 'Professional networking',
  },
];

// Fallback usernames for mock OAuth flow
const mockUsernames = {
  instagram: 'demo.creator',
  facebook: 'Demo Brand Page',
  twitter: 'demo_creator',
  linkedin: 'Demo Creator',
};

export const AccountsProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------- Fetch accounts from backend ----------
  const fetchAccounts = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setAccounts([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await accountsService.list();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
      console.error('fetchAccounts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Load accounts when user changes ----------
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user, authLoading, fetchAccounts]);

  // ---------- Helpers ----------
  const isConnected = (platformId) =>
    accounts.some((a) => a.platform === platformId);

  const getAccount = (platformId) =>
    accounts.find((a) => a.platform === platformId);

  // ---------- Connect (mock OAuth) ----------
  // Real OAuth would exchange a code with the backend. For now, we send
  // a fake accessToken + username so the backend can save it.
  const connectAccount = async (platformId) => {
    setError('');
    try {
      const data = await accountsService.connect({
        platform: platformId,
        username: mockUsernames[platformId] || 'demo_user',
        accessToken: `mock-token-${platformId}-${Date.now()}`,
      });
      setAccounts((prev) => [
        ...prev.filter((a) => a.platform !== platformId),
        data.account,
      ]);
      return data.account;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ---------- Disconnect ----------
  const disconnectAccount = async (platformId) => {
    setError('');
    try {
      await accountsService.disconnect(platformId);
      setAccounts((prev) => prev.filter((a) => a.platform !== platformId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    accounts,
    loading,
    error,
    isConnected,
    getAccount,
    connectAccount,
    disconnectAccount,
    refresh: fetchAccounts,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};