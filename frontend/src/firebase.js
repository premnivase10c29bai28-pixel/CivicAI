import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAAlD6zq0I_b-rDTdKyHV2U_eKP-aoaK4",
  authDomain: "civicai-e2ff2.firebaseapp.com",
  projectId: "civicai-e2ff2",
  storageBucket: "civicai-e2ff2.firebasestorage.app",
  messagingSenderId: "920436862559",
  appId: "1:920436862559:web:85a523f7f8cdbab4b575ea"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;