import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import SessionsScreen from "@/src/screens/SessionsScreen";
import PlanningScreen from "@/src/screens/PlanningScreen";
import UsersScreen from "@/src/screens/UsersScreen";
import CommunityScreen from "@/src/screens/CommunityScreen";

const Tab = createBottomTabNavigator();

export default function ProTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Programmes" component={SessionsScreen} />
      <Tab.Screen name="Clients" component={UsersScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
    </Tab.Navigator>
  );
}
