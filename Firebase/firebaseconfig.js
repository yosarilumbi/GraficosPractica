
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseconfig = {
  apiKey: "AIzaSyDa5aF1njyFaa4ztBwsTHkaRMUY-s4ol14",
  authDomain: "appgastosfirebase-a2a9b.firebaseapp.com",
  projectId: "appgastosfirebase-a2a9b",
  storageBucket: "appgastosfirebase-a2a9b.appspot.com",
  messagingSenderId: "635225877264",
  appId: "1:635225877264:web:e610c7e0fa73af181fd395"
};


const app = initializeApp(firebaseconfig);
const db = getFirestore (app);
export default db;