import { APP_NAME_UPPER, NETWORK_LABEL_UPPER } from "../constants/brand";
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
import { getImageSource } from "../utils/imgSrcHandler";
import { useUserProfileImage } from "../hooks/useImageProfilePicture";

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

export default function HeaderNav() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [memberCard, setMemberCard] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const { profilePicture, isPpLoading } = useUserProfileImage();

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
          <Image
            source={getImageSource("white-logo")}
            style={styles.appImage}
          />
          <Text style={styles.appTitle}>
            {user?.profileCategory === ProfileCategory.PARTNER
              ? NETWORK_LABEL_UPPER
              : APP_NAME_UPPER}
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
              source={{ uri: profilePicture }}
              style={[styles.profilePicture, isPpLoading && { opacity: 0.5 }]}
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

      {memberCard && (
        <MemberCard onClose={() => setMemberCard(false)} visible={memberCard} />
      )}
    </>
  );
}
