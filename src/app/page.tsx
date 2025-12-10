"use client";

import { useEffect, useState } from "react";

const SAMPLE_JSON = `{
  "name": "Henrique Pappis",
  "title": "Senior PHP/Laravel Engineer | Tech Lead | Full Stack Developer",
  "location": "Recife, Brazil",
  "email": "contact@henriquepappis.com",
  "phone": "+55 81 98660-0535",
  "linkedin": "linkedin.com/in/henriquepappis",
  "summary": "Senior PHP/Laravel Engineer with 17+ years of continuous experience building scalable web applications, APIs, and distributed systems. Strong expertise in Laravel, microservices, system modernization, cloud environments, and Agile leadership. Proven history of improving system performance, reducing technical debt, and leading engineering teams to deliver high-quality software. Seeking international opportunities to contribute as a Senior Backend or Full-Stack Engineer.",
  "skills": {
    "languages": ["PHP", "JavaScript", "TypeScript"],
    "frameworks": ["Laravel", "Symfony", "CodeIgniter", "Lumen", "Vue.js", "React"],
    "backend": ["REST APIs", "Microservices", "Authentication (JWT, OAuth, Sanctum)", "Queues", "RabbitMQ"],
    "databases": ["MySQL", "PostgreSQL", "MongoDB", "Query Optimization"],
    "devops": ["Docker", "Linux Servers", "Nginx", "Apache", "AWS", "Google Cloud", "Azure"],
    "tools": ["Git", "Git Flow", "Pull Requests", "Code Review", "Jira", "Confluence"],
    "principles": ["SOLID", "Clean Code", "Design Patterns", "TDD"],
    "other": ["Agile/Scrum", "Remote Collaboration", "CI/CD", "Swagger/OpenAPI"]
  },
  "experience": [
    {
      "position": "Tech Lead",
      "company": "ZoneSoft (Portugal)",
      "location": "Remote",
      "period": "Mar 2023 – May 2025",
      "achievements": [
        "Architected and executed the decomposition of a monolithic platform into independent API, Frontend, and Backoffice services, improving scalability and deployment autonomy.",
        "Implemented Git Flow, PR standards, and Code Review culture, reducing production bugs and increasing delivery consistency.",
        "Modernized legacy PHP applications by upgrading frameworks, reducing technical debt and improving maintainability.",
        "Collaborated closely with Product and Business teams to define roadmaps and strategic technical initiatives.",
        "Mentored developers and enhanced engineering practices, fostering a high-performance team environment."
      ]
    }
  ],
  "education": [
    { "degree": "MBA in Agile Methodologies", "institution": "FM2S Educação", "completion": "Dec 2025" }
  ]
}`;

