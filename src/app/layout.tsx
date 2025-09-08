import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainNav } from "../components/main-nav";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BRiX Admin Panel",
  description: "Admin panel for BRiX crypto dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full bg-slate-900">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100 h-full`}>
          <div className="min-h-screen">
            <header className="border-b border-slate-800">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold">BRiX Admin</h1>
                  <MainNav />
                </div>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
