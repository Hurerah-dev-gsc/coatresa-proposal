import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Propuesta GSC x COATRESA",
  description: "Una colaboración para mapear las oportunidades de IA - Genai Sapiens Consulting",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
