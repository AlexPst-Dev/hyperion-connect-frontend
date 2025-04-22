// env.js
import Constants from "expo-constants";

const ENV = {
  development: {
    API_URL: "http://192.168.1.92:3000/api",
  },
  production: {
    API_URL: "https://ton-domaine.com/api",
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  } else {
    return ENV.production;
  }
};

export default getEnvVars();
