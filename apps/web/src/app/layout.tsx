import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js + Expo",
};

function Providers({ children }: { children: React.ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <PostHogProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </PostHogProvider>
    );
  }

  return (
    <ClerkProvider>
      <PostHogProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </PostHogProvider>
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
