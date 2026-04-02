import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { AppProvider } from "@/providers/app-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "WerkstattCRM",
  description:
    "Sicheres CRM fuer Handwerksbetriebe und kleine Unternehmen mit Supabase und Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${jakarta.variable} ${fraunces.variable} font-sans antialiased`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
