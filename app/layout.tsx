import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

// Force dynamic rendering since Header uses cookies for session
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Weblogin Auth SDK Example",
  description: "A complete example showcasing the Weblogin Auth SDK features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen bg-gray-900 text-white font-sans"
      >
        <div className="max-w-6xl mx-auto p-8">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
