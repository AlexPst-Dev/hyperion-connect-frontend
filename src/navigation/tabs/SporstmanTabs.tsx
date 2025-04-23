import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import SessionsScreen from "@/src/screens/SessionsScreen";
import HealthScreen from "@/src/screens/HealthScreen";
import CommunityScreen from "@/src/screens/CommunityScreen";
import OffersScreen from "@/src/screens/OffersScreen";

const Tab = createBottomTabNavigator();

export default function SportsmanTabs() {
  return (
    <Tab.Navigator initialRouteName="Accueil">
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Programmes" component={SessionsScreen} />
      <Tab.Screen name="Santé" component={HealthScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
      <Tab.Screen name="Offres" component={OffersScreen} />
    </Tab.Navigator>
  );
}
