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
import ParametersScreen from "../screens/params/ParametersScreen";
import ProfileScreen from "../screens/params/ProfileScreen";
import SubscriptionScreen from "../screens/params/SubscriptionScreen";
import LegalsScreen from "../screens/params/LegalsScreen";
import SessionDetailScreen from "../screens/SessionDetailScreen";
import ExerciceDetailScreen from "../screens/ExerciceDetailScreen";
import PlanningHistory from "../screens/PlanningHistory";
import ContactDetailScreen from "../screens/ContactDetailScreen";
import PartnersListScreen from "../screens/PartnersListScreen";
import ClientDetailScreen from "../screens/ClientDetailScreen";
import OffersHistoryScreen from "../screens/OffersHistoryScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  if (!user && user !== null) {
    return null;
  }

  const pageTitles: Record<string, string> = {
    Stats: "STATISTIQUES",
  };

  const mainOptions = (
    route: any,
    navigation: any,
    user: any,
    overrideTitle?: string
  ) => {
    const focusedRouteName = getFocusedRouteNameFromRoute(route) || route.name;
    const isHomePage =
      focusedRouteName === "Main" || focusedRouteName === "Accueil";
    const title =
      overrideTitle ||
      pageTitles[focusedRouteName] ||
      (isHomePage ? "" : focusedRouteName.toUpperCase());

    return {
      headerShown: true,
      header: () =>
        HeaderComponent(
          isHomePage
            ? `Bonjour ${user?.firstName ?? ""} ${user?.lastName ?? ""} 👋`
            : "",
          title,
          navigation.canGoBack(),
          isHomePage,
          () => navigation.goBack()
        ),
    };
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
              <>
                <Stack.Screen
                  name="Main"
                  component={SportsmanTabs}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user)
                  }
                />
                <Stack.Screen
                  name="SessionDetail"
                  component={SessionDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="ExerciceDetail"
                  component={ExerciceDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="ContactDetail"
                  component={ContactDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "COMMUNAUTE")
                  }
                />
                <Stack.Screen
                  name="PartnersList"
                  component={PartnersListScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "NOS PARTENAIRES")
                  }
                />
              </>
            )}
            {user.profileCategory === "free" && (
              <>
                <Stack.Screen
                  name="Main"
                  component={FreeTabs}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user)
                  }
                />
                <Stack.Screen
                  name="PartnersList"
                  component={PartnersListScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "NOS PARTENAIRES")
                  }
                />
              </>
            )}
            {(user.profileCategory === "coach" ||
              user.profileCategory === "medic") && (
              <>
                <Stack.Screen
                  name="Main"
                  component={ProTabs}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user)
                  }
                />
                <Stack.Screen
                  name="SessionDetail"
                  component={SessionDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="ExerciceDetail"
                  component={ExerciceDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="PlanningHistory"
                  component={PlanningHistory}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PLANNING")
                  }
                />
                <Stack.Screen
                  name="ContactDetail"
                  component={ContactDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "COMMUNAUTE")
                  }
                />
                <Stack.Screen
                  name="ClientDetail"
                  component={ClientDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "CLIENTS")
                  }
                />
              </>
            )}
            {user.profileCategory === "partner" && (
              <>
                <Stack.Screen
                  name="Main"
                  component={PartnerTabs}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user)
                  }
                />
                <Stack.Screen
                  name="ContactDetail"
                  component={ContactDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "COMMUNAUTE")
                  }
                />
                <Stack.Screen
                  name="OffersHistory"
                  component={OffersHistoryScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "CLIENTS")
                  }
                />
              </>
            )}
            {user.profileCategory === "admin" && (
              <>
                <Stack.Screen
                  name="Main"
                  component={AdminTabs}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user)
                  }
                />
                <Stack.Screen
                  name="SessionDetail"
                  component={SessionDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="ExerciceDetail"
                  component={ExerciceDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "PROGRAMMES")
                  }
                />
                <Stack.Screen
                  name="ContactDetail"
                  component={ContactDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "COMMUNAUTE")
                  }
                />
                <Stack.Screen
                  name="ClientDetail"
                  component={ClientDetailScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "CLIENTS")
                  }
                />
                <Stack.Screen
                  name="OffersHistory"
                  component={OffersHistoryScreen}
                  options={({ route, navigation }) =>
                    mainOptions(route, navigation, user, "CLIENTS")
                  }
                />
              </>
            )}
            <Stack.Screen
              name="Settings"
              component={ParametersScreen}
              options={({ route, navigation }) =>
                mainOptions(route, navigation, user, "PARAMÈTRES")
              }
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={({ route, navigation }) =>
                mainOptions(route, navigation, user, "PROFIL")
              }
            />
            <Stack.Screen
              name="Subscription"
              component={SubscriptionScreen}
              options={({ route, navigation }) =>
                mainOptions(route, navigation, user, "ABONNEMENT")
              }
            />
            <Stack.Screen
              name="Legals"
              component={LegalsScreen}
              options={({ route, navigation }) =>
                mainOptions(route, navigation, user, "MENTIONS LÉGALES")
              }
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
