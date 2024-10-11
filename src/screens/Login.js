// src/screens/Login.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { auth } from '../firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window'); // Lấy chiều rộng màn hình

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      await AsyncStorage.setItem('userToken', token);
      navigation.replace('Game'); // Chuyển hướng đến màn hình Game sau khi đăng nhập
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image 
        source={require('../../assets/backgroundlogin.jpeg')} 
        style={styles.backgroundImage}  
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Đăng Nhập</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Mật Khẩu" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng Nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  backgroundImage: {
    position: 'absolute',
    width: width, // Đặt chiều rộng bằng chiều rộng màn hình
    height: '100%', // Đặt chiều cao bằng chiều cao màn hình
    resizeMode: 'cover', // Đảm bảo hình ảnh không bị biến dạng
    top: 0,
    left: 0,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Nền trắng với độ trong suốt
    borderRadius: 20, // Tăng độ cong của góc
    padding: 30, // Tăng padding cho phần overlay
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000', // Thêm bóng cho overlay
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Tăng độ nổi cho overlay trên Android
  },
  title: {
    fontSize: 30, // Kích thước chữ lớn hơn
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#007BFF',
    borderWidth: 2,
    borderRadius: 10, // Tăng độ cong của góc trường nhập
    paddingHorizontal: 15, // Tăng padding cho trường nhập
    marginBottom: 12,
    fontSize: 16,
    width: '100%', // Đảm bảo trường nhập liệu rộng đầy đủ
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 10, // Tăng độ cong của góc nút
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%', // Đảm bảo nút bấm rộng đầy đủ
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Tăng kích thước chữ nút
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#007BFF',
    marginTop: 8,
    fontSize: 16, // Kích thước chữ cho liên kết
  },
});

export default Login;
