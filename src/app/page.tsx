"use client";

import { useEffect, useState } from "react";

type ResumeItem = {
  id: number;
  name: string;
  company?: string | null;
  updatedAt: string;
  content?: unknown;
};

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [resumeName, setResumeName] = useState("curriculo.pdf");
  const [resumeCompany, setResumeCompany] = useState("");
  const [resumes, setResumes] = useState<ResumeItem[]>([]);

  const parseJson = () => {
    return JSON.parse(jsonText);
  };

  const fetchPdf = async (resumeContent?: unknown): Promise<Blob> => {
    setStatus(null);
    const parsed = resumeContent ?? parseJson();
    const res = await fetch("/api/render/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ resume: parsed })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Erro ${res.status}`);
    }
    return res.blob();
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
      a.download = resumeName || "resume.pdf";
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

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setResumes(data.templates ?? []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    handlePreview().catch(() => {});
    fetchResumes().catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoggingOut(false);
      window.location.href = "/login";
    }
  };

  const handleSaveResume = async () => {
    setStatus(null);
    try {
      const parsed = parseJson();
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: resumeName || "curriculo.pdf",
          company: resumeCompany || undefined,
          content: parsed
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erro ${res.status}`);
      }
      setStatus("Currículo salvo.");
      await fetchResumes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar currículo";
      setStatus(message);
    }
  };

  const handleLoadResume = (resume: ResumeItem) => {
    setResumeName(resume.name);
    setResumeCompany(resume.company ?? "");
    if (resume.content) {
      setJsonText(JSON.stringify(resume.content, null, 2));
    }
    setStatus(`Currículo "${resume.name}" carregado.`);
    handlePreview().catch(() => {});
  };

  const handleDeleteResume = async (id: number) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erro ${res.status}`);
      }
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setStatus("Currículo removido.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover";
      setStatus(message);
    }
  };

  const handleDownloadResume = async (resume: ResumeItem) => {
    try {
      const content = resume.content ?? parseJson();
      const blob = await fetchPdf(content);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resume.name || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
      setStatus(message);
    }
  };

  return (
    <main className="layout">
      <div className="panel">
        <header>
          <div className="header-top">
            <div>
              <p style={{ fontSize: 14, letterSpacing: 0.6, color: "#64748b", margin: 0 }}>
                CV ATS Generator
              </p>
              <h1 style={{ margin: "6px 0 8px", fontSize: 26, lineHeight: 1.2 }}>
                Cole seu JSON, salve e baixe o PDF
              </h1>
              <p style={{ margin: 0, color: "#475569" }}>
                Defina o nome do currículo, empresa opcional, salve e gere o PDF.
              </p>
            </div>
            <button className="logout" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </header>

        <label style={{ fontWeight: 600, color: "#0f172a" }}>
          Nome do currículo (PDF)
          <input
            type="text"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#f8fafc"
            }}
          />
        </label>

        <label style={{ fontWeight: 600, color: "#0f172a" }}>
          Empresa (opcional)
          <input
            type="text"
            value={resumeCompany}
            onChange={(e) => setResumeCompany(e.target.value)}
            placeholder="Ex.: Acme Corp"
            style={{
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#f8fafc"
            }}
          />
        </label>

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
            onClick={handleSaveResume}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #16a34a",
              background: loading ? "#e2e8f0" : "#dcfce7",
              color: "#166534",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(22, 101, 52, 0.18)"
            }}
          >
            {loading ? "Salvando..." : "Salvar currículo"}
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

      <aside className="panel dark">
        <h3 style={{ margin: 0, fontSize: 18 }}>Dicas</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Coloque todos os campos no JSON conforme o schema esperado.</li>
          <li>Edite o JSON, salve e gere o PDF. Defina o nome do arquivo e a empresa.</li>
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

      <div className="panel decoy saved">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <h3 style={{ margin: 0 }}>Currículos salvos</h3>
          <span style={{ color: "#64748b", fontSize: 13 }}>Carregue, baixe ou exclua</span>
        </div>
        {resumes.length ? (
          <div
            className="resume-list"
            style={{
              maxHeight: Math.min(resumes.length * 88, 320),
              overflowY: resumes.length > 3 ? "auto" : "visible",
              paddingRight: resumes.length > 3 ? 4 : 0
            }}
          >
            {resumes.map((r) => (
              <div key={r.id} className="resume-item">
                <div>
                  <div className="resume-name">{r.name}</div>
                  <div className="resume-meta">
                    {r.company ? `${r.company} • ` : ""}
                    {new Date(r.updatedAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="resume-actions">
                  <button onClick={() => handleLoadResume(r)}>Carregar</button>
                  <button onClick={() => handleDownloadResume(r)}>Baixar PDF</button>
                  <button onClick={() => handleDeleteResume(r.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94a3b8", padding: "6px 0" }}>
            Nenhum currículo salvo ainda.
          </div>
        )}
      </div>

      <div className="panel preview-pdf">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}
        >
          <h3 style={{ margin: 0 }}>Preview (PDF)</h3>
        </div>
        {pdfUrl ? (
          <iframe
            title="Preview PDF"
            src={pdfUrl ?? undefined}
            style={{
              width: "100%",
              height: 650,
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
          align-items: start;
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
          overflow: hidden;
        }
        .panel.saved {
          grid-column: 1 / -1;
          padding: 12px 14px;
          min-height: 200px;
        }
        .panel.preview-pdf {
          grid-column: 1 / -1;
          min-height: 0;
          overflow: hidden;
          padding-bottom: 12px;
        }
        .panel.dark {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #1e293b;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
        }
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }
        .logout {
          padding: 10px 12px;
          border: 1px solid #0f172a;
          border-radius: 10px;
          background: #fff;
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
        }
        .logout[disabled] {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .resume-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .resume-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          flex-wrap: wrap;
          gap: 8px;
        }
        .resume-name {
          font-weight: 700;
          color: #0f172a;
        }
        .resume-meta {
          color: #64748b;
          font-size: 12px;
        }
        .resume-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .resume-actions button {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #fff;
          cursor: pointer;
          font-weight: 600;
        }
        @media (max-width: 1200px) {
          .layout {
            max-width: 1200px;
            grid-template-columns: 1fr 1fr;
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
        }
        @media (max-width: 600px) {
          .layout {
            padding: 0 10px 48px;
          }
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
