// env.js
import Constants from "expo-constants";

const ENV = {
  development: {
    API_URL: "",
  },
  production: {
    API_URL: "",
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
