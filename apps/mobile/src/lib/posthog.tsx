import React, { createContext, useContext, useEffect, useState } from "react";
import PostHog from "posthog-react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

type PostHogContextType = {
  posthog: PostHog | null;
};

const PostHogContext = createContext<PostHogContextType>({ posthog: null });

export function usePostHog() {
  return useContext(PostHogContext);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [posthog, setPostHog] = useState<PostHog | null>(null);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn("PostHog key not configured");
      return;
    }

    const client = new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      enableSessionReplay: true,
      sessionReplayConfig: {
        maskAllTextInputs: true,
        maskAllImages: false,
      },
    });

    setPostHog(client);

    return () => {
      client.shutdown();
    };
  }, []);

  // Identify user when auth state changes
  useEffect(() => {
    if (!posthog) return;

    if (isSignedIn && userId) {
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress ?? null,
        name: user?.fullName ?? null,
      });
    } else if (!isSignedIn) {
      posthog.reset();
    }
  }, [posthog, isSignedIn, userId, user]);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}
