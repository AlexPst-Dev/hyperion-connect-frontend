import React, { useEffect, useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import * as Font from "expo-font";
import { NotificationPortal } from "./src/components/NotificationContainer";
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "./src/navigation/types";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Montserrat-Regular": require("./src/assets/fonts/Montserrat-Regular.ttf"),
      "Montserrat-Bold": require("./src/assets/fonts/Montserrat-Bold.ttf"),
      "Montserrat-SemiBold": require("./src/assets/fonts/Montserrat-SemiBold.ttf"),
      "Roboto-Regular": require("./src/assets/fonts/Roboto-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const prefix = Linking.createURL("/");

  const linking = {
    prefixes: [
      prefix,
      "http://localhost:8081",
      "https://dev.app.hyperion-connect.com",
      "https://app.hyperion-connect.com",
    ],
    config: {
      screens: {
        Login: "login",
        Register: "register",
        ForgotPassword: "forgot-password",
        ResetPassword: "reset-password",
        Main: "main",
      },
    },
  };

  if (!fontsLoaded) return null;
  return (
    <NavigationContainer linking={linking}>
      <AuthProvider>
        <NotificationPortal />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
