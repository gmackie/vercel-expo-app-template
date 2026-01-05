const APP_VARIANT = process.env.APP_VARIANT ?? "production";
const IS_DEV = APP_VARIANT === "development";
const IS_STAGING = APP_VARIANT === "staging";
const IS_PROD = APP_VARIANT === "production";

// TODO: Update these values for your app after running ./scripts/setup.sh
const APP_NAME = "My App";
const APP_SLUG = "my-app";
const BUNDLE_ID_BASE = "com.example.myapp";
const PROJECT_ID = "your-eas-project-id";
const OWNER = "your-expo-username";

// Backend URL resolution (priority order):
// 1. EXPO_PUBLIC_API_URL (ngrok tunnel for local dev)
// 2. EXPO_PUBLIC_BACKEND_URL (set in eas.json per profile)
// 3. Fallback based on variant
const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (process.env.EXPO_PUBLIC_BACKEND_URL) return process.env.EXPO_PUBLIC_BACKEND_URL;
  if (IS_STAGING) return "https://beta.demo.apps.gmac.io";
  if (IS_PROD) return "https://demo.apps.gmac.io";
  return "http://localhost:3000";
};

// Bundle ID varies by environment for side-by-side installs
const getBundleId = () => {
  if (IS_DEV) return `${BUNDLE_ID_BASE}.dev`;
  if (IS_STAGING) return `${BUNDLE_ID_BASE}.staging`;
  return BUNDLE_ID_BASE;
};

// App name shows environment in non-prod builds
const getAppName = () => {
  if (IS_DEV) return `${APP_NAME} Dev`;
  if (IS_STAGING) return `${APP_NAME} Staging`;
  return APP_NAME;
};

// URL scheme for deep linking
const getScheme = () => {
  if (IS_DEV) return `${APP_SLUG}-dev`;
  if (IS_STAGING) return `${APP_SLUG}-staging`;
  return APP_SLUG;
};

// Icon per environment (create assets/icon-staging.png for visual distinction)
const getIcon = () => {
  if (IS_STAGING) return "./assets/icon-staging.png";
  return "./assets/icon.png";
};

export default {
  expo: {
    name: getAppName(),
    slug: APP_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    icon: getIcon(),
    userInterfaceStyle: "automatic",
    scheme: getScheme(),
    newArchEnabled: true,

    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleId(),
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
      package: getBundleId(),
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
      appVariant: APP_VARIANT,
      backendUrl: getBackendUrl(),
      backendUrlStaging: "https://beta.demo.apps.gmac.io",
      backendUrlProd: "https://demo.apps.gmac.io",
    },

    owner: OWNER,

    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`,
    },
  },
};
