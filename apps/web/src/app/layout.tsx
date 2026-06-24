import * as React from "react";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "../components/providers";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "VentureForge AI — From Idea to Investor-Ready Business in Minutes",
  description:
    "AI-powered startup intelligence & business operating system for Indian founders. Transform any idea into a validated, legally structured, operationally ready, investor-grade business blueprint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols for icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} font-body antialiased bg-background text-on-background min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
