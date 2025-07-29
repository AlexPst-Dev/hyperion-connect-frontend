import React, { useEffect, useState } from "react";
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
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../hooks/useAuth";
import { useInactiveCompanyOffers } from "../hooks/useCompanyOffers";
import { Company } from "../models/company";
import { CompanyService } from "../services/api/company-service";
import { OfferCategory } from "../models/offer";

type OffersHistorytDetailRouteProp = RouteProp<
  RootStackParamList,
  "OffersHistory"
>;

export default function OffersHistoryScreen() {
  const screenWidth = Dimensions.get("window").width;
  const route = useRoute<OffersHistorytDetailRouteProp>();
  const { companyId } = route.params;
  const { token } = useAuth();

  const [company, setCompany] = useState<Company>();

  if (!companyId || !token) {
    return (
      <View style={GlobalStyles.pageStyle}>
        <AppText style={GlobalStyles.h2}>
          Veuillez sélectionner une entreprise.
        </AppText>
      </View>
    );
  }

  const { offers, loading, error } = useInactiveCompanyOffers(companyId, token);

  // Fetch the company thanks to the companyId
  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await CompanyService.getCompanyById(companyId, token!);
        setCompany(response);
      } catch (e: any) {
        console.error(e);
      }
    }
    fetchCompany();
  }, [companyId, token]);

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
          {loading ? (
            <AppText>Chargement...</AppText>
          ) : error ? (
            <AppText>{error}</AppText>
          ) : offers.length === 0 ? (
            <AppText>Aucune offre inactive</AppText>
          ) : (
            company &&
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                company={company}
                title={offer.title}
                paragraph={offer.description}
                conditions={offer.conditions || ""}
                startDate={new Date(offer.startDate)}
                endDate={new Date(offer.endDate)}
                isSponsorship={offer.offerCategory === "sponsorship"}
                labelTxt={
                  offer.offerCategory === OfferCategory.DISCOUNT
                    ? `-${String(offer.discountDetails.amount).slice(0, -3)}%`
                    : "Sponsor"
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
