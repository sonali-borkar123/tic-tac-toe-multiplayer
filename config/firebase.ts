import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7l6_h5Y7mm4xP0S0zibCWzYajJ_1a7eI",
  authDomain: "tic-tac-toe-67d6f.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-67d6f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tic-tac-toe-67d6f",
  storageBucket: "tic-tac-toe-67d6f.firebasestorage.app",
  messagingSenderId: "328065023813",
  appId: "1:328065023813:web:b0c4187ba271298b56482c",
  measurementId: "G-VTZ85KBXFH"
};

let app: FirebaseApp;
let database: Database;

export function initializeFirebase(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('Firebase initialized successfully');
  }
  return app;
}

export function getFirebaseDatabase(): Database {
  if (!database) {
    initializeFirebase();
  }
  return database;
}
