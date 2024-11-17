import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCK1GQCa5AKrPeTKViRtJKehT3LCfpZmno",
  authDomain: "jameeawithchat.firebaseapp.com",
  projectId: "jameeawithchat",
  storageBucket: "jameeawithchat.firebasestorage.app",
  messagingSenderId: "235205870367",
  appId: "1:235205870367:web:b9177a786a5c14bdd9262a"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export { auth };
export default app;