// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCutIxpKAkbUaNfsFYFStSfpOtHmhccMas",
  authDomain: "htmls-add9f.firebaseapp.com",
  projectId: "htmls-add9f",
  storageBucket: "htmls-add9f.appspot.com",
  messagingSenderId: "262641215324",
  appId: "1:262641215324:web:2338acd879bdcc0b4ec399"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
