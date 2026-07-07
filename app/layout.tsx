import type { Metadata } from "next";
import "./globals.css";
import FeedbackChatClient from "./feedback-chat-client";

export const metadata: Metadata = {
  title: "adsManager",
  description: "Organize, browse and analyze my Meta ads — stats, creatives, trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}
        <FeedbackChatClient />
</body>
    </html>
  );
}
