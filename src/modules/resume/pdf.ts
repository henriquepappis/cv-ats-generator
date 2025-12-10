import "server-only";
import PDFDocument from "pdfkit";
import type { ResumeInput } from "./schema";

export async function renderResumePdf(resume: ResumeInput): Promise<Buffer> {
  const options = { size: "A4", margins: { top: 28, bottom: 28, left: 28, right: 28 } as const };
  const scale = findScaleToFit(resume, options);
  const sizing = sizingWithScale(scale);

  const doc = new PDFDocument({ size: options.size, margins: options.margins });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const textWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Header
  doc.font("Helvetica-Bold").fontSize(sizing.header).text(resume.name || "", { align: "left", width: textWidth });
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(sizing.subHeader).text(resume.title || "", { align: "left", width: textWidth });
  doc.moveDown(0.2);
  const contacts = [resume.location, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ");
  doc.fontSize(sizing.body).text(contacts, { align: "left", width: textWidth });

  doc.moveDown(0.6);

  // Summary
  if (resume.summary) {
    sectionTitle(doc, "SUMMARY", sizing.title);
    doc.font("Helvetica").fontSize(sizing.body).text(resume.summary, { width: textWidth, lineGap: 1.3 });
    doc.moveDown(0.7);
  }

  // Skills
  if (resume.skills) {
    sectionTitle(doc, "SKILLS", sizing.title);
    doc.fontSize(sizing.body).font("Helvetica");
    Object.entries(resume.skills)
      .filter(([, items]) => items && items.length)
      .forEach(([key, items]) => {
        const label = keyToLabel(key);
        doc.font("Helvetica-Bold").text(`${label}:`, { continued: true, width: textWidth }).font("Helvetica").text(` ${(items as string[]).join(", ")}`);
      });
    doc.moveDown(0.7);
  }

  // Experience
  const experiences = resume.experience ?? [];
  if (experiences.length) {
    sectionTitle(doc, "EXPERIENCE", sizing.title);
    experiences.forEach((exp, idx) => {
      doc.font("Helvetica-Bold").fontSize(sizing.body).text(`${exp.position ?? ""} - ${exp.company ?? ""} (${exp.location ?? ""})`, { width: textWidth });
      doc.font("Helvetica").fontSize(sizing.body).text(exp.period ?? "", { width: textWidth });
      if (exp.achievements?.length) {
        exp.achievements.forEach((ach) => {
          doc.text(`- ${ach}`, { lineGap: 1.1, width: textWidth });
        });
      }
      if (idx < experiences.length - 1) {
        doc.moveDown(0.7);
      }
    });
    doc.moveDown(0.9);
  }

  // Education
  if (resume.education?.length) {
    sectionTitle(doc, "EDUCATION", sizing.title);
    resume.education.forEach((edu) => {
      doc.font("Helvetica-Bold").fontSize(sizing.body).text(`${edu.degree ?? ""} - ${edu.institution ?? ""}`, { width: textWidth });
      doc.font("Helvetica").fontSize(sizing.body).text(edu.completion ?? "", { width: textWidth });
    });
    doc.moveDown(0.6);
  }

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, size: number) {
  doc.font("Helvetica-Bold").fontSize(size).text(title);
}

function keyToLabel(key: string): string {
  const map: Record<string, string> = {
    languages: "Languages",
    frameworks: "Frameworks",
    backend: "Backend",
    databases: "Databases",
    devops: "DevOps",
    tools: "Tools",
    principles: "Principles",
    other: "Other"
  };
  return map[key] ?? key;
}

function sizingWithScale(scale: number) {
  return {
    header: 13 * scale,
    subHeader: 11 * scale,
    body: 11 * scale,
    title: 12 * scale
  };
}

function findScaleToFit(resume: ResumeInput, options: { size: string; margins: { top: number; bottom: number; left: number; right: number } }) {
  let scale = 1;
  const minScale = 0.8;
  const step = 0.05;

  while (scale >= minScale) {
    const sizing = sizingWithScale(scale);
    const estimated = estimateHeight(resume, sizing, options);
    const availableHeight = heightAvailable(options);
    if (estimated <= availableHeight) {
      return scale;
    }
    scale -= step;
  }
  return minScale;
}

function heightAvailable(options: { size: string; margins: { top: number; bottom: number } }) {
  // A4 height in points = 842 (approx). PDFKit uses points.
  const pageHeight = new PDFDocument({ size: options.size }).page.height;
  return pageHeight - options.margins.top - options.margins.bottom;
}

function estimateHeight(resume: ResumeInput, sizing: { header: number; subHeader: number; body: number; title: number }, options: { size: string; margins: { top: number; bottom: number; left: number; right: number } }) {
  const doc = new PDFDocument({ size: options.size, margins: options.margins });
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let h = 0;

  const lineHeight = (text: string | undefined, size: number, lineGap = 0) => {
    doc.font("Helvetica").fontSize(size);
    return doc.heightOfString(text ?? "", { width, lineGap });
  };
  const lineHeightBold = (text: string | undefined, size: number) => {
    doc.font("Helvetica-Bold").fontSize(size);
    return doc.heightOfString(text ?? "", { width });
  };
  const gap = (mult: number, size: number) => mult * size;

  // Header
  h += lineHeightBold(resume.name, sizing.header);
  h += gap(0.2, sizing.subHeader);
  h += lineHeight(resume.title, sizing.subHeader);
  h += gap(0.2, sizing.subHeader);
  const contacts = [resume.location, resume.email, resume.phone, resume.linkedin].filter(Boolean).join(" | ");
  h += lineHeight(contacts, sizing.body);
  h += gap(0.6, sizing.body);

  // Summary
  if (resume.summary) {
    h += lineHeightBold("SUMMARY", sizing.title);
    h += lineHeight(resume.summary, sizing.body, 1.3);
    h += gap(0.7, sizing.body);
  }

  // Skills
  if (resume.skills) {
    h += lineHeightBold("SKILLS", sizing.title);
    Object.entries(resume.skills)
      .filter(([, items]) => items && items.length)
      .forEach(([key, items]) => {
        const label = keyToLabel(key);
        const text = `${label}: ${(items as string[]).join(", ")}`;
        h += lineHeight(text, sizing.body);
      });
    h += gap(0.7, sizing.body);
  }

  // Experience
  const experiences = resume.experience ?? [];
  if (experiences.length) {
    h += lineHeightBold("EXPERIENCE", sizing.title);
    experiences.forEach((exp, idx) => {
      h += lineHeightBold(`${exp.position ?? ""} - ${exp.company ?? ""} (${exp.location ?? ""})`, sizing.body);
      h += lineHeight(exp.period, sizing.body);
      if (exp.achievements?.length) {
        exp.achievements.forEach((ach) => {
          h += lineHeight(`- ${ach}`, sizing.body, 1.1);
        });
      }
      if (idx < experiences.length - 1) {
        h += gap(0.7, sizing.body);
      }
    });
    h += gap(0.9, sizing.body);
  }

  // Education
  if (resume.education?.length) {
    h += lineHeightBold("EDUCATION", sizing.title);
    resume.education.forEach((edu) => {
      h += lineHeightBold(`${edu.degree ?? ""} - ${edu.institution ?? ""}`, sizing.body);
      h += lineHeight(edu.completion, sizing.body);
    });
    h += gap(0.6, sizing.body);
  }

  doc.end();
  return h;
}
