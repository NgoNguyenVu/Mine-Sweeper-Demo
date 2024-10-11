// src/screens/ForgotPassword.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { auth } from '../firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

const { width } = Dimensions.get('window'); // Lấy chiều rộng màn hình

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      setError('');
    } catch (e) {
      setError(e.message);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image 
        source={require('../../assets/backgroundlogin.jpeg')} 
        style={styles.backgroundImage}  
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Quên Mật Khẩu</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Gửi Liên Kết Đặt Lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Quay lại Đăng Nhập</Text>
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
    width: width,
    height: '100%',
    resizeMode: 'cover',
    top: 0,
    left: 0,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Nền trắng với độ trong suốt
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#007BFF',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    width: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#007BFF',
    marginTop: 8,
    fontSize: 16,
  },
});

export default ForgotPassword;
