"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      alert("Giriş başarılı!");
    } catch (err) {
      console.error(err);
      alert("Giriş başarısız!");
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google ile giriş başarılı!");
    } catch (err) {
      console.error(err);
      alert("Google ile giriş başarısız!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280, margin: "40px auto" }}>
      <h1>Login</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      <button onClick={loginWithEmail}>Login with Email</button>
      <button onClick={loginWithGoogle}>Login with Google</button>
    </div>
  );
}
