import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WON - Entrenar sin complicarte",
  description: "Planes simples, hechos a tu medida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent Ethereum injection errors
              if (typeof window !== 'undefined' && window.ethereum) {
                try {
                  // Prevent extensions from setting selectedAddress to undefined
                  Object.defineProperty(window.ethereum, 'selectedAddress', {
                    set: function(value) {
                      this._selectedAddress = value;
                    },
                    get: function() {
                      return this._selectedAddress;
                    },
                    configurable: true
                  });
                } catch (e) {
                  // Silently ignore if we can't override
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden flex flex-col`}
      >
        <Providers>
          <Suspense fallback={<div className="w-full py-2 bg-white border-b border-gray-200 h-16" />}>
            <Header />
          </Suspense>
          <main className="flex-1 bg-black overflow-y-auto">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
