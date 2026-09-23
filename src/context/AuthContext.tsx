import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserAccount, SchoolEntity } from '../types';
import { INITIAL_SYSTEM_ACCOUNTS, INITIAL_SCHOOLS_LIST, INITIAL_PERMISSIONS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  accounts: UserAccount[];
  schools: SchoolEntity[];
  login: (username: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;
  changeSelfUsername: (newUsername: string) => { success: boolean; message: string };
  changeSelfPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  createSchoolWithAdmin: (
    school: Omit<SchoolEntity, 'id' | 'adminId' | 'adminUsername' | 'adminName' | 'createdAt'>,
    admin: { name: string; username: string; password: string; email: string; phone?: string }
  ) => { success: boolean; message: string };
  createUserAccount: (
    accountData: Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>
  ) => { success: boolean; message: string };
  updateUserStatus: (userId: string, status: 'active' | 'blocked', reason?: string) => { success: boolean; message: string };
  deleteUserAccount: (userId: string) => { success: boolean; message: string };
  adminResetPassword: (userId: string, newPass: string) => { success: boolean; message: string };
  syncSchoolName: (newSchoolName: string) => void;
  refreshAccounts: () => void;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to read current school name from persisted siakad_app_data if available
  const getPersistedSchoolName = (): string | null => {
    try {
      const savedSiakad = localStorage.getItem('siakad_app_data');
      if (savedSiakad) {
        const parsed = JSON.parse(savedSiakad);
        if (parsed?.schoolProfile?.name) {
          return parsed.schoolProfile.name;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // 1. Persistent System Accounts
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const activeSchoolName = getPersistedSchoolName();
    const saved = localStorage.getItem('siakad_system_accounts');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        // Ensure default superadmin tn.timbu is always present
        const hasTimbu = parsed.some((a) => a.username.toLowerCase() === 'tn.timbu');
        if (!hasTimbu) {
          const defaultSuper = INITIAL_SYSTEM_ACCOUNTS.find((a) => a.username === 'tn.timbu');
          if (defaultSuper) parsed.unshift(defaultSuper);
        }
        // Auto synchronize school name if active school name is known
        if (activeSchoolName) {
          return parsed.map((acc) =>
            acc.role === 'superadmin' ? acc : { ...acc, schoolName: activeSchoolName }
          );
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved system accounts', e);
      }
    }
    if (activeSchoolName) {
      return INITIAL_SYSTEM_ACCOUNTS.map((acc) =>
        acc.role === 'superadmin' ? acc : { ...acc, schoolName: activeSchoolName }
      );
    }
    return INITIAL_SYSTEM_ACCOUNTS;
  });

  // 2. Persistent Registered Schools
  const [schools, setSchools] = useState<SchoolEntity[]>(() => {
    const activeSchoolName = getPersistedSchoolName();
    const saved = localStorage.getItem('siakad_system_schools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (activeSchoolName && parsed?.[0]) {
          parsed[0].name = activeSchoolName;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved schools', e);
      }
    }
    if (activeSchoolName && INITIAL_SCHOOLS_LIST[0]) {
      return [{ ...INITIAL_SCHOOLS_LIST[0], name: activeSchoolName }];
    }
    return INITIAL_SCHOOLS_LIST;
  });

  // 3. Current Authenticated User (null if logged out)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const activeSchoolName = getPersistedSchoolName();
    const saved = localStorage.getItem('siakad_auth_user');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        if (parsed && parsed.role !== 'superadmin' && activeSchoolName) {
          parsed.schoolName = activeSchoolName;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved auth user', e);
      }
    }
    return null;
  });

  const [selectedChildId, setSelectedChildId] = useState<string | null>(() => {
    return 'std-01'; // Default child for demo orangtua
  });

  // Programmatic school name synchronizer across all non-superadmin accounts
  const syncSchoolName = (newSchoolName: string) => {
    if (!newSchoolName || !newSchoolName.trim()) return;
    const cleanName = newSchoolName.trim();

    // 1. Update currentUser if not superadmin
    setCurrentUser((prev) => {
      if (!prev) return null;
      if (prev.role === 'superadmin') return prev;
      return { ...prev, schoolName: cleanName };
    });

    // 2. Update all accounts
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.role === 'superadmin' ? acc : { ...acc, schoolName: cleanName }
      )
    );

    // 3. Update schools entity
    setSchools((prev) =>
      prev.map((sch) =>
        sch.id === 'sch-01' ? { ...sch, name: cleanName } : sch
      )
    );
  };

  // Listen to global school update event
  useEffect(() => {
    const handleSchoolUpdateEvent = (e: any) => {
      if (e?.detail?.name) {
        syncSchoolName(e.detail.name);
      }
    };
    window.addEventListener('siakad_school_updated', handleSchoolUpdateEvent);
    return () => {
      window.removeEventListener('siakad_school_updated', handleSchoolUpdateEvent);
    };
  }, []);

  // Sync accounts to localStorage
  useEffect(() => {
    localStorage.setItem('siakad_system_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Sync schools to localStorage
  useEffect(() => {
    localStorage.setItem('siakad_system_schools', JSON.stringify(schools));
  }, [schools]);

  // Sync currentUser to localStorage
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
  }, [currentUser, selectedChildId]);

  // Login handler
  const login = (usernameInput: string, passInput: string) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    if (!cleanUsername || !cleanPass) {
      return { success: false, message: 'Harap masukkan username dan password.' };
    }

    // Match in accounts
    const account = accounts.find(
      (acc) => acc.username.toLowerCase() === cleanUsername || acc.email.toLowerCase() === cleanUsername
    );

    if (!account) {
      return {
        success: false,
        message: 'Username atau akun tidak terdaftar. Hubungi administrator sekolah.',
      };
    }

    // Check account status
    if (account.status === 'blocked') {
      return {
        success: false,
        message: `Akun Anda telah dinonaktifkan/diblokir oleh Administrator. ${account.blockedReason ? `Alasan: ${account.blockedReason}` : 'Hubungi pihak sekolah untuk informasi lebih lanjut.'}`,
      };
    }

    // Check password
    if (account.password !== cleanPass) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah. Silakan coba kembali.',
      };
    }

    // Extract User without sensitive password
    const safeUser: User = {
      id: account.id,
      username: account.username,
      name: account.name,
      email: account.email,
      role: account.role,
      avatar: account.avatar,
      phone: account.phone,
      schoolId: account.schoolId,
      schoolName: account.schoolName,
      status: account.status,
      linkedId: account.linkedId,
      linkedStudentIds: account.linkedStudentIds,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    setCurrentUser(safeUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Self-profile edit
  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const now = new Date().toISOString().split('T')[0];

    const updatedUser: User = {
      ...currentUser,
      ...data,
      updatedAt: now,
    };

    setCurrentUser(updatedUser);

    // Update in accounts
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUser.id
          ? { ...acc, ...data, updatedAt: now }
          : acc
      )
    );
  };

  // Self username update
  const changeSelfUsername = (newUsername: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sesi pengguna tidak valid.' };
    const clean = newUsername.trim().toLowerCase();

    if (!clean || clean.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter.' };
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(clean)) {
      return { success: false, message: 'Username hanya boleh huruf, angka, titik, strip, dan underscore.' };
    }

    // Check uniqueness
    const exists = accounts.some(
      (a) => a.id !== currentUser.id && a.username.toLowerCase() === clean
    );
    if (exists) {
      return { success: false, message: 'Username tersebut sudah digunakan oleh akun lain.' };
    }

    const now = new Date().toISOString().split('T')[0];
    const updatedUser: User = { ...currentUser, username: clean, updatedAt: now };
    setCurrentUser(updatedUser);

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUser.id ? { ...acc, username: clean, updatedAt: now } : acc
      )
    );

    return { success: true, message: 'Username berhasil diperbarui.' };
  };

  // Self password update
  const changeSelfPassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Sesi pengguna tidak valid.' };

    const cleanOld = oldPass.trim();
    const cleanNew = newPass.trim();

    if (!cleanOld || !cleanNew) {
      return { success: false, message: 'Semua kolom password wajib diisi.' };
    }

    if (cleanNew.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' };
    }

    const currentAcc = accounts.find((a) => a.id === currentUser.id);
    if (!currentAcc || currentAcc.password !== cleanOld) {
      return { success: false, message: 'Password lama yang Anda masukkan salah.' };
    }

    const now = new Date().toISOString().split('T')[0];

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUser.id ? { ...acc, password: cleanNew, updatedAt: now } : acc
      )
    );

    return { success: true, message: 'Password berhasil diubah. Gunakan password baru saat login berikutnya.' };
  };

  // Superadmin creates School and its Admin Account
  const createSchoolWithAdmin = (
    schoolData: Omit<SchoolEntity, 'id' | 'adminId' | 'adminUsername' | 'adminName' | 'createdAt'>,
    adminData: { name: string; username: string; password: string; email: string; phone?: string }
  ): { success: boolean; message: string } => {
    const cleanUsername = adminData.username.trim().toLowerCase();
    const cleanPass = adminData.password.trim();

    if (!cleanUsername || !cleanPass || !adminData.name.trim()) {
      return { success: false, message: 'Nama, username, dan password admin wajib diisi.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, message: 'Password admin minimal 6 karakter.' };
    }

    // Check username collision
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username admin "${cleanUsername}" sudah digunakan akun lain.` };
    }

    const schoolId = `sch-${Date.now().toString().slice(-4)}`;
    const adminId = `usr-admin-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newAdminAccount: UserAccount = {
      id: adminId,
      username: cleanUsername,
      password: cleanPass,
      name: adminData.name.trim(),
      email: adminData.email.trim() || `${cleanUsername}@${schoolData.npsn}.sch.id`,
      role: 'admin',
      phone: adminData.phone?.trim() || schoolData.phone,
      schoolId: schoolId,
      schoolName: schoolData.name.trim(),
      status: 'active',
      createdAt: today,
      updatedAt: today,
    };

    const newSchool: SchoolEntity = {
      id: schoolId,
      name: schoolData.name.trim(),
      npsn: schoolData.npsn.trim(),
      address: schoolData.address.trim(),
      adminId: adminId,
      adminUsername: cleanUsername,
      adminName: adminData.name.trim(),
      phone: schoolData.phone.trim(),
      email: schoolData.email.trim(),
      status: 'active',
      createdAt: today,
    };

    setSchools((prev) => [newSchool, ...prev]);
    setAccounts((prev) => [newAdminAccount, ...prev]);

    return {
      success: true,
      message: `Sekolah "${newSchool.name}" dan akun admin (${cleanUsername}) berhasil dibuat!`,
    };
  };

  // Admin / Superadmin creates user account
  const createUserAccount = (
    accountData: Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; message: string } => {
    const cleanUsername = accountData.username.trim().toLowerCase();
    const cleanPass = accountData.password.trim();

    if (!cleanUsername || !cleanPass || !accountData.name.trim()) {
      return { success: false, message: 'Nama lengkap, username, dan password wajib diisi.' };
    }

    if (cleanPass.length < 5) {
      return { success: false, message: 'Password minimal 5 karakter.' };
    }

    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username "${cleanUsername}" sudah digunakan.` };
    }

    const newId = `usr-${accountData.role}-${Date.now().toString().slice(-5)}`;
    const today = new Date().toISOString().split('T')[0];

    const newAccount: UserAccount = {
      ...accountData,
      id: newId,
      username: cleanUsername,
      password: cleanPass,
      name: accountData.name.trim(),
      email: accountData.email?.trim() || `${cleanUsername}@sekolah.sch.id`,
      status: accountData.status || 'active',
      createdAt: today,
      updatedAt: today,
    };

    setAccounts((prev) => [newAccount, ...prev]);
    return { success: true, message: `Akun ${accountData.role.toUpperCase()} untuk "${newAccount.name}" berhasil dibuat!` };
  };

  // Block or unblock account
  const updateUserStatus = (userId: string, status: 'active' | 'blocked', reason?: string): { success: boolean; message: string } => {
    const target = accounts.find((a) => a.id === userId);
    if (!target) return { success: false, message: 'Akun tidak ditemukan.' };

    if (target.role === 'superadmin') {
      return { success: false, message: 'Akun Superadmin tidak dapat diblokir.' };
    }

    const today = new Date().toISOString().split('T')[0];

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === userId
          ? {
              ...a,
              status,
              blockedReason: status === 'blocked' ? reason || 'Melanggar kebijakan aplikasi.' : undefined,
              updatedAt: today,
            }
          : a
      )
    );

    // If current logged-in user is blocked, force logout
    if (currentUser && currentUser.id === userId && status === 'blocked') {
      logout();
    }

    return {
      success: true,
      message: status === 'blocked' ? `Akun ${target.name} berhasil diblokir.` : `Akses akun ${target.name} berhasil diaktifkan kembali.`,
    };
  };

  // Delete user account
  const deleteUserAccount = (userId: string): { success: boolean; message: string } => {
    const target = accounts.find((a) => a.id === userId);
    if (!target) return { success: false, message: 'Akun tidak ditemukan.' };

    if (target.role === 'superadmin') {
      return { success: false, message: 'Akun Superadmin utama tidak dapat dihapus.' };
    }

    setAccounts((prev) => prev.filter((a) => a.id !== userId));

    if (currentUser && currentUser.id === userId) {
      logout();
    }

    return { success: true, message: `Akun "${target.name}" telah dihapus secara permanen.` };
  };

  // Reset password by admin / superadmin
  const adminResetPassword = (userId: string, newPass: string): { success: boolean; message: string } => {
    const cleanPass = newPass.trim();
    if (!cleanPass || cleanPass.length < 5) {
      return { success: false, message: 'Password baru minimal 5 karakter.' };
    }

    const today = new Date().toISOString().split('T')[0];

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === userId ? { ...a, password: cleanPass, updatedAt: today } : a
      )
    );

    return { success: true, message: 'Password akun berhasil direset.' };
  };

  const refreshAccounts = () => {
    const savedAccounts = localStorage.getItem('siakad_system_accounts');
    if (savedAccounts) {
      try {
        const parsed: UserAccount[] = JSON.parse(savedAccounts);
        const hasTimbu = parsed.some((a) => a.username.toLowerCase() === 'tn.timbu');
        if (!hasTimbu) {
          const defaultSuper = INITIAL_SYSTEM_ACCOUNTS.find((a) => a.username === 'tn.timbu');
          if (defaultSuper) parsed.unshift(defaultSuper);
        }
        setAccounts(parsed);
      } catch (e) {
        console.error('Failed to parse saved accounts on refresh', e);
      }
    } else {
      setAccounts(INITIAL_SYSTEM_ACCOUNTS);
    }

    const savedSchools = localStorage.getItem('siakad_system_schools');
    if (savedSchools) {
      try {
        setSchools(JSON.parse(savedSchools));
      } catch (e) {
        console.error('Failed to parse saved schools on refresh', e);
      }
    } else {
      setSchools(INITIAL_SCHOOLS_LIST);
    }
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
        accounts,
        schools,
        login,
        logout,
        updateCurrentUserProfile,
        changeSelfUsername,
        changeSelfPassword,
        createSchoolWithAdmin,
        createUserAccount,
        updateUserStatus,
        deleteUserAccount,
        adminResetPassword,
        syncSchoolName,
        refreshAccounts,
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