export default function Home() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const parseJson = () => {
    let parsed: unknown;
    parsed = JSON.parse(jsonText);
    return parsed;
  };

  const fetchPdf = async (): Promise<Blob> => {
    setStatus(null);
    const parsed = parseJson();
    const res = await fetch("/api/render/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: parsed })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Erro ${res.status}`);
    }
    return res.blob();
  };

  const fetchPreviewHtml = async (): Promise<string> => {
    const parsed = parseJson();
    const res = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: parsed })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Erro ${res.status}`);
    }
    const json = await res.json();
    return json.html as string;
  };

  const handleDownload = async () => {
    try {
      parseJson();
    } catch {
      setStatus("JSON inválido. Confira a sintaxe.");
      return;
    }
    setLoading(true);
    try {
      const blob = await fetchPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("PDF gerado e baixado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    try {
      parseJson();
    } catch {
      setStatus("JSON inválido. Confira a sintaxe.");
      return;
    }
    setLoading(true);
    try {
      const blob = await fetchPdf();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("PDF gerado em nova aba.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setStatus(null);
    try {
      const blob = await fetchPdf();
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar preview";
      setStatus(message);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    // Gera preview inicial com sample
    handlePreview().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="layout">
      <div className="panel">
        <header>
          <p style={{ fontSize: 14, letterSpacing: 0.6, color: "#64748b", margin: 0 }}>
            CV ATS Generator
          </p>
          <h1 style={{ margin: "6px 0 8px", fontSize: 26, lineHeight: 1.2 }}>
            Cole seu JSON e baixe o PDF
          </h1>
          <p style={{ margin: 0, color: "#475569" }}>
            O template segue o modelo em texto simples. Edite o JSON e clique em gerar.
          </p>
        </header>

        <label style={{ fontWeight: 600, color: "#0f172a" }}>
          JSON do currículo
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              width: "100%",
              minHeight: 360,
              marginTop: 8,
              padding: 12,
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: 13,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              outline: "none",
              resize: "vertical",
              background: "#f8fafc"
            }}
          />
        </label>

        <div className="actions">
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#94a3b8" : "#0f172a",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(15,23,42,0.25)"
            }}
          >
            {loading ? "Gerando..." : "Baixar PDF"}
          </button>

          <button
            onClick={handleOpen}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #0f172a",
              background: loading ? "#e2e8f0" : "#fff",
              color: "#0f172a",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(15,23,42,0.12)"
            }}
          >
            {loading ? "Gerando..." : "Abrir em nova aba"}
          </button>

          <button
            onClick={handlePreview}
            disabled={previewLoading}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #1d4ed8",
              background: previewLoading ? "#e2e8f0" : "#eef2ff",
              color: "#1d4ed8",
              fontWeight: 600,
              cursor: previewLoading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(37, 99, 235, 0.18)"
            }}
          >
            {previewLoading ? "Atualizando..." : "Atualizar preview"}
          </button>
        </div>

        {status && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "#f1f5f9",
              color: status.toLowerCase().includes("erro") ? "#b91c1c" : "#0f172a",
              border: "1px solid #e2e8f0"
            }}
          >
            {status}
          </div>
        )}
      </div>

      <aside
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 12px 40px rgba(15,23,42,0.16)",
          border: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>Dicas</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Coloque todos os campos no JSON conforme o schema esperado.</li>
          <li>Você pode editar o JSON direto no campo e gerar o PDF na hora.</li>
          <li>Se o PDF não abrir, verifique o log do servidor (rota /api/render/pdf).</li>
        </ul>
        <h4 style={{ margin: "12px 0 6px" }}>Schema básico</h4>
        <pre
          style={{
            background: "#0b1224",
            color: "#e2e8f0",
            padding: 12,
            borderRadius: 12,
            fontSize: 12,
            overflow: "auto",
            border: "1px solid #1e293b"
          }}
        >
{`{
  name: string,
  title?: string,
  location?: string,
  email?: string,
  phone?: string,
  linkedin?: string,
  summary?: string,
  skills?: { [categoria]: string[] },
  experience?: [{ position?, company?, location?, period?, achievements?: string[] }],
  education?: [{ degree?, institution?, completion? }]
}`}
        </pre>
      </aside>

      <div className="panel preview">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12
          }}
        >
          <h3 style={{ margin: 0 }}>Preview (HTML)</h3>
        </div>
        {pdfUrl ? (
          <iframe
            title="Preview PDF"
            src={pdfUrl ?? undefined}
            style={{
              width: "100%",
              height: 520,
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#fff"
            }}
          />
        ) : (
          <div
            style={{
              height: 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8"
            }}
          >
            Sem preview gerado ainda.
          </div>
        )}
      </div>
      <style jsx>{`
        .layout {
          max-width: 1400px;
          margin: 32px auto 64px;
          padding: 0 24px;
          display: grid;
          gap: 24px;
          grid-template-columns: 1.1fr 0.9fr;
        }
        .panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .panel.preview {
          grid-column: 1 / -1;
          min-height: 500px;
          overflow: hidden;
        }
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        iframe {
          height: 650px;
        }
        @media (max-width: 1200px) {
          .layout {
            max-width: 1200px;
            grid-template-columns: 1fr 1fr;
          }
          iframe {
            height: 560px;
          }
        }
        @media (max-width: 960px) {
          .layout {
            grid-template-columns: 1fr;
            padding: 0 16px 48px;
          }
          .panel.preview {
            grid-column: auto;
          }
          iframe {
            height: 520px;
          }
        }
        @media (max-width: 600px) {
          .panel {
            padding: 14px;
          }
          iframe {
            height: 420px;
          }
        }
      `}</style>
    </main>
  );
}
