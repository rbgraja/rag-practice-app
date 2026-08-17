import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackgroundOrbs } from "@/components/ui/BackgroundOrbs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG AI — Practice App",
  description: "A practice Retrieval-Augmented Generation app built on Supabase + pgvector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <BackgroundOrbs />
        {children}
      </body>
    </html>
  );
}
