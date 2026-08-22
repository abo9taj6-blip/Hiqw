import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Using initializeFirestore with experimentalForceLongPolling to bypass potential gRPC/WebSocket blocks
// and enabling persistent local cache so the app can function robustly offline.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);

// Connectivity check as per CRITICAL requirement
async function testConnection() {
  try {
    const testDoc = await getDoc(doc(db, '_connection_test_', 'initial'));
    if (testDoc.exists()) {
      console.log("Firestore connection active");
    }
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (errMessage.includes('Quota limit exceeded') || errMessage.toLowerCase().includes('quota')) {
      console.warn("Firestore connectivity test: Free daily read units quota limit reached for Firestore.");
    } else {
      console.info("Firestore operating with local persistence/offline cache:", errMessage);
    }
  }
}

// Run test after a short delay
if (typeof window !== 'undefined' && !sessionStorage.getItem('connTested')) {
  setTimeout(() => {
    testConnection();
    sessionStorage.setItem('connTested', 'true');
  }, 2000);
}

export const auth = getAuth(app);
