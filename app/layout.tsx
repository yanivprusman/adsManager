import type { Metadata } from "next";
import { Rubik, Suez_One } from "next/font/google";
import "./globals.css";
import FeedbackChatClient from "./feedback-chat-client";
import Nav from "./_components/nav";
import { loadSnapshot } from "@/lib/ads/data";
import { fmtDateTime } from "@/lib/ads/format";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
});

const suez = Suez_One({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-suez",
});

export const metadata: Metadata = {
  title: "Ads Desk",
  description: "Organize, browse and analyze my Meta ads — stats, creatives, trends",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = await loadSnapshot();
  return (
    <html lang="en" className={`${rubik.variable} ${suez.variable}`}>
      <body>
        <Nav fetchedAt={fmtDateTime(snapshot.fetchedAt)} />
        <main className="mx-auto max-w-6xl px-5 pb-24 pt-8">{children}</main>
        <FeedbackChatClient />
      </body>
    </html>
  );
}
