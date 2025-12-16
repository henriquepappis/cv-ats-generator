import type { ResumeInput } from "./schema";

function section(title: string, content: string | null) {
  if (!content) return "";
  return `
    <section class="section">
      <h2>${title}</h2>
      ${content}
    </section>
  `;
}

export function renderResumeHtml(resume: ResumeInput): string {
  const contactLine = [resume.location, resume.email, resume.phone].filter(Boolean).join(" • ");

  const links = resume.linkedin ? `<div class="links">${resume.linkedin}</div>` : "";

  const summary = resume.summary ? `<p class="block">${resume.summary}</p>` : "";

  const experiences =
    resume.experience?.length
      ? resume.experience
          .map(
            (exp) => `
        <div class="item">
          <div class="item-header">
            <strong>${exp.position ?? ""}</strong>
            <span>${exp.company ?? ""}</span>
          </div>
          <div class="meta">
            <span>${exp.location ?? ""}</span>
            <span>${exp.period ?? ""}</span>
          </div>
          ${
            exp.achievements?.length
              ? `<ul>${exp.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>`
              : ""
          }
        </div>
      `
          )
          .join("")
      : "";

  const education =
    resume.education?.length
      ? resume.education
          .map(
            (edu) => `
        <div class="item">
          <div class="item-header">
            <strong>${edu.degree ?? ""}</strong>
            <span>${edu.institution ?? ""}</span>
          </div>
          <div class="meta">
            <span>${edu.completion ?? ""}</span>
          </div>
        </div>
      `
          )
          .join("")
      : "";

  const skillsBlocks = resume.skills
    ? Object.entries(resume.skills)
        .filter(([, items]) => items && items.length)
        .map(
          ([category, items]) => `
      <div class="item">
        <div class="item-header">
          <strong>${categoryLabel(category)}</strong>
        </div>
        <ul class="chips">${(items as string[]).map((i) => `<li>${i}</li>`).join("")}</ul>
      </div>
    `
        )
        .join("")
    : "";

  const projects =
    resume.projects?.length
      ? resume.projects
          .map((project) => {
            const links = [project.url ? `<a href="${project.url}">Live</a>` : null, project.github ? `<a href="${project.github}">GitHub</a>` : null]
              .filter(Boolean)
              .join(" · ");
            const technologies = project.technologies?.length
              ? `<ul class="chips">${project.technologies.map((t) => `<li>${t}</li>`).join("")}</ul>`
              : "";

            return `
        <div class="item">
          <div class="item-header">
            <strong>${project.name ?? ""}</strong>
            <span>${links}</span>
          </div>
          ${project.description ? `<p class="block">${project.description}</p>` : ""}
          ${technologies}
        </div>
      `;
          })
          .join("")
      : "";

  return `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        :root {
          font-family: "Helvetica", Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .page {
          max-width: 800px;
          margin: 0 auto;
          padding: 28px;
        }
        header {
          margin-bottom: 12px;
        }
        header h1 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
        }
        .subtitle {
          color: #0f172a;
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 600;
        }
        .links {
          color: #0f172a;
          font-size: 12px;
        }
        .section {
          margin-bottom: 14px;
        }
        .section h2 {
          margin: 0 0 6px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #0f172a;
          font-weight: 700;
        }
        .item {
          margin-bottom: 8px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          gap: 8px;
          font-size: 12px;
        }
        .item-header span {
          color: #0f172a;
          font-weight: 700;
        }
        .meta {
          display: flex;
          gap: 12px;
          color: #0f172a;
          font-size: 11px;
          flex-wrap: wrap;
        }
        ul {
          margin: 6px 0 0 16px;
          padding: 0;
          font-size: 11px;
          line-height: 1.35;
        }
        .chips {
          list-style: none;
          padding: 0;
          margin: 0;
          display: block;
          font-size: 11px;
          line-height: 1.35;
        }
        .chips li {
          display: inline;
        }
        p,
        .block {
          margin: 0 0 8px;
          color: #0f172a;
          line-height: 1.35;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <header>
          <h1>${resume.name}</h1>
          ${resume.title ? `<div class="subtitle">${resume.title}</div>` : ""}
          <div class="subtitle">${contactLine}</div>
          ${links}
        </header>

        ${section("Resumo", summary || null)}
        ${section("Experiência", experiences || null)}
        ${section("Projetos", projects || null)}
        ${section("Educação", education || null)}
        ${section("Skills", skillsBlocks || null)}
      </div>
    </body>
  </html>
  `;
}

function categoryLabel(key: string): string {
  const map: Record<string, string> = {
    languages: "Linguagens",
    frameworks: "Frameworks",
    backend: "Backend",
    databases: "Bancos de Dados",
    devops: "DevOps",
    tools: "Ferramentas",
    principles: "Princípios",
    other: "Outros"
  };
  return map[key] ?? key;
}
