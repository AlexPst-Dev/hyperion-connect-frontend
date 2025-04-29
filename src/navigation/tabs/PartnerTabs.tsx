import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import PlanningScreen from "@/src/screens/PlanningScreen";
import CommunityScreen from "@/src/screens/CommunityScreen";
import StatisticsScreen from "@/src/screens/StatisticsScreen";
import Companycreen from "@/src/screens/CompanyScreen";

const Tab = createBottomTabNavigator();

export default function PartnerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Statistiques" component={StatisticsScreen} />
      <Tab.Screen name="Vous" component={Companycreen} />
    </Tab.Navigator>
  );
}
