import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
import { getDatabase } from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDcf4-GFmGK8t8pLLCNddpeocaZzSb-jj8',
  authDomain: 'chatapp-a68fe.firebaseapp.com',
  databaseURL: 'https://chatapp-a68fe-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chatapp-a68fe',
  storageBucket: 'chatapp-a68fe.firebasestorage.app',
  messagingSenderId: "39810390424",
  appId: "1:39810390424:web:21d780729af6000214f3ed"
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export const db = getDatabase(app);