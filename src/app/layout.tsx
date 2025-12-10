import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV ATS Generator",
  description: "Monolito modular para currículos ATS-friendly"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
