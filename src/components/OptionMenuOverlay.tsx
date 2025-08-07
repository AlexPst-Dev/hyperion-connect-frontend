import React from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon, { IconName } from "./Icon";

interface Props {
  onClose: () => void;
  onNavigate: (routeName: string) => void;
  onLogout: () => void;
}

export default function OptionMenuOverlay({
  onClose,
  onNavigate,
  onLogout,
}: Props) {
  const { user } = useAuth();

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <SafeAreaView
        style={styles.menuContainer}
        edges={["bottom", "left", "right"]}
      >
        <MenuItem
          label="Profil"
          onPress={() => onNavigate("Profile")}
          iconName="profile"
        />
        <MenuItem
          label="Paramètres"
          onPress={() => onNavigate("Settings")}
          iconName="params"
        />
        {user?.profileCategory === "sportsman" && (
          <MenuItem
            label="Abonnement"
            onPress={() => onNavigate("Subscription")}
            iconName="subscription"
          />
        )}
        <MenuItem
          label="Mentions légales"
          onPress={() => onNavigate("Legals")}
          iconName="legals"
        />
        <MenuItem
          label="Déconnexion"
          onPress={onLogout}
          isDestructive
          iconName="login"
        />
      </SafeAreaView>
    </Pressable>
  );
}

const IconNameEnum = {
  profile: "user",
  params: "settings",
  subscription: "subscription",
  legals: "legals",
  login: "login",
} as const;

type IconNameEnum = keyof typeof IconNameEnum;

function mapIconName(iconName: IconNameEnum): IconName {
  return IconNameEnum[iconName];
}

function MenuItem({
  label,
  onPress,
  isDestructive = false,
  iconName = "profile",
}: {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  iconName?: IconNameEnum;
}) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Icon
        name={mapIconName(iconName)}
        fillColor="white"
        strokeColor={isDestructive ? Colors.lightRed : "black"}
        strokeWidth={2}
      />
      <Text style={[styles.itemText, isDestructive && styles.destructive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    height: Dimensions.get("window").height,
    zIndex: 1000,
  },
  menuContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 4,
    paddingBottom: Platform.OS === "web" ? 0 : 32,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  itemText: {
    ...GlobalStyles.p,
    marginLeft: 8,
  },
  destructive: {
    color: Colors.lightRed,
  },
});
