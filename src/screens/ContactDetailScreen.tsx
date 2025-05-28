// src/screens/SessionDetailScreen.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Dimensions,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles from "../styles/styles";
import UserCard from "../components/UserCard";
import AppText from "../components/AppText";

type ContactDetailRouteProp = RouteProp<RootStackParamList, "ContactDetail">;

export default function ContactDetailScreen() {
  const route = useRoute<ContactDetailRouteProp>();
  const { contact } = route.params;

  const screenWidth = Dimensions.get("window").width;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={
          Platform.OS === "web"
            ? { maxHeight: screenWidth + 180, paddingBottom: 32 }
            : {}
        }
      >
        <View style={{ flexDirection: "column", gap: 24 }}>
          <UserCard
            detailled
            canBeContacted
            firstName={contact.firstName}
            lastName={contact.lastName}
            susbcriptionLabel={
              contact.profileCategory === "sportsman" ? "Gold" : ""
            }
            email={contact.email}
            phone="0606060606"
            sport={contact.profileCategory === "sportsman" ? "Running" : ""}
            age="24"
            profilePictureUrl="users/profilePicture/img-profile-1"
          />
          <AppText>Réseaux sociaux</AppText>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
          </View>
          <AppText>
            Passionné de trail et de nature, je participe régulièrement à des
            courses en montagne. J'aime partager mes expériences et conseiller
            les autres coureurs sur les meilleures techniques et équipements
            pour le trail.
          </AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
