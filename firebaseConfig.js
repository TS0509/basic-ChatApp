import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDcf4-GFmGK8t8pLLCNddpeocaZzSb-jj8',
  authDomain: 'chatapp-a68fe.firebaseapp.com',
  databaseURL: 'https://chatapp-a68fe-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chatapp-a68fe',
  storageBucket: 'chatapp-a68fe.firebasestorage.app',
  messagingSenderId: "39810390424",
  appId: "1:39810390424:web:21d780729af6000214f3ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Database
const db = getDatabase(app);

export { auth, db, app };
