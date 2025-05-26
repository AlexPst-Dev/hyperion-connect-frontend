import React from "react";
import { StyleSheet, View, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import { User } from "../context/AuthContext";
import AppText from "./AppText";
import Objective from "./Objective";

interface Props {
  user: User;
  objectives: React.ReactElement | React.ReactElement[];
}

export default function ItemClient({ user, objectives }: Props) {
  function getImageSource(): any {
    if (!user.imageUrl) {
      // fallback
      return require("../assets/images/react-logo.png");
    }

    if (user.imageUrl.startsWith("http") || user.imageUrl.startsWith("https")) {
      return { uri: user.imageUrl };
    }

    // Mapping of konwn local images
    const localImages: Record<string, any> = {
      "users/img-profil-1": require("../assets/images/users/profilePicture/img-profil-1.png"),
    };

    return (
      localImages[user.imageUrl] || require("../assets/images/react-logo.png")
    );
  }

  return (
    <View style={[styles.container, shadowStyles.small]}>
      <View style={styles.user}>
        <Image source={getImageSource()} style={styles.profilePicture} />
        <View style={styles.separator} />
        <View style={styles.userInfos}>
          <AppText style={{ fontWeight: "bold", color: Colors.deepBlue }}>
            {user.firstName} {user.lastName}
          </AppText>
          <AppText>{user.profileCategory}</AppText>
        </View>
      </View>
      {objectives}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
    width: "100%",
    flexDirection: "column",
    gap: 8,
  },
  user: {
    flexDirection: "row",
    gap: 8,
  },
  userInfos: {
    flexDirection: "column",
    gap: 4,
  },
  name: {
    ...GlobalStyles.p,
    color: Colors.deepBlue,
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.grey,
  },
  separator: {
    width: 1,
    height: 48,
    backgroundColor: "black",
  },
});
