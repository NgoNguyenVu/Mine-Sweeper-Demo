import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"; // Cập nhật import cho auth
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm import cho AsyncStorage

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

// Cấu hình Firebase Auth với AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage) // Sử dụng AsyncStorage để lưu trữ trạng thái đăng nhập
});

export { db, auth }; // Xuất auth cùng với db
