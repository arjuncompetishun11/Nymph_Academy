// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Admin authentication functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user is already in the database
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user in database
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isAdmin: false, // Default to false, manually set to true for admins
        createdAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

const signOut = () => firebaseSignOut(auth);

const checkIfAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data().isAdmin === true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status: ", error);
    return false;
  }
};

// Function to set up website settings
const initializeWebsiteSettings = async () => {
  const settingsRef = doc(db, "settings", "website");
  const settingsDoc = await getDoc(settingsRef);
  
  if (!settingsDoc.exists()) {
    await setDoc(settingsRef, {
      paymentQRUrl: "",
      paymentPrice: "1000",
      logoUrl: "",
      updatedAt: new Date()
    });
  }
};

// Call initialization
initializeWebsiteSettings().catch(console.error);

export { 
  db, 
  storage, 
  auth, 
  signInWithGoogle, 
  signOut, 
  onAuthStateChanged,
  checkIfAdmin 
};