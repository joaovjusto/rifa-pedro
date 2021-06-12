import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD5ioiH_KEBqB_1HE9rwh8or-nNkd2FZbo",
  authDomain: "cha-rifa-pedro.firebaseapp.com",
  projectId: "cha-rifa-pedro",
  storageBucket: "cha-rifa-pedro.appspot.com",
  messagingSenderId: "951337151477",
  appId: "1:951337151477:web:da6fd215488c9f40a90ebc"
};

firebase.initializeApp(firebaseConfig);

// utils
const db = firebase.firestore();

const FirebaseStorage = firebase.storage();

// collection references
const numbersCollection = db.collection("numbers");
// const citiesCollection = db.collection("cities");

// export utils/refs
export { numbersCollection, FirebaseStorage };
