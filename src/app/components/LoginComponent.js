// src/app/components/LoginComponent.js
"use client";

import React, { useState } from "react";
import axios from "axios";
import styles from "./LoginComponent.module.css"; // Importando o CSS Module

export default function LoginComponent({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
        {
          username,
          password,
        }
      );
      onLoginSuccess(response.data.token);
    } catch (err) {
      setError("Nome de usuário ou senha incorretos.");
      console.error("Erro no login:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Usuário
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ana"
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123"
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
