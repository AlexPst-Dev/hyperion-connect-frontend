import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  View,
  Text,
  Image,
  Pressable,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "./Icon";
import OptionMenuOverlay from "./OptionMenuOverlay";
import { useAuth } from "../hooks/useAuth";
import MemberCard from "./MemberCard";
import { ProfileCategory } from "../models/user";

interface Props {
  profilePictureUrl?: string;
}

const appImageUrl = "https://reactnative.dev/img/tiny_logo.png";

const styles = StyleSheet.create<{
  container: ViewStyle;
  appTitle: TextStyle;
  appImage: ImageStyle;
  profilePicture: ImageStyle;
  leftPart: ViewStyle;
  rightPart: ViewStyle;
}>({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  appTitle: {
    ...GlobalStyles.h2,
    color: "white",
    marginLeft: 8,
    marginBottom: 0,
  },
  appImage: {
    height: 49,
    width: 49,
  },
  profilePicture: {
    height: 42,
    width: 42,
    borderRadius: 50,
    borderColor: "white",
    borderWidth: 2,
    backgroundColor: Colors.grey,
    marginLeft: 16,
  },
  leftPart: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightPart: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default function HeaderNav({ profilePictureUrl }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [memberCard, setMemberCard] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  const handleNavigate = (route: string) => {
    navigation.navigate(route as never);
    setMenuVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.leftPart}
          onPress={() => navigation.navigate("Main" as never)}
        >
          <Image source={{ uri: appImageUrl }} style={styles.appImage} />
          <Text style={styles.appTitle}>
            {user?.profileCategory === ProfileCategory.PARTNER
              ? "HYPERLINK"
              : "HYPERION"}
          </Text>
        </Pressable>

        <Pressable style={styles.rightPart} onPress={() => setMemberCard(true)}>
          <Icon
            name="qrCode"
            fillColor="white"
            width={42}
            height={42}
            strokeWidth={1}
          />

          <Pressable onPress={() => setMenuVisible(true)}>
            <Image
              source={
                profilePictureUrl
                  ? { uri: profilePictureUrl }
                  : { uri: "https://reactnative.dev/img/tiny_logo.png" }
              }
              style={styles.profilePicture}
            />
          </Pressable>
        </Pressable>
      </View>

      {menuVisible && (
        <OptionMenuOverlay
          onClose={() => setMenuVisible(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {memberCard && <MemberCard onClose={() => setMemberCard(false)} />}
    </>
  );
}
