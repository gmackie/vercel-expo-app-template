import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";
import { I18nProvider, useTranslations } from "@repo/i18n/native";
import { StoreProvider } from "@repo/store/native";

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
  const t = useTranslations("home");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.subtitle}>{t("subtitle")}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <I18nProvider>
            <StoreProvider>
              <HomeScreen />
            </StoreProvider>
          </I18nProvider>
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
