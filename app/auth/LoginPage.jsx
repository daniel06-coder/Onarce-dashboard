"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Optional client-side check for a friendlier login experience.
      // The server-side ADMIN_UID check is the actual security boundary.
    if (!process.env.NEXT_PUBLIC_ADMIN_UID) {
      await signOut(auth);
      throw new Error("Admin configuration is missing.");
    }

    if (result.user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      await signOut(auth);
      throw new Error("You are not authorized to access this dashboard.");
    }

      router.replace("/");
    } catch (error) {
      setError(
        error.message || "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={login} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border p-3"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
