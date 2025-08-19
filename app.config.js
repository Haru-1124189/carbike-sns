export default {
  expo: {
    name: "carbike-sns",
    slug: "carbike-sns",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "carbikesns",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      NEXT_PUBLIC_FB_API_KEY: process.env.NEXT_PUBLIC_FB_API_KEY || "AIzaSyDPFyH8WWB7boK0s_DsIseBfvwPauM3A7Q",
      NEXT_PUBLIC_FB_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN || "carbaike-sns.firebaseapp.com",
      NEXT_PUBLIC_FB_PROJECT_ID: process.env.NEXT_PUBLIC_FB_PROJECT_ID || "carbaike-sns",
      NEXT_PUBLIC_FB_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || "carbaike-sns.firebasestorage.app",
      NEXT_PUBLIC_FB_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID || "794823967964",
      NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID || "1:794823967964:web:65bd6acde871f7a8072019"
    }
  }
};
