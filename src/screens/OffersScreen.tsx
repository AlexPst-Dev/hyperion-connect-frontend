import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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

export default function OffersScreen() {
  const [candidateSponsoringPopUpVisible, setCandidateSponsoringPopUpVisible] =
    useState(false);

  const handleCandidateSponsoringPopUp = () => {
    setCandidateSponsoringPopUpVisible(!candidateSponsoringPopUpVisible);
  };

  const { user } = useAuth();

  let isFree: boolean = false;

  user?.profileCategory === "free" ? (isFree = true) : (isFree = false);

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "PartnersList"
  >;
  const navigation = useNavigation<NavigationProp>();

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
            <OfferCard
              companyName="Fitness Park"
              companyImgUrl="users/companies/nutrisport-logo"
              title="Abonnement Acces +"
              paragraph="-20% pour les 3 premiers mois sur l'abonnement Acces + et frais d'adhésion offert. "
              conditions="Bon à usage unique."
              startDate={new Date("2025-03-30")}
              endDate={new Date("2025-04-30")}
              isSponsorship={false}
              labelTxt="-20%"
              onPress={() => {}}
              iconName={isFree ? "linkDenied" : "link"}
            />
            <OfferCard
              companyName="Tonton Outdoor"
              companyImgUrl="users/companies/nutrisport-logo"
              title="Marathon de Vannes"
              paragraph="Offre de sponsoring pour le marathon de Vannes. T-shirt running et dossard offert."
              conditions="Plan d'entrainement running sur Hyperion Connect requis."
              startDate={new Date("2025-03-30")}
              endDate={new Date("2025-04-30")}
              isSponsorship
              onPress={isFree ? () => {} : handleCandidateSponsoringPopUp}
              iconName={isFree ? "linkDenied" : "send"}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={candidateSponsoringPopUpVisible}
        transparent
        onRequestClose={handleCandidateSponsoringPopUp}
      >
        <Pressable
          onPress={handleCandidateSponsoringPopUp}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <PopUp
            title="Postuler à l'offre de sponsoring"
            onClose={handleCandidateSponsoringPopUp}
            closeText="Annuler"
            onSubmit={handleCandidateSponsoringPopUp}
            specificBody={
              <View style={{ flexDirection: "column", gap: 8 }}>
                <AppText>
                  Voulez vous postuler à l'offre de NutriSport pour la
                  proposition suivante :
                </AppText>
                <AppText>
                  Proposition de sponsoring pour le semi-marathon de Vannes.
                </AppText>
                <AppText>
                  Jusqu'au 12/08/2025. 3 personnes sponsorisées maximum.
                </AppText>
                <AppText>
                  Un mail sera automatiquement envoyé à NutriSport avec votre
                  candidature.
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
        </Pressable>
      </Modal>
    </>
  );
}
