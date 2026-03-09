import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mzansi-speak.com"),
  title: "Mzansi-Speak | South African AI Voices TTS",
  description: "High-quality South African text-to-speech engine using Kokoro-82M.",
  keywords: ["TTS", "South Africa", "AI Voice", "Kokoro-82M", "Text to Speech"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Mzansi-Speak | South African AI Voices TTS",
    description: "High-quality South African text-to-speech engine using Kokoro-82M.",
    url: "https://mzansi-speak.com",
    siteName: "Mzansi-Speak",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mzansi-Speak Playground",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mzansi-Speak | South African AI Voices TTS",
    description: "High-quality South African text-to-speech engine using Kokoro-82M.",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
