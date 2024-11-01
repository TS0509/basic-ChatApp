import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
import { getDatabase } from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyD1B8Pu_4SPdtCNNfTUz47A9VaeNi6njps',
  authDomain: 'class3-4b7b8.firebaseapp.com',
  databaseURL: 'https://class3-4b7b8-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'class3-4b7b8',
  storageBucket: 'class3-4b7b8.appspot.com',
  messagingSenderId: "1042994950105",
  appId: "1:1042994950105:web:ccdca4e0d06e26025c33c8"
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export const db = getDatabase(app);