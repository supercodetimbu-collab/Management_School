import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_ACCOUNTS, INITIAL_PERMISSIONS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  login: (username: string, pass: string) => { success: boolean; message?: string };
  quickLoginAsRole: (role: UserRole) => void;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with admin demo user by default for instant smooth inspection, or read from storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('siakad_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved auth user', e);
      }
    }
    // Default to admin for first load
    return DEMO_ACCOUNTS.admin.user;
  });

  const [selectedChildId, setSelectedChildId] = useState<string | null>(() => {
    return 'std-01'; // Default first child (Muhammad Farhan Santoso)
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('siakad_auth_user', JSON.stringify(currentUser));
      if (currentUser.role === 'orangtua' && currentUser.linkedStudentIds && currentUser.linkedStudentIds.length > 0) {
        if (!selectedChildId || !currentUser.linkedStudentIds.includes(selectedChildId)) {
          setSelectedChildId(currentUser.linkedStudentIds[0]);
        }
      }
    } else {
      localStorage.removeItem('siakad_auth_user');
    }
  }, [currentUser]);

  const login = (username: string, pass: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check in demo accounts
    const accountEntry = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.user.username.toLowerCase() === cleanUsername || acc.user.email.toLowerCase() === cleanUsername
    );

    if (accountEntry) {
      if (accountEntry.pass === cleanPass || cleanPass === 'demo123') {
        setCurrentUser(accountEntry.user);
        return { success: true };
      } else {
        return { success: false, message: 'Password salah. Gunakan password "demo123".' };
      }
    }

    return {
      success: false,
      message: 'Akun tidak ditemukan. Gunakan salah satu username demo (admin, guru, siswa, orangtua, kepsek, superadmin) dengan password "demo123".',
    };
  };

  const quickLoginAsRole = (role: UserRole) => {
    if (DEMO_ACCOUNTS[role]) {
      setCurrentUser(DEMO_ACCOUNTS[role].user);
      if (role === 'orangtua' && DEMO_ACCOUNTS[role].user.linkedStudentIds) {
        setSelectedChildId(DEMO_ACCOUNTS[role].user.linkedStudentIds[0]);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString().split('T')[0] };
    setCurrentUser(updated);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    const perm = INITIAL_PERMISSIONS.find((p) => p.code === permissionCode);
    if (!perm) return false;
    return perm.roles.includes(currentUser.role);
  };

  const currentRole = currentUser ? currentUser.role : 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        selectedChildId,
        setSelectedChildId,
        login,
        quickLoginAsRole,
        logout,
        updateCurrentUserProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
