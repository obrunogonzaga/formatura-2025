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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

