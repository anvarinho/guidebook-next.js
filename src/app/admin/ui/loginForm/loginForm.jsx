"use client";

import styles from "./loginForm.module.css";
import { signIn } from 'next-auth/react';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter()


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/admin' });

      if (!response?.ok || response.error) {
        // Handle invalid response or error from signIn function
        setError('Invalid email or password');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      // Handle any other errors that might occur

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