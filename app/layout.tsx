import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlowOpta – RFP Requirements Builder",
  description:
    "Create, customize, analyze, and export healthcare RFPs efficiently. Built-in HIPAA and FHIR awareness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} min-h-screen antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
