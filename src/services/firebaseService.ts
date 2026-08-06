import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc,
  serverTimestamp,
  increment,
  collectionGroup,
  writeBatch,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (errMessage.includes("Quota limit exceeded") || errMessage.toLowerCase().includes("quota")) {
    console.warn(`Firestore quota limit exceeded during ${operationType} on ${path}. Continuing gracefully.`);
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Utility to remove undefined values from objects recursively
function cleanData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => (v && typeof v === 'object') ? cleanData(v) : v);
  }
  
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) return;
    
    if (obj[key] && typeof obj[key] === 'object' && !(obj[key] instanceof Date) && !(obj[key].constructor && obj[key].constructor.name === 'FieldValue')) {
      newObj[key] = cleanData(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}

export const firebaseService = {
  // Fetch a collection ONCE (no live listener) — use for data that doesn't change every second
  fetchCollectionOnce: async <T>(
    collectionPath: string,
    orderField?: string,
    orderDir: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<T[]> => {
    try {
      const maxItems = limitCount || 200;
      const q = orderField
        ? query(collection(db, collectionPath), orderBy(orderField, orderDir), limit(maxItems))
        : query(collection(db, collectionPath), limit(maxItems));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      const errStr = error instanceof Error ? error.message : String(error);
      if (errStr.toLowerCase().includes('quota')) {
        console.warn(`Quota exceeded for ${collectionPath}, returning empty.`);
        return [];
      }
      console.warn(`Error fetching ${collectionPath}:`, error);
      return [];
    }
  },

  // Fetch all products across stores ONCE (no live listener)
  fetchAllProductsOnce: async (): Promise<any[]> => {
    try {
      const q = query(collectionGroup(db, 'market_products'), orderBy('createdAt', 'desc'), limit(150));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Error fetching all products:', error);
      return [];
    }
  },

  // Listen to a collection
  subscribeToCollection: <T>(
    collectionPath: string, 
    callback: (data: T[]) => void,
    orderField?: string,
    orderDir: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ) => {
    // Apply a default safety cap of 200 items unless explicitly specified to conserve Firestore quota
    const maxItems = limitCount || 200;
    let q = orderField 
      ? query(collection(db, collectionPath), orderBy(orderField, orderDir), limit(maxItems))
      : query(collection(db, collectionPath), limit(maxItems));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      if (error && error.message && error.message.includes("Quota limit exceeded")) {
        console.warn(`Firestore quota limit exceeded for ${collectionPath}. Falling back gracefully.`);
        callback([]);
      } else {
        console.warn(`Firestore Snapshot Warning for ${collectionPath}:`, error);
      }
    });
  },

  // Subscribe to all products across all stores (collectionGroup)
  subscribeToAllProducts: (callback: (data: any[]) => void) => {
    // Add safety limit to avoid reading all historical market products endlessly
    const q = query(
      collectionGroup(db, 'market_products'),
      orderBy('createdAt', 'desc'),
      limit(150)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      if (error && error.message && error.message.includes("Quota limit exceeded")) {
        console.warn('Firestore quota limit exceeded for market_products. Falling back gracefully.');
        callback([]);
      } else {
        console.warn('Firestore Snapshot Warning for market_products (collectionGroup):', error);
      }
    });
  },

  // Listen to a collection filtered by user
  subscribeToUserCollection: <T>(
    collectionPath: string,
    userId: string,
    callback: (data: T[]) => void,
    orderField?: string,
    orderDir: 'asc' | 'desc' = 'desc'
  ) => {
    const q = orderField
      ? query(
          collection(db, collectionPath),
          where('userId', '==', userId),
          orderBy(orderField, orderDir)
        )
      : query(
          collection(db, collectionPath),
          where('userId', '==', userId)
        );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      if (error && error.message && error.message.includes("Quota limit exceeded")) {
        console.warn(`Firestore quota limit exceeded for user collection ${collectionPath}. Falling back gracefully.`);
        callback([]);
      } else {
        console.warn(`Firestore Snapshot Warning for user collection ${collectionPath}:`, error);
      }
    });
  },

  // Generic Write (Set or Update)
  saveDocument: async (collectionPath: string, id: string, data: any) => {
    try {
      console.log(`Saving document ${id} to ${collectionPath}`);
      const docRef = doc(db, collectionPath, id);
      const cleaned = cleanData(data);
      await setDoc(docRef, { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${id}`);
    }
  },

  // Generic Add
  addDocument: async (collectionPath: string, data: any) => {
    try {
      console.log(`Adding document to ${collectionPath}`);
      const colRef = collection(db, collectionPath);
      const docRef = doc(colRef); // Generate a unique ID
      const id = docRef.id;
      const cleaned = cleanData(data);
      await setDoc(docRef, { ...cleaned, id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
    }
  },

  // Generic Update
  updateDocument: async (collectionPath: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionPath, id);
      const cleaned = cleanData(data);
      await setDoc(docRef, { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
    }
  },

  // Generic Increment
  incrementDocumentField: async (collectionPath: string, id: string, field: string, amount: number) => {
    try {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, { [field]: increment(amount), updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
    }
  },

  // Generic Delete
  deleteDocument: async (collectionPath: string, id: string) => {
    try {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
    }
  },

  // Batch Write
  batchWriteDocuments: async (updates: { collectionPath: string, id?: string, data: any, type: 'set' | 'add' }[]) => {
    try {
      const b = writeBatch(db);
      
      updates.forEach(update => {
        let docRef;
        if (update.id) {
            docRef = doc(db, update.collectionPath, update.id);
        } else {
            docRef = doc(collection(db, update.collectionPath));
        }

        const cleaned = cleanData(update.data);
        const data = {
            ...cleaned,
            updatedAt: serverTimestamp(),
            ...(update.type === 'add' ? { createdAt: serverTimestamp(), id: docRef.id } : {})
        };

        if (update.type === 'set') {
            b.set(docRef, data, { merge: true });
        } else {
            b.set(docRef, data);
        }
      });
      
      await b.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch');
    }
  },

  // Get Single Doc
  getDocument: async <T>(collectionPath: string, id: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      const errStr = error instanceof Error ? error.message : String(error);
      if (errStr.includes("Quota limit exceeded") || errStr.toLowerCase().includes("quota")) {
        console.warn(`Firestore quota limit exceeded for getDocument ${collectionPath}/${id}. Returning null gracefully.`);
        return null;
      }
      handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
      return null;
    }
  },

  // Storage: Upload Image
  uploadImage: async (path: string, file: Blob): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    }
  }
};
