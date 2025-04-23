import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import SessionsScreen from "@/src/screens/SessionsScreen";
import PlanningScreen from "@/src/screens/PlanningScreen";
import StatisticsScreen from "@/src/screens/StatisticsScreen";
import UsersScreen from "@/src/screens/UsersScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Utilisateurs" component={UsersScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Programmes" component={SessionsScreen} />
      <Tab.Screen name="Stats" component={StatisticsScreen} />
    </Tab.Navigator>
  );
}
