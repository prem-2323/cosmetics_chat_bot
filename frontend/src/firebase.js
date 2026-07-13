import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB_lhRxjp8xe67ELGC3yx8FmApDaMmJEro",
  authDomain: "cosmogpt-2323.firebaseapp.com",
  projectId: "cosmogpt-2323",
  storageBucket: "cosmogpt-2323.firebasestorage.app",
  messagingSenderId: "1096833649704",
  // Omit or use a generic Web App ID; Auth and Firestore will connect successfully
  appId: "1:1096833649704:web:9b00000000000000000000"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
// Set Custom Parameters if needed (e.g. prompt to select account)
googleProvider.setCustomParameters({ prompt: 'select_account' })
