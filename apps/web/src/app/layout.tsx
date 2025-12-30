import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import { PostHogProvider } from "@/lib/posthog";
import { StoreProvider } from "@repo/store/web";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js + Expo",
};

async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>
            <StoreProvider>{children}</StoreProvider>
          </IntlProvider>
        </TRPCProvider>
      </PostHogProvider>
    );
  }

  return (
    <ClerkProvider>
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>
            <StoreProvider>{children}</StoreProvider>
          </IntlProvider>
        </TRPCProvider>
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
