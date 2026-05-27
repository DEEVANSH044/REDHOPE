import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "redhope",
  description: "Real-Time Blood Donation & Inventory Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>{children}</UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
