import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
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
        className={`${inter.variable} font-sans antialiased h-screen overflow-hidden flex flex-col`}
      >
        <Providers>
          <Suspense fallback={<div className="w-full py-2 bg-white border-b border-gray-200 h-16" />}>
          </Suspense>
          <main className="flex-1 overflow-y-auto bg-white">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
