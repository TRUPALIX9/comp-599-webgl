import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebGL Academic Presentation",
  description: "Six live Three.js slides for a WebGL seminar (COMP 599 research presentation)."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
