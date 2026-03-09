import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mzansi-speak.com"),
  title: "Mzansi-Speak | South African AI Voices TTS",
  description: "High-quality South African text-to-speech engine using Kokoro-82M.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Mzansi-Speak | South African AI Voices TTS",
    description: "High-quality South African text-to-speech engine using Kokoro-82M.",
    url: "https://mzansi-speak.com",
    siteName: "Mzansi-Speak",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
