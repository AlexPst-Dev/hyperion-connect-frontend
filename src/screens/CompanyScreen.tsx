import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import UserCard from "../components/UserCard";
import AppButton from "../components/AppButton";

export default function Companycreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "column", gap: 24 }}>
          <UserCard
            companyName="Nutrisport"
            companyAdress="10 rue François Mitterand 56000 Vannes"
            profilePictureUrl="users/companies/nutrisport-logo"
            companyLink="https://nutrisport.com"
          />
          <AppText>Réseaux sociaux</AppText>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{
                  uri: "https://reactnative.dev/img/tiny_logo.png",
                }}
                style={{ height: "100%" }}
              />
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{
                  uri: "https://reactnative.dev/img/tiny_logo.png",
                }}
                style={{ height: "100%" }}
              />
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 16 }}>
              <Image
                source={{
                  uri: "https://reactnative.dev/img/tiny_logo.png",
                }}
                style={{ height: "100%" }}
              />
            </View>
          </View>
          <AppText>
            Nutrisport a pour but d'offrir des produits nutritionnels de qualité
            aux sportifs et promouvoir la marque via des événements et des
            sponsorings.
          </AppText>
          <AppText>Adhésion valide jusqu'au XX/XX/XXXX</AppText>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton type="primary" title="Modifier" iconName="pencil" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
