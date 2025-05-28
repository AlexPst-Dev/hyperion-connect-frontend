import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import SessionsScreen from "@/src/screens/SessionsScreen";
import PlanningScreen from "@/src/screens/PlanningScreen";
import StatisticsScreen from "@/src/screens/StatisticsScreen";
import UsersScreen from "@/src/screens/UsersScreen";
import { Platform, View } from "react-native";
import { getTabBarIcon } from "../tabConfig";
import AppText from "@/src/components/AppText";
import GlobalStyles, { Colors, shadowStyles } from "@/src/styles/styles";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
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
                Platform.OS === "web" ? GlobalStyles.span : { fontSize: 8 },
                {
                  color: Colors.deepBlue,
                  marginBottom: 0,
                },
              ]}
            >
              {Platform.OS === "web"
                ? route.name
                : route.name.length > 7
                ? `${route.name.slice(0, 7)}.`
                : route.name}
            </AppText>
          </View>
        ),
        tabBarStyle: [GlobalStyles.tabBarStyle, shadowStyles.medium],
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Utilisateurs" component={UsersScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Programmes" component={SessionsScreen} />
      <Tab.Screen name="Stats" component={StatisticsScreen} />
    </Tab.Navigator>
  );
}
