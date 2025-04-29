import React from "react";
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  View,
  Text,
  Image,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "./Icon";

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
  return (
    <View style={styles.container}>
      <View style={styles.leftPart}>
        <Image
          source={
            appImageUrl
              ? { uri: appImageUrl }
              : { uri: "https://reactnative.dev/img/tiny_logo.png" } // fallback
          }
          style={styles.appImage}
        />
        <Text style={styles.appTitle}>HYPERION</Text>
      </View>
      <View style={styles.rightPart}>
        <Icon
          name="qrCode"
          fillColor="white"
          width={42}
          height={42}
          strokeWidth={1}
        />
        <Image
          source={
            profilePictureUrl
              ? { uri: profilePictureUrl }
              : { uri: "https://reactnative.dev/img/tiny_logo.png" } // fallback
          }
          style={styles.profilePicture}
        />
      </View>
    </View>
  );
}
