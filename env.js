// env.js
import Constants from "expo-constants";

const ENV = {
  development: {
    API_URL: "http://192.168.1.92:3000/api",
  },
  staging: {
    API_URL: "EXPO_PUBLIC_API_URL_PLACEHOLDER", // Cette chaîne sera remplacée par le script
  },
  production: {
    API_URL: "EXPO_PUBLIC_API_URL_PLACEHOLDER", // Cette chaîne sera remplacée par le script
  },
};

const getEnvVars = () => {
  // Pour le web en production/staging, on utilise l'URL injectée
  if (typeof window !== "undefined") {
    const nodeEnv = process.env.NODE_ENV || "development";

    switch (nodeEnv) {
      case "production":
        return ENV.production;
      case "staging":
        return ENV.staging;
      default:
        return ENV.development;
    }
  }

  // Pour React Native (mobile)
  if (__DEV__) {
    return ENV.development;
  } else {
    return ENV.production;
  }
};

export default getEnvVars();
