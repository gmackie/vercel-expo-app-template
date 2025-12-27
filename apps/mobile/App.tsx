import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";

// Initialize Sentry before anything else
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <Text style={styles.subtitle}>Built with Expo + tRPC</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <HomeScreen />
        </TRPCProvider>
      </PostHogProvider>
    </AuthProvider>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
