import React, { createContext, useContext, useState, useEffect } from 'react';

const AccountsContext = createContext();

export const useAccounts = () => useContext(AccountsContext);

// The four platforms our app supports
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

// Fake usernames for the mock OAuth flow
const mockUsernames = {
  instagram: 'demo.creator',
  facebook: 'Demo Brand Page',
  twitter: 'demo_creator',
  linkedin: 'Demo Creator',
};

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('socialAccounts');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem('socialAccounts', JSON.stringify(accounts));
  }, [accounts]);

  const isConnected = (platformId) =>
    accounts.some((a) => a.platform === platformId);

  const getAccount = (platformId) =>
    accounts.find((a) => a.platform === platformId);

  // Simulate an OAuth authorization (called after user clicks "Authorize" in modal)
  const connectAccount = (platformId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAccount = {
          id: `acc-${Date.now()}`,
          platform: platformId,
          username: mockUsernames[platformId] || 'demo_user',
          accessToken: `mock-token-${platformId}-${Date.now()}`,
          connectedAt: new Date().toISOString(),
        };
        setAccounts((prev) => [...prev.filter((a) => a.platform !== platformId), newAccount]);
        resolve(newAccount);
      }, 1500);
    });
  };

  const disconnectAccount = (platformId) => {
    setAccounts((prev) => prev.filter((a) => a.platform !== platformId));
  };

  const value = {
    accounts,
    isConnected,
    getAccount,
    connectAccount,
    disconnectAccount,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};