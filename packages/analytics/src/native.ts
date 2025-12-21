import PostHog from "posthog-react-native";
import type { AnalyticsEvent, EventProperties } from "./events.js";

let client: PostHog | null = null;

export async function initAnalytics() {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) {
    console.warn("PostHog key not configured");
    return;
  }

  client = await PostHog.initAsync(key, {
    host: "https://us.i.posthog.com",
  });
}

export function identify(userId: string, properties?: EventProperties) {
  client?.identify(userId, properties);
}

export function track(event: AnalyticsEvent, properties?: EventProperties) {
  client?.capture(event, properties);
}

export function reset() {
  client?.reset();
}
