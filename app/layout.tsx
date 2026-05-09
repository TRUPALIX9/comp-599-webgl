import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COMP 599 WebGL Showcase",
  description: "Integrated WebGL capability showcase for the COMP 599 research presentation."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
