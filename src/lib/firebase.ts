import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatMessage, NotificationItem, Announcement, DatabaseBackupLog, DatabaseSystemConfig } from '../types';

let app: FirebaseApp;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseReady = false;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    auth = getAuth(app);
  } catch {
    // Auth optional
  }

  // Support custom firestoreDatabaseId from firebase-applet-config.json with long-polling fallback for iframe environments
  const firestoreSettings = {
    experimentalAutoDetectLongPolling: true,
  };

  if (firebaseConfig.firestoreDatabaseId) {
    try {
      db = initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId);
    } catch {
      try {
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } catch (e) {
        console.warn('[Firebase] Fallback to default firestore instance:', e);
        db = getFirestore(app);
      }
    }
  } else {
    try {
      db = initializeFirestore(app, firestoreSettings);
    } catch {
      db = getFirestore(app);
    }
  }
  isFirebaseReady = !!db;
  console.log('[Firebase] Initialized Firestore database:', firebaseConfig.firestoreDatabaseId || '(default)');
  
  // Connection validation per Firebase Skill guidelines
  async function testConnection() {
    if (!db) return;
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log('[Firebase] Connection to Firestore server verified.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('[Firebase] Firestore client is offline or network is reconnecting.');
      }
    }
  }
  testConnection();
} catch (error) {
  console.warn('[Firebase] Initialization notice:', error);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

export { app, db, auth, isFirebaseReady, firebaseConfig };

// ----------------------------------------------------
// 1. REAL-TIME DATA SYNC (Admin, Kepsek, Guru updates)
// ----------------------------------------------------
export interface SyncEventPayload {
  id?: string;
  type: string;
  module: string;
  action: string;
  details: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  dataSnapshot?: any;
}

export function subscribeToLiveUpdates(callback: (event: SyncEventPayload) => void): Unsubscribe | (() => void) {
  if (!db) return () => {};
  try {
    const q = query(
      collection(db, 'live_updates'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as SyncEventPayload;
          callback({ ...data, id: change.doc.id });
        }
      });
    }, (err) => {
      console.warn('[Firestore] Live updates listener error:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to subscribe to live updates:', err);
    return () => {};
  }
}

export async function broadcastUpdateToFirebase(payload: Omit<SyncEventPayload, 'id'>) {
  if (!db) return;
  try {
    await addDoc(collection(db, 'live_updates'), {
      ...payload,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to broadcast update to Firebase:', err);
  }
}

// ----------------------------------------------------
// 2. REAL-TIME ANNOUNCEMENTS (All Roles & Dashboards)
// ----------------------------------------------------
export function subscribeToRealtimeAnnouncements(
  callback: (announcements: Announcement[]) => void
): Unsubscribe | (() => void) {
  if (!db) return () => {};
  try {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Pengumuman Sekolah',
          content: d.content || '',
          category: d.category || 'Umum',
          target: d.target || 'ALL',
          targetClassId: d.targetClassId,
          authorName: d.authorName || 'Administrator',
          publishedDate: d.publishedDate || d.date || new Date().toISOString().split('T')[0],
          date: d.date || d.publishedDate || new Date().toISOString().split('T')[0],
          isImportant: d.isImportant ?? false,
        });
      });
      callback(list);
    }, (err) => {
      console.warn('[Firestore] Announcements listener error:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to subscribe to announcements:', err);
    return () => {};
  }
}

export async function saveAnnouncementToFirebase(anc: Announcement): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'announcements', anc.id), {
      ...anc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to save announcement to Firebase:', err);
  }
}

export async function deleteAnnouncementFromFirebase(id: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    console.warn('[Firestore] Failed to delete announcement from Firebase:', err);
  }
}

// ----------------------------------------------------
// 3. REAL-TIME NOTIFICATIONS (All Users / Dashboards)
// ----------------------------------------------------
export function subscribeToRealtimeNotifications(
  callback: (notifications: NotificationItem[]) => void
): Unsubscribe | (() => void) {
  if (!db) return () => {};
  try {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(60)
    );
    return onSnapshot(q, (snapshot) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Pemberitahuan Sistem',
          message: d.message || '',
          time: d.time || 'Baru saja',
          timestamp: typeof d.timestamp === 'number' ? d.timestamp : Date.now(),
          read: d.read ?? false,
          category: d.category || 'sistem',
          targetRole: d.targetRole || 'all',
          targetUserId: d.targetUserId,
          linkAction: d.linkAction,
        });
      });
      callback(list);
    }, (err) => {
      console.warn('[Firestore] Notifications listener error:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to subscribe to notifications:', err);
    return () => {};
  }
}

