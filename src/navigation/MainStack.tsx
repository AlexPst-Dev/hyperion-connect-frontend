import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AppHeader from "../components/AppHeader";

const Stack = createNativeStackNavigator();

export const HeaderComponent = (
  textContent: string = "",
  pageTitle: string = "",
  hasReturnButton: boolean = false,
  onReturnButtonPress?: () => void
) => {
  return (
    <AppHeader
      textContent={textContent.trim()}
      pageTitle={pageTitle.trim()}
      hasReturnButton={hasReturnButton}
      onReturnButtonPress={hasReturnButton ? onReturnButtonPress : () => {}}
    />
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
