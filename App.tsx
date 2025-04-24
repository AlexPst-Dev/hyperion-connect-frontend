import React, { useEffect, useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import * as Font from "expo-font";

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

  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