export async function sendNotificationToFirebase(notif: NotificationItem | Omit<NotificationItem, 'id'>) {
  if (!db) return;
  try {
    const docId = 'id' in notif && notif.id ? notif.id : `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, 'notifications', docId), {
      ...notif,
      id: docId,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to send notification to Firebase:', err);
  }
}

// ----------------------------------------------------
// 4. REAL-TIME CHAT ROOM (All Roles)
// ----------------------------------------------------
export function subscribeToRealtimeChat(
  channelId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe | (() => void) {
  if (!db) return () => {};
  try {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('createdAt', 'asc'),
      limit(150)
    );
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as any;
        if (!channelId || channelId === 'all' || d.channelId === channelId) {
          messages.push({
            id: docSnap.id,
            channelId: d.channelId || 'general',
            channelName: d.channelName || 'Saluran Umum',
            senderId: d.senderId,
            senderName: d.senderName || 'Pengguna',
            senderRole: d.senderRole || 'siswa',
            senderSchoolName: d.senderSchoolName,
            content: d.content || '',
            timestamp: d.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: d.createdAt || Date.now(),
          });
        }
      });
      callback(messages);
    }, (err) => {
      console.warn('[Firestore] Chat listener error:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to subscribe to chat messages:', err);
    return () => {};
  }
}

export async function sendChatMessageToFirebase(msg: Omit<ChatMessage, 'id' | 'createdAt'>) {
  if (!db) return;
  try {
    await addDoc(collection(db, 'chat_messages'), {
      ...msg,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to send chat message:', err);
  }
}

// ----------------------------------------------------
// 5. DATABASE & GOOGLE DRIVE / SHEETS CONFIG (Superadmin)
// ----------------------------------------------------
const CONFIG_DOC_PATH = 'system_config';
const CONFIG_DOC_ID = 'global_database_settings';

export const INITIAL_DATABASE_CONFIG: DatabaseSystemConfig = {
  firebaseConnected: true,
  firebaseProjectId: firebaseConfig.projectId || 'gen-lang-client-0674772628',
  firebaseDatabaseId: firebaseConfig.firestoreDatabaseId || 'ai-studio-siakadsekolah-4d2d0d12-19b8-456d-85bc-9c872b5f23e2',
  googleDriveConnected: true,
  googleDriveEmail: 'supercodetimbu@gmail.com',
  googleDriveFolder: '/SIAKAD_BACKUPS_2026/',
  googleSheetsBackupEnabled: true,
  autoSyncEnabled: true,
  syncIntervalMinutes: 60,
  lastSyncTimestamp: new Date().toLocaleString('id-ID'),
  backupLogs: [
    {
      id: 'log-01',
      timestamp: '2026-09-19 09:30:00',
      type: 'firebase_snapshot',
      status: 'success',
      size: '2.4 MB',
      target: 'Firestore (ai-studio-siakadsekolah-...)',
      initiator: 'Super Administrator',
    },
    {
      id: 'log-02',
      timestamp: '2026-09-19 08:00:00',
      type: 'google_drive_backup',
      status: 'success',
      size: '2.4 MB',
      target: 'Google Drive (supercodetimbu@gmail.com:/SIAKAD_BACKUPS_2026/)',
      initiator: 'Sistem Sinkronisasi Otomatis',
    },
    {
      id: 'log-03',
      timestamp: '2026-09-18 22:15:00',
      type: 'google_sheets_sync',
      status: 'success',
      size: '1.8 MB',
      target: 'Google Sheets (SIAKAD_Data_Master_2026.gsheet)',
      initiator: 'Super Administrator',
    },
  ],
};

export function subscribeToDatabaseConfig(callback: (config: DatabaseSystemConfig) => void): Unsubscribe | (() => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, CONFIG_DOC_PATH, CONFIG_DOC_ID);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as DatabaseSystemConfig);
      } else {
        // Initialize doc if not created yet
        setDoc(docRef, INITIAL_DATABASE_CONFIG).catch(console.warn);
        callback(INITIAL_DATABASE_CONFIG);
      }
    }, (err) => {
      console.warn('[Firestore] Config listener error:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to subscribe to database config:', err);
    return () => {};
  }
}

export async function saveDatabaseConfigToFirebase(config: DatabaseSystemConfig) {
  if (!db) return;
  try {
    const docRef = doc(db, CONFIG_DOC_PATH, CONFIG_DOC_ID);
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to save database config:', err);
  }
}
