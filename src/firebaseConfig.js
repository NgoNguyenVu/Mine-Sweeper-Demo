// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Thêm import cho auth
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4JwxCTDnIa3N6DxD9MG69WYx9F5pl9As",
  authDomain: "minesweeper-1bf9b.firebaseapp.com",
  projectId: "minesweeper-1bf9b",
  storageBucket: "minesweeper-1bf9b.appspot.com",
  messagingSenderId: "443518963932",
  appId: "1:443518963932:android:e234df7aba84dfc5496419",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Khởi tạo dịch vụ xác thực

export { db, auth }; // Xuất auth cùng với db
