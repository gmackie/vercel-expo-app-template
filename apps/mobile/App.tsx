import "./global.css";
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, View } from "react-native";
import { useState } from "react";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";
import { I18nProvider } from "@repo/i18n/native";
import { StoreProvider } from "@repo/store/native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { Button, ButtonText } from "@repo/ui-native";

// Initialize Sentry before anything else
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

function App() {
  const [activeTab, setActiveTab] = useState<"home" | "settings">("home");

  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <I18nProvider>
            <StoreProvider>
              <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 bg-gray-50">
                  {activeTab === "home" ? <HomeScreen /> : <SettingsScreen />}
                </View>
                <View className="flex-row border-t border-gray-200 bg-white p-2">
                  <Button
                    variant="ghost"
                    className={`flex-1 ${activeTab === "home" ? "bg-gray-100" : ""}`}
                    onPress={() => setActiveTab("home")}
                  >
                    <ButtonText className={activeTab === "home" ? "text-blue-600" : "text-gray-500"}>
                      Home
                    </ButtonText>
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex-1 ${activeTab === "settings" ? "bg-gray-100" : ""}`}
                    onPress={() => setActiveTab("settings")}
                  >
                    <ButtonText className={activeTab === "settings" ? "text-blue-600" : "text-gray-500"}>
                      Settings
                    </ButtonText>
                  </Button>
                </View>
                <StatusBar style="auto" />
              </SafeAreaView>
            </StoreProvider>
          </I18nProvider>
        </TRPCProvider>
      </PostHogProvider>
    </AuthProvider>
  );
}

export default Sentry.wrap(App);
