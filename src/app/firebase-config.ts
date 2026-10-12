import type { FirebaseOptions } from 'firebase/app';

/**
 * The Firebase project of the pizza queue app, which stores the orders to follow.
 * These values identify the project; they aren't secret. Access is limited by the
 * Firestore rules (firestore.rules, kept in the order-queue repository), and every order is
 * encrypted with a key from its link.
 */
export const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: 'AIzaSyDynA378LkycrYvuvU7d7c6GWldXmprjBk',
  authDomain: 'order-6e94a.firebaseapp.com',
  projectId: 'order-6e94a',
  storageBucket: 'order-6e94a.firebasestorage.app',
  messagingSenderId: '780771979521',
  appId: '1:780771979521:web:d8ec04423dd9126fe66b00',
};
