import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Dimensions,
} from "react-native";

import GlobalStyles from "../styles/styles";
import OfferCard from "../components/OfferCard";
import AppText from "../components/AppText";

export default function OffersHistoryScreen() {
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
          <AppText style={GlobalStyles.h2}>HISTORIQUE DES OFFRES</AppText>
          <OfferCard
            companyName="Nutrisport"
            companyImgUrl="users/companies/nutrisport-logo"
            title="Abonnement Acces +"
            paragraph="-20% pour les 3 premiers mois sur l'abonnement Acces + et frais d'adhésion offert. "
            conditions="Bon à usage unique."
            startDate={new Date("2025-03-30")}
            endDate={new Date("2025-04-30")}
            isSponsorship={false}
            labelTxt="-20%"
          />
          <OfferCard
            companyName="Nutrisport"
            companyImgUrl="users/companies/nutrisport-logo"
            title="Marathon de Vannes"
            paragraph="Offre de sponsoring pour le marathon de Vannes. T-shirt running et dossard offert."
            conditions="Plan d'entrainement running sur Hyperion Connect requis."
            startDate={new Date("2025-03-30")}
            endDate={new Date("2025-04-30")}
            isSponsorship
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
