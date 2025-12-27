"use client";

import React from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { PostHogPageview } from "./pageview";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn("PostHog key not configured");
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false, // We handle this manually for SPA
      capture_pageleave: true,
      autocapture: true,
      enable_recording_console_log: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
    });
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageview />
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PHProvider>
  );
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && userId) {
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      });
    } else if (!isSignedIn) {
      posthog.reset();
    }
  }, [isSignedIn, userId, user]);

  return <>{children}</>;
}
