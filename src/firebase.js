import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAk9qqZHcPr6m8TU7sU7VxB27wzyvqb7WE",
    authDomain: "hairsalon-bookingmanagement.firebaseapp.com",
    projectId: "hairsalon-bookingmanagement",
    storageBucket: "hairsalon-bookingmanagement.firebasestorage.app",
    messagingSenderId: "1066449207578",
    appId: "1:1066449207578:web:6c47242be17cb4b801eca3",
    measurementId: "G-KCD90W5MW0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
