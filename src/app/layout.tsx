import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import CelebrationOverlay from "@/components/scoring/CelebrationOverlay";
import ImportProgressModal from "@/components/auth/ImportProgressModal";
import DiscordCommunityModal from "@/components/auth/DiscordCommunityModal";
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
  title: "LiftOff — Learn APIs by Doing",
  description: "Interactive learning modules with real-time Postman API validation",
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
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ProgressProvider>
            <CelebrationOverlay />
            <ImportProgressModal />
            <DiscordCommunityModal />
            {children}
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
