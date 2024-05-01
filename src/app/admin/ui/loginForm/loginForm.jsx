"use client";

import styles from "./loginForm.module.css";
import signIn from '@/lib/login'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter()


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await signIn(email, password);

      if (!response) {
        // Handle invalid response or error from signIn function
        setError('Invalid email or password');
        return;
      }

      // Assuming successful login, you can handle the token here
      const { token, user } = response;
      // For example, save the token to local storage
      // localStorage.setItem('token', token);
      Cookies.set('token', token)
      // console.log(user[0].isAdmin)
      Cookies.set('isAdmin', user[0].isAdmin)
      Cookies.set('userID', user[0]._id)
      if (user[0].isAdmin) {
        router.push(`/admin`);
      } else {
        // Show an error message for non-admin users
        setError('You do not have admin privileges.');
      }
      // Redirect or do something else upon successful login
      console.log('Login successful!');
    } catch (error) {
      // Handle any other errors that might occur
      console.error('Error:', error.message);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Login</h1>
        <input
              type="email"
              placeholder="email" name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          <input
              type="password"
              placeholder="password" name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          <button type="submit">Login</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
  );
};

export default LoginForm;