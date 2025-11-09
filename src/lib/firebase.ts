import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVUyHYMlqQpv6tUNkdwhj2eNh2tL9QQ3E",
  authDomain: "mp3project-fef5a.firebaseapp.com",
  projectId: "mp3project-fef5a",
  storageBucket: "mp3project-fef5a.firebasestorage.app",
  messagingSenderId: "982253535126",
  appId: "1:982253535126:web:f292bcc43ac775afd8a7b7",
  measurementId: "G-3LW6T0J5LY"
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
