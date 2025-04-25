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
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  name: TextStyle;
  header: ViewStyle;
  userInfos: ViewStyle;
  profilePicture: ImageStyle;
  separator: ViewStyle;
  detailedContainer: ViewStyle;
  contactsControllers: ViewStyle;
}>({
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
    backgroundColor: Colors.grey,
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
}: Props) {
  return (
    <View style={styles.container}>
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
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          <Text style={GlobalStyles.p}>{susbcriptionLabel}</Text>
          <Text style={GlobalStyles.p}>{sport}</Text>
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
    </View>
  );
}
