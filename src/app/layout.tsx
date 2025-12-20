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
      <head>
        <script
          defer
          src="https://analytics.henriquepappis.com/script.js"
          data-website-id="78be6406-0132-44fc-be79-4ab06081e567"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
