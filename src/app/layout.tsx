import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura AI",
  description: "Assistente Inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}