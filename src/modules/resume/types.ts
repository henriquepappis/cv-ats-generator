export type ResumeContact = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
};

export type ResumeExperience = {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: string;
};

export type ResumeEducation = {
  institution?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  details?: string;
  location?: string;
};

export type ResumeSkill = {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  keywords?: string[];
};

export type ResumeLanguage = {
  name: string;
  proficiency?: "basic" | "conversational" | "professional" | "native";
};

export type ResumeNormalized = {
  contact: ResumeContact;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  summary?: string;
};

export type ResumeVersion = {
  id: string;
  sourceFileId: string;
  rawText: string;
  normalized: ResumeNormalized;
  createdAt: Date;
  model?: string;
  costInUsd?: number;
};

export type ParsedFileMetadata = {
  filename: string;
  mimeType: string;
  size: number;
  source: "pdf" | "docx" | "doc" | "json";
};
