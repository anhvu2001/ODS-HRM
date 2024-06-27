// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_APIKEY,
    authDomain: "ods-hrm.firebaseapp.com",
    databaseURL: "https://ods-hrm-default-rtdb.firebaseio.com",
    projectId: "ods-hrm",
    storageBucket: "ods-hrm.appspot.com",
    messagingSenderId: "424959226657",
    appId: "1:424959226657:web:06eb65d539ac9e32084460",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export the database instance
export const database = getDatabase(app);


