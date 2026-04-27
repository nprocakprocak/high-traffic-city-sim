import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "High traffic city simulator",
  description:
    "A demo application showing how to handle heavy WebSocket traffic and displaying real time updated dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
