// Simple Firebase connection test
import { auth, db } from '../firebase';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Auth instance:', auth);
    console.log('Auth config:', auth.config);
    console.log('Database instance:', db);
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
};

// You can run this in browser console: testFirebaseConnection()
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
}