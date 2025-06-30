import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";
import AppButton from "../components/AppButton";
import OfferCard from "../components/OfferCard";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";
import { ProfileCategory } from "../models/user";
import {
  DiscountOffer,
  OfferCategory,
  OfferCompleteResponse,
  SponsorshipOffer,
} from "../models/offer";
import { OffersApiService } from "../services/api/offer-service";
import { CompanyService } from "../services/api/company-service";
import { Company } from "../models/company";

export default function OffersScreen() {
  const [selectedOffer, setSelectedOffer] = useState<{
    offer: OfferCompleteResponse;
    company: Company;
  } | null>(null);

  const { user, token } = useAuth();
  if (!user || !token) return;

  let isFree: boolean = false;

  user.profileCategory === ProfileCategory.FREE
    ? (isFree = true)
    : (isFree = false);

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "PartnersList"
  >;
  const navigation = useNavigation<NavigationProp>();

  const [offers, setOffers] = useState<
    { offer: OfferCompleteResponse; company: Company }[]
  >([]);

  async function fetchAvailableOffers(token: string) {
    const allOffers = await OffersApiService.getAllOffers(token);
    if (allOffers.length > 0) {
      const offersWithCompanies = await Promise.all(
        allOffers
          .filter((o) => o.isActive)
          .map(async (o) => {
            const company = await CompanyService.getCompanyById(o.companyId);
            return { offer: o, company };
          })
      );
      setOffers(offersWithCompanies);
    }
  }

  useEffect(() => {
    if (token && user) {
      try {
        fetchAvailableOffers(token);
      } catch (e) {
        console.log("Error while fetching offers", e);
      }
    }
  }, [user, token]);

  return (
    <>
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
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="linkNormal"
                title="Voir tous nos partenaires"
                iconName="eye"
                onPress={() => {
                  navigation.navigate("PartnersList");
                }}
              />
            </View>
            <AppText>
              Retrouvez ici toutes nos offres partenaires du moment.
            </AppText>
            {offers.map(({ offer, company }) => {
              return (
                <OfferCard
                  key={offer.id}
                  companyName={company.name}
                  companyImgUrl={
                    company.fileImageCompany ? company.fileImageCompany.url : ""
                  }
                  title={offer.title}
                  paragraph={offer.description}
                  conditions={offer.conditions ?? ""}
                  startDate={new Date(offer.startDate)}
                  endDate={new Date(offer.endDate)}
                  isSponsorship={
                    offer.offerCategory === OfferCategory.SPONSORSHIP
                      ? true
                      : false
                  }
                  labelTxt={
                    offer.offerCategory === OfferCategory.DISCOUNT &&
                    offer.discountDetails &&
                    typeof offer.discountDetails.amount !== "undefined"
                      ? offer.discountDetails.amount.toString().slice(0, 2) +
                        "%"
                      : undefined
                  }
                  onPress={() => {
                    if (
                      offer.offerCategory === OfferCategory.DISCOUNT &&
                      offer.discountDetails &&
                      typeof offer.discountDetails.link === "string" &&
                      isFree === false
                    ) {
                      Linking.openURL(offer.discountDetails.link);
                    } else if (
                      offer.offerCategory === OfferCategory.SPONSORSHIP &&
                      isFree === false
                    ) {
                      setSelectedOffer({ offer, company });
                    }
                  }}
                  iconName={
                    isFree
                      ? "linkDenied"
                      : offer.offerCategory === OfferCategory.SPONSORSHIP
                      ? "link"
                      : offer.offerCategory === OfferCategory.DISCOUNT
                      ? "send"
                      : undefined
                  }
                />
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={!!selectedOffer}
        transparent
        onRequestClose={() => setSelectedOffer(null)}
      >
        <Pressable
          onPress={() => setSelectedOffer(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {selectedOffer && (
            <PopUp
              title="Postuler à l'offre de sponsoring"
              onClose={() => setSelectedOffer(null)}
              closeText="Annuler"
              onSubmit={() => setSelectedOffer(null)}
              specificBody={
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <AppText>
                    Voulez vous postuler à l'offre de{" "}
                    {selectedOffer.company.name} pour la proposition suivante :
                  </AppText>
                  <AppText>{selectedOffer.offer.description}</AppText>
                  <AppText>
                    Jusqu'au{" "}
                    {new Date(selectedOffer.offer.endDate).toLocaleDateString(
                      "fr-FR"
                    )}
                    .
                    {selectedOffer.offer.offerCategory ===
                      OfferCategory.SPONSORSHIP &&
                    selectedOffer.offer.sponsorshipDetails &&
                    selectedOffer.offer.sponsorshipDetails.nbPersonMax !==
                      undefined
                      ? ` ${selectedOffer.offer.sponsorshipDetails.nbPersonMax} personnes sponsorisées maximum.`
                      : ""}
                  </AppText>
                  <AppText>
                    Un mail sera automatiquement envoyé à{" "}
                    {selectedOffer.company.name} avec votre candidature.
                  </AppText>
                  <Input
                    type="textarea"
                    label="Contenu du message"
                    placeholder="Rédigez votre message à transmettre ici..."
                  />
                </View>
              }
              btnText="Postuler"
              btnType="primary"
              iconName="send"
            />
          )}
        </Pressable>
      </Modal>
    </>
  );
}
