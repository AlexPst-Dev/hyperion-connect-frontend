import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/src/screens/HomeScreen";
import PlanningScreen from "@/src/screens/PlanningScreen";
import CommunityScreen from "@/src/screens/CommunityScreen";
import StatisticsScreen from "@/src/screens/StatisticsScreen";
import Companycreen from "@/src/screens/CompanyScreen";
import AppText from "@/src/components/AppText";
import GlobalStyles, { Colors, shadowStyles } from "@/src/styles/styles";
import { View, Platform } from "react-native";
import { getTabBarIcon } from "../tabConfig";

const Tab = createBottomTabNavigator();

export default function PartnerTabs() {
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
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          title: "Hyperion Connect",
          tabBarLabel: "Accueil",
        }}
      />
      <Tab.Screen name="Communauté" component={CommunityScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Statistiques" component={StatisticsScreen} />
      <Tab.Screen name="Vous" component={Companycreen} />
    </Tab.Navigator>
  );
}
