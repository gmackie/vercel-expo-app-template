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
      bundleIdentifier: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      buildNumber: "1",
      associatedDomains: [
        `applinks:${process.env.EXPO_PUBLIC_APP_DOMAIN ?? "example.com"}`,
      ],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "This app uses the camera to take photos.",
        NSPhotoLibraryUsageDescription: "This app accesses your photos to upload images.",
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      versionCode: 1,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: process.env.EXPO_PUBLIC_APP_DOMAIN ?? "example.com",
              pathPrefix: "/app",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-splash-screen",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
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
