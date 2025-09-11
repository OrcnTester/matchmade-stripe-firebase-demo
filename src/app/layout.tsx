import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/header";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MatchMade Demo",
  description: "Events • Tickets • Survey • Matches",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-dvh bg-gray-50 text-gray-900 antialiased`}
      >
        <Header />
        <main className="mx-auto max-w-3xl p-4">{children}</main>
      </body>
    </html>
  );
}
