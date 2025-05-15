import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import SessionsScreen from "@/src/screens/SessionsScreen";
import HealthScreen from "@/src/screens/HealthScreen";
import CommunityScreen from "@/src/screens/CommunityScreen";
import OffersScreen from "@/src/screens/OffersScreen";
import AppText from "@/src/components/AppText";
import GlobalStyles, { Colors } from "@/src/styles/styles";
import { View, Platform } from "react-native";
import { getTabBarIcon } from "../tabConfig";

const Tab = createBottomTabNavigator();

export default function SportsmanTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <View
            style={[
              GlobalStyles.tabBarIcon,
              {
                backgroundColor: focused ? "#ECF2FF" : "transparent",
              },
            ]}
          >
            {getTabBarIcon(route.name, focused)}
            <AppText
              style={[
                GlobalStyles.span,
                {
                  color: Colors.deepBlue,
                  marginBottom: Platform.OS === "android" ? 4 : 0,
                },
              ]}
            >
              {route.name}
            </AppText>
          </View>
        ),
        tabBarStyle: GlobalStyles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Programmes" component={SessionsScreen} />
      <Tab.Screen name="Santé" component={HealthScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
      <Tab.Screen name="Offres" component={OffersScreen} />
    </Tab.Navigator>
  );
}
