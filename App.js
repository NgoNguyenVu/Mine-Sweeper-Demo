import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import Game from "./src/screens/Game/Game";
import Leaderboard from './src/screens/Game/Leaderboard';
import Settings from "./src/screens/Settings/Settings";
import Login from "./src/screens/Login"; 
import Register from "./src/screens/Register"; 
import { auth } from './src/firebaseConfig'; // Đảm bảo đường dẫn đúng
import { onAuthStateChanged } from 'firebase/auth';

SplashScreen.preventAutoHideAsync(); // Ngăn chặn SplashScreen tự động ẩn

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoading(false); // Đặt isLoading thành false sau khi kiểm tra xong

      // Ẩn SplashScreen
      await SplashScreen.hideAsync(); 
    });

    return () => unsubscribe(); // Hủy đăng ký khi component bị gỡ bỏ
  }, []);

  if (isLoading) {
    return null; // Hoặc có thể hiển thị một spinner hoặc một logo tải
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Nếu người dùng đã đăng nhập, hiển thị màn hình Game
          <>
            <Stack.Screen name="Game" component={Game} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Leaderboard" component={Leaderboard} />
          </>
        ) : (
          // Nếu chưa đăng nhập, hiển thị màn hình Đăng Nhập và Đăng Ký
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
