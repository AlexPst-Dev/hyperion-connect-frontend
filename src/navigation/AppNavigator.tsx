import React from "react";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
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
import { HeaderComponent } from "./MainStack";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  if (!user && user !== null) {
    return null;
  }

  const pageTitles: Record<string, string> = {
    Main: "ACCUEIL",
    Stats: "STATISTIQUES",
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
                options={({ route, navigation }) => {
                  const focusedRouteName =
                    getFocusedRouteNameFromRoute(route) || route.name;

                  return {
                    headerShown: true,
                    header: () =>
                      HeaderComponent(
                        focusedRouteName === "Main"
                          ? `Bonjour ${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            } 👋`
                          : "",
                        pageTitles[focusedRouteName] ||
                          focusedRouteName.toUpperCase(),
                        navigation.canGoBack(),
                        () => navigation.goBack()
                      ),
                  };
                }}
              />
            )}
            {user.profileCategory === "free" && (
              <Stack.Screen
                name="Main"
                component={FreeTabs}
                options={({ route, navigation }) => {
                  const focusedRouteName =
                    getFocusedRouteNameFromRoute(route) || route.name;

                  return {
                    headerShown: true,
                    header: () =>
                      HeaderComponent(
                        focusedRouteName === "Main"
                          ? `Bonjour ${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            } 👋`
                          : "",
                        pageTitles[focusedRouteName] ||
                          focusedRouteName.toUpperCase(),
                        navigation.canGoBack(),
                        () => navigation.goBack()
                      ),
                  };
                }}
              />
            )}
            {(user.profileCategory === "coach" ||
              user.profileCategory === "medic") && (
              <Stack.Screen
                name="Main"
                component={ProTabs}
                options={({ route, navigation }) => {
                  const focusedRouteName =
                    getFocusedRouteNameFromRoute(route) || route.name;

                  return {
                    headerShown: true,
                    header: () =>
                      HeaderComponent(
                        focusedRouteName === "Main"
                          ? `Bonjour ${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            } 👋`
                          : "",
                        pageTitles[focusedRouteName] ||
                          focusedRouteName.toUpperCase(),
                        navigation.canGoBack(),
                        () => navigation.goBack()
                      ),
                  };
                }}
              />
            )}
            {user.profileCategory === "partner" && (
              <Stack.Screen
                name="Main"
                component={PartnerTabs}
                options={({ route, navigation }) => {
                  const focusedRouteName =
                    getFocusedRouteNameFromRoute(route) || route.name;

                  return {
                    headerShown: true,
                    header: () =>
                      HeaderComponent(
                        focusedRouteName === "Main"
                          ? `Bonjour ${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            } 👋`
                          : "",
                        pageTitles[focusedRouteName] ||
                          focusedRouteName.toUpperCase(),
                        navigation.canGoBack(),
                        () => navigation.goBack()
                      ),
                  };
                }}
              />
            )}
            {user.profileCategory === "admin" && (
              <Stack.Screen
                name="Main"
                component={AdminTabs}
                options={({ route, navigation }) => {
                  const focusedRouteName =
                    getFocusedRouteNameFromRoute(route) || route.name;

                  return {
                    headerShown: true,
                    header: () =>
                      HeaderComponent(
                        focusedRouteName === "Main" ||
                          focusedRouteName === "Accueil"
                          ? `Bonjour ${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            } 👋`
                          : "",
                        pageTitles[focusedRouteName] ||
                          focusedRouteName.toUpperCase(),
                        navigation.canGoBack(),
                        () => navigation.goBack()
                      ),
                  };
                }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
