import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
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
    console.log("Testing Firestore connection with forced long polling...");
    const testDoc = await getDocFromServer(doc(db, '_connection_test_', 'initial'));
    console.log("Firestore connection successful:", testDoc.exists() ? "Doc exists" : "Doc not found (OK)");
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const isOffline = errMessage.includes('the client is offline') || 
                      errMessage.includes('Could not reach Cloud Firestore backend') ||
                      errMessage.includes('unavailable') ||
                      errMessage.includes('Failed to get document from server');

    if (error instanceof Error && (error.message.includes('Quota limit exceeded') || error.message.toLowerCase().includes('quota'))) {
      console.warn("Firestore connectivity test: Free daily read units quota limit reached for Firestore.");
    } else if (isOffline) {
      console.warn("Firestore is operating in offline cache mode. This is normal if the connection is slow or blocked by a firewall:", errMessage);
    } else {
      console.warn("Firestore connectivity test note:", errMessage);
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
