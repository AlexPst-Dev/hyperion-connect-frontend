import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Linking,
} from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import Icon from "./Icon";

interface Props {
  detailled?: boolean;
  canBeContacted?: boolean;
  firstName?: string;
  lastName?: string;
  susbcriptionLabel?: string;
  sport?: string;
  phone?: string;
  email?: string;
  age?: string;
  profilePictureUrl?: string;
  companyName?: string;
  companyAdress?: string;
  companyLink?: string;
  token?: string;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfos: {
    flexDirection: "column",
    marginLeft: 16,
  },
  name: {
    ...GlobalStyles.p,
    fontWeight: "bold",
    color: Colors.deepBlue,
  },
  profilePicture: {
    width: 92,
    height: 92,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.grey,
    backgroundColor: "white",
  },
  separator: {
    width: 1,
    height: 64,
    backgroundColor: "black",
    marginLeft: 16,
  },
  detailedContainer: {
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 16,
  },
  contactsControllers: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
});

export default function UserCard({
  detailled = false,
  canBeContacted = false,
  firstName,
  lastName,
  susbcriptionLabel,
  sport,
  phone,
  email,
  age,
  profilePictureUrl,
  companyName,
  companyAdress,
  companyLink,
  token,
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
      "users/profilePicture/img-profile-1": require("../assets/images/users/profilePicture/img-profil-1.png"),
      "users/companies/nutrisport-logo": require("../assets/images/users/companies/nutrisport-logo.png"),
    };

    return localImages[imageUrl] || require("../assets/images/react-logo.png");
  }

  return (
    <View style={[styles.container, shadowStyles.small]}>
      <View style={styles.header}>
        <Image
          source={{ uri: profilePictureUrl }}
          style={styles.profilePicture}
        />
        <View style={styles.separator} />
        <View style={styles.userInfos}>
          {!companyName && !companyAdress && (
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
          )}
          {companyName && companyAdress && (
            <>
              <Text style={styles.name}>{companyName}</Text>
              <Text
                style={[
                  GlobalStyles.p,
                  { flexDirection: "row", maxWidth: "80%" },
                ]}
              >
                {companyAdress}
              </Text>
            </>
          )}
          {susbcriptionLabel && susbcriptionLabel !== "" && (
            <Text style={GlobalStyles.p}>{susbcriptionLabel}</Text>
          )}
          {sport && sport !== "" && <Text style={GlobalStyles.p}>{sport}</Text>}
        </View>
      </View>
      {detailled && (
        <View style={styles.detailedContainer}>
          <Text style={GlobalStyles.p}>
            {phone} | {email}
          </Text>
          <Text style={GlobalStyles.p}>{age} ans</Text>
        </View>
      )}
      {canBeContacted && (
        <View style={styles.contactsControllers}>
          <View style={{ marginRight: 16 }}>
            <Icon name="message" fillColor="transparent" strokeColor="black" />
          </View>
          <View style={{ marginRight: 16 }}>
            <Icon name="mail" fillColor="transparent" strokeColor="black" />
          </View>
          <View>
            <Icon name="phone" fillColor="transparent" strokeColor="black" />
          </View>
        </View>
      )}
      {companyLink && (
        <Pressable
          style={styles.contactsControllers}
          onPress={() => Linking.openURL(companyLink)}
        >
          <Icon name="link" fillColor="transparent" strokeColor="black" />
        </Pressable>
      )}
    </View>
  );
}
