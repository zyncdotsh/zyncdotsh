import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Zync",
  description: "Privacy-first ecosystem for the paranoid",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Zync",
    description: "Privacy-first ecosystem for the paranoid",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white" style={{ fontFamily: 'Rubik, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
