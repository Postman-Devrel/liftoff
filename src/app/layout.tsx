import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import LearnerOverlays from "@/components/LearnerOverlays";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "600",
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
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ProgressProvider>
            <LearnerOverlays />
            {children}
          </ProgressProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
