import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
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
  title: "Job Finder - Votre assistant intelligent pour l'emploi",
  description: "Générateur de CV, lettres de motivation et recherche d'emploi avec IA",
};

import { CVsProvider } from './modules/cv/utils/cvs-context'
import { CoverLettersProvider } from './modules/lettre/utils/cover-letters-context'
import { UserProvider } from './modules/user-context'

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="fr">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Navigation />
            <CVsProvider>
              <CoverLettersProvider>
                {children}
              </CoverLettersProvider>
            </CVsProvider>
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  );
}
