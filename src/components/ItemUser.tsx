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
  isCompany?: boolean;
  companyName?: string;
  link?: string;
  firstName?: string;
  lastName?: string;
  sport?: string;
  job?: string;
  profilePictureUrl?: string;
}

const styles = StyleSheet.create<{
  header: ViewStyle;
  name: TextStyle;
  userInfos: ViewStyle;
  profilePicture: ImageStyle;
  separator: ViewStyle;
  icon: ViewStyle;
}>({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfos: {
    flexDirection: "column",
    marginLeft: 16,
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
    marginLeft: 16,
  },
  icon: {
    marginLeft: "auto",
    marginRight: 20,
  },
});

export default function ItemUser({
  isCompany = false,
  companyName,
  firstName,
  lastName,
  link,
  sport,
  job,
  profilePictureUrl,
}: Props) {
  return (
    <View style={styles.header}>
      <Image
        source={
          profilePictureUrl
            ? { uri: profilePictureUrl }
            : { uri: "https://reactnative.dev/img/tiny_logo.png" } // fallback
        }
        style={styles.profilePicture}
      />
      <View style={styles.separator} />
      <View style={styles.userInfos}>
        {!isCompany ? (
          <View>
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
            <Text style={GlobalStyles.p}>
              {sport} | {job}
            </Text>
          </View>
        ) : (
          <Text style={styles.name}>{companyName}</Text>
        )}
      </View>
      <View style={styles.icon}>
        {isCompany ? (
          <Icon
            name="link"
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        ) : (
          <Icon
            name="send"
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        )}
      </View>
    </View>
  );
}
