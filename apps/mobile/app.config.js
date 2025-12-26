const IS_DEV = process.env.APP_VARIANT === "development";

// =============================================================================
// App Configuration
// =============================================================================
// This template supports three environments:
//
// 1. Local Development (Expo Go or dev client)
//    - Uses ngrok tunnel for API access
//    - Run with: pnpm dev:mobile (from root) or ./scripts/dev-mobile.sh
//
// 2. Beta/Internal (EAS Development build)
//    - Uses internal distribution with ad-hoc signing
//    - Separate bundle ID (*.dev) for side-by-side install
//    - Build with: eas build --profile development --platform ios
//
// 3. Production (EAS Production build)
//    - For App Store / Play Store submission
//    - Build with: eas build --profile production --platform all
// =============================================================================

// =============================================================================
// TODO: Update these values for your app after running ./scripts/setup.sh
// =============================================================================
const APP_NAME = "My App";
const APP_SLUG = "my-app";
const BUNDLE_ID_BASE = "com.example.myapp"; // e.g., "com.yourcompany.yourapp"
const PROJECT_ID = "your-eas-project-id"; // Run: eas init
const OWNER = "your-expo-username"; // Your Expo username

export default {
  expo: {
    // App name - shows as "AppName-Dev" for development builds
    name: IS_DEV ? `${APP_NAME} Dev` : APP_NAME,
    slug: APP_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: IS_DEV ? `${APP_SLUG}-dev` : APP_SLUG,
    newArchEnabled: true,

    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      // Different bundle ID for dev allows side-by-side installation
      bundleIdentifier: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      buildNumber: "1",
      infoPlist: {
        // Add any required permissions here
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      // Different package name for dev allows side-by-side installation
      package: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      versionCode: 1,
    },

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-splash-screen",
      // Add other plugins here as needed:
      // "expo-camera",
      // "expo-notifications",
      // etc.
    ],

    extra: {
      eas: {
        projectId: PROJECT_ID,
      },
      // Environment indicator for debugging
      appVariant: process.env.APP_VARIANT ?? "production",
    },

    owner: OWNER,

    // EAS Update configuration
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`,
    },
  },
};
