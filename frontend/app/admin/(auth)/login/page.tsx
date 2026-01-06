"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    const e = email.trim().toLowerCase();
    const p = pass.trim();

    if (!e || !p) return setError("Completa email y contraseña.");
    if (!e.includes("@")) return setError("Email inválido.");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Credenciales incorrectas.");
        return;
      }

      // tu backend suele devolver access_token (si no, puede ser token)
      const token = data.access_token || data.token;
      if (!token) return setError("El backend no devolvió token.");

      localStorage.setItem("admin_token", token);
      router.push("/admin/dashboard");
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Admin • Login</h1>

      <div className="space-y-4 border border-gray-700 rounded p-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 placeholder:text-gray-400 focus:outline-none"
        />

        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 placeholder:text-gray-400 focus:outline-none"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={login}
          disabled={loading}
          className="w-full border border-gray-700 rounded py-3 hover:bg-[#626262] hover:text-black transition disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}
