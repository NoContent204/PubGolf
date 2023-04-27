import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";



const firebaseConfig = {

  apiKey: "AIzaSyAA9KHfvxo7_UAC7JPDCXtn9ASwbTSg8_k",

  authDomain: "pub-golf-web.firebaseapp.com",

  databaseURL: "https://pub-golf-web-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "pub-golf-web",

  storageBucket: "pub-golf-web.appspot.com",

  messagingSenderId: "962949148801",

  appId: "1:962949148801:web:b70a92ddb4a80e436bdd80"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);


const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    // Signed in..
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });


onAuthStateChanged(auth, (user) => {
  if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // ...
  } else {
      // User is signed out
      // ...
  }
  });