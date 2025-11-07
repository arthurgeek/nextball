import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextBall - Football Manager",
  description: "Realistic football management simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-200">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
