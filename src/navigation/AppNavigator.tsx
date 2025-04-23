import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SportsmanTabs from "./tabs/SporstmanTabs";
import FreeTabs from "./tabs/FreeTabs";
import ProTabs from "./tabs/ProTabs";
import PartnerTabs from "./tabs/PartnerTabs";
import AdminTabs from "./tabs/AdminTabs";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "./types";
import LogoutButton from "../components/LogoutButton";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  const mainScreenOptions = {
    headerShown: true,
    headerRight: () => {
      return <LogoutButton />;
    },
    title: "Hyperion Connect",
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={!user ? "Login" : "Main"}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {user.profileCategory === "sportsman" && (
              <Stack.Screen
                name="Main"
                component={SportsmanTabs}
                options={{ ...mainScreenOptions }}
              />
            )}
            {user.profileCategory === "free" && (
              <Stack.Screen
                name="Main"
                component={FreeTabs}
                options={{ ...mainScreenOptions }}
              />
            )}
            {(user.profileCategory === "coach" ||
              user.profileCategory === "medic") && (
              <Stack.Screen
                name="Main"
                component={ProTabs}
                options={{ ...mainScreenOptions }}
              />
            )}
            {user.profileCategory === "partner" && (
              <Stack.Screen
                name="Main"
                component={PartnerTabs}
                options={{ ...mainScreenOptions }}
              />
            )}
            {user.profileCategory === "admin" && (
              <Stack.Screen
                name="Main"
                component={AdminTabs}
                options={{ ...mainScreenOptions }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
