import React from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import OfferCard from "../components/OfferCard";
import ItemUser from "../components/ItemUser";

export default function StatisticsScreen() {
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
        <View style={{ marginBottom: 24 }}>
          <ItemUser isCompany companyName="NutriSport" />
        </View>
        <View style={{ marginBottom: 24, flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>REPRESENTANT</AppText>
          <ItemUser
            isCompany={false}
            firstName="John"
            lastName="Doe"
            job="Directeur Marketing"
          />
        </View>
        <View style={{ marginBottom: 24, flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>OFFRES</AppText>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <OfferCard
              companyName="NutriSport"
              companyImgUrl="https://reactnative.dev/img/tiny_logo.png"
              title="Offre de sponsoring"
              paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere turpis nibh, at aliquet justo viverra et. Donec ac sodales sem."
              conditions="Conditions to respect for this offer"
              startDate={new Date("2025-05-05")}
              endDate={new Date("2025-06-05")}
              isSponsorship
              labelTxt="Sponsor"
              onPress={() => console.log("hey")}
            />
            <OfferCard
              companyName="NutriSport"
              companyImgUrl="https://reactnative.dev/img/tiny_logo.png"
              title="Offre de réduction"
              paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere turpis nibh, at aliquet justo viverra et. Donec ac sodales sem."
              conditions="Conditions to respect for this offer"
              startDate={new Date("2025-05-05")}
              endDate={new Date("2025-06-05")}
              isSponsorship={false}
              labelTxt="-10%"
              onPress={() => console.log("hey")}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
