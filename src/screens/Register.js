// src/screens/Register.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig'; // Đảm bảo đường dẫn đúng
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

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
      // Tạo người dùng mới
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu dữ liệu người dùng vào Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        gameName: gameName,
        createdAt: Timestamp.fromDate(new Date()), // Thêm thời gian tạo
      });

      console.log('User registered');
      navigation.replace('Game'); // Chuyển hướng đến màn hình Game sau khi đăng ký
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Register;
