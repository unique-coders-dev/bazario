import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Bazario - Fresh Groceries Delivered",
  description: "Premium grocery delivery platform - Fresh vegetables, fish, meat, rice & oil delivered to your doorstep",
  keywords: "grocery, vegetables, fish, meat, rice, oil, delivery, online shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}