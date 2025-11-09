import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface TestTransaction {
  sender: string;
  recipient: string;
  amount: number;
  signature: string;
  isPrivate: boolean;
  timestamp: Timestamp;
  status: 'pending' | 'confirmed' | 'failed';
  commitment?: string;
  nullifier?: string;
}

export async function logTestTransaction(tx: Omit<TestTransaction, 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'test_transactions'), {
      ...tx,
      timestamp: Timestamp.now()
    });
    console.log('Transaction logged with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging transaction:', error);
    throw error;
  }
}

export { db };
