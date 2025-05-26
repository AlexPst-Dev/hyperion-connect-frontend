import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import Icon, { IconName } from "./Icon";

interface Props {
  isCompany: boolean;
  companyName?: string;
  link?: string;
  firstName?: string;
  lastName?: string;
  sport?: string;
  job?: string;
  profilePictureUrl?: string;
  iconName?: IconName;
}

const styles = StyleSheet.create({
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
  iconName = "send",
}: Props) {
  function getImageSource(imageUrl?: string): any {
    if (!imageUrl) {
      // fallback
      return require("../assets/images/react-logo.png");
    }

    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return { uri: imageUrl };
    }

    // Mapping of konwn local images
    const localImages: Record<string, any> = {
      "users/companies/nutrisport-logo": require("../assets/images/users/companies/nutrisport-logo.png"),
    };

    return localImages[imageUrl] || require("../assets/images/react-logo.png");
  }

  return (
    <View style={[styles.header, shadowStyles.small]}>
      <Image
        source={getImageSource(profilePictureUrl)}
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
              {sport ? sport : ""}
              {sport && job ? "|" : ""}
              {job ? job : ""}
            </Text>
          </View>
        ) : (
          <Text style={styles.name}>{companyName}</Text>
        )}
      </View>
      <View style={styles.icon}>
        {isCompany && !iconName ? (
          <Icon
            name="link"
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        ) : (
          <Icon
            name={iconName}
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        )}
      </View>
    </View>
  );
}
