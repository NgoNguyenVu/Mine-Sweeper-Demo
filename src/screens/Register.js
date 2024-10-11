// src/screens/Register.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { auth, db } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window'); // Lấy chiều rộng màn hình

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        gameName: gameName,
        createdAt: Timestamp.fromDate(new Date()),
      });

      console.log('User registered');
      navigation.replace('Game'); 
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
        <Text style={styles.title}>Đăng Ký</Text>
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
        <TextInput 
          style={styles.input} 
          placeholder="Nhập lại Mật Khẩu" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Tên Game" 
          value={gameName} 
          onChangeText={setGameName} 
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng Ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000', // Thêm bóng cho overlay
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    paddingHorizontal: 15,
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

export default Register;
