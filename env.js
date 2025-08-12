// env.js
import Constants from "expo-constants";

const ENV = {
  development: {
    API_URL: "http://192.168.1.92:3000/api",
  },
  staging: {
    API_URL: "https://dev.api.hyperion-connect.com/api",
  },
  production: {
    API_URL: "https://api.hyperion-connect.com/api",
  },
};

const getEnvVars = () => {
  // Pour le web, on peut utiliser des variables d'environnement
  if (typeof window !== "undefined") {
    // En mode web, on peut lire les variables d'environnement injectées
    const nodeEnv = process.env.NODE_ENV || "development";
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (apiUrl) {
      return { API_URL: apiUrl };
    }

    // Fallback sur la configuration par environnement
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
