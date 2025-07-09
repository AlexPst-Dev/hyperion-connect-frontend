import React from "react";
import { StyleSheet, View, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import Icon, { IconName } from "./Icon";
import { ProfileCategory, User } from "../models/user";
import { Company } from "../models/company";
import AppText from "./AppText";

interface Props {
  isCompany: boolean;
  user: User;
  company?: Company;
  iconName?: IconName;
}

export default function ItemUser({
  isCompany = false,
  user,
  company,
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

  function getSports(user: User): string {
    // Check if user is a sportsman or coach and has a sportCategory with a label
    if (
      (user.profileCategory === ProfileCategory.SPORTSMAN ||
        user.profileCategory === ProfileCategory.COACH) &&
      user.profile &&
      "sportCategory" in user.profile &&
      user.profile.sportCategory &&
      user.profile.sportCategory.label
    ) {
      return user.profile.sportCategory.label;
    }
    return "";
  }
  function getMedicCategory(user: User): string {
    // Check if user is a medic and has a medicCategory with a label
    if (
      user.profileCategory === ProfileCategory.MEDIC &&
      user.profile &&
      "medicCategory" in user.profile &&
      user.profile.medicCategory &&
      user.profile.medicCategory.label
    ) {
      return user.profile.medicCategory.label;
    }
    return "";
  }

  return (
    <View style={[styles.header, shadowStyles.small]}>
      <Image
        source={getImageSource(user.filePicture ? user.filePicture.url : "")}
        style={styles.profilePicture}
      />
      <View style={styles.separator} />
      <View style={styles.userInfos}>
        {!isCompany ? (
          <View>
            <AppText style={styles.name}>
              {user.firstName} {user.lastName}
            </AppText>
            {(user.profileCategory === ProfileCategory.SPORTSMAN ||
              user.profileCategory === ProfileCategory.COACH) && (
              <AppText>{getSports(user)}</AppText>
            )}
            {user.profileCategory === ProfileCategory.MEDIC && (
              <AppText>{getMedicCategory(user)}</AppText>
            )}
            {user.profileCategory === ProfileCategory.PARTNER && (
              <AppText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  GlobalStyles.span,
                  { color: Colors.grey, flex: 1, minWidth: 0 },
                ]}
              >
                {user.description && user.description.length > 20
                  ? user.description.slice(0, 20) + "..."
                  : user.description}
              </AppText>
            )}
          </View>
        ) : (
          <AppText style={styles.name}>{company?.name}</AppText>
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
