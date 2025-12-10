"use client";

import { FormEvent, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao cadastrar");
      }
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cadastrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-layout">
      <div className="login-card">
        <p className="eyebrow">CV ATS Generator</p>
        <h1>Criar conta</h1>
        <p className="muted">Cadastre-se com e-mail e senha para continuar.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Cadastrar"}
          </button>
        </form>

        {error && <div className="alert">{error}</div>}

        <p className="hint">
          Exemplo: fluxo mock; implemente validação real com Prisma/DB para produção.
        </p>
      </div>

      <style jsx>{`
        .login-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: radial-gradient(circle at 20% 20%, #eef2ff, #f8fafc 35%),
            radial-gradient(circle at 80% 0%, #e0f2fe, #f8fafc 30%),
            #f8fafc;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 16px 50px rgba(15, 23, 42, 0.12);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .eyebrow {
          margin: 0;
          font-size: 13px;
          letter-spacing: 0.6px;
          color: #64748b;
          text-transform: uppercase;
        }
        h1 {
          margin: 0;
          font-size: 26px;
        }
        .muted {
          margin: 0;
          color: #475569;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-weight: 600;
          color: #0f172a;
        }
        input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 14px;
        }
        button {
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        button[disabled] {
          background: #94a3b8;
          cursor: not-allowed;
        }
        .alert {
          padding: 10px 12px;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecdd3;
        }
        .hint {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }
      `}</style>
    </main>
  );
}
