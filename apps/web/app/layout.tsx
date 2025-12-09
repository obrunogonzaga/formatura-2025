import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulário de Fotos - Formatura 2025",
  description:
    "Envie as fotos das crianças para compor o vídeo de formatura. Informe o responsável e os filhos, com 3 fotos por criança."
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

