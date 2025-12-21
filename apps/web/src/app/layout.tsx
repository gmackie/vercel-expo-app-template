import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "Next.js + Expo Monorepo",
};

function Providers({ children }: { children: ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <TRPCProvider>{children}</TRPCProvider>;
  }

  return (
    <ClerkProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
