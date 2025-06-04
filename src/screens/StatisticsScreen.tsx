import React, { JSX, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";
import AppText from "../components/AppText";
import { useAuth } from "../hooks/useAuth";
import ViewController from "../components/ViewController";
import Kpi from "../components/Kpi";
import AppButton from "../components/AppButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";
import OfferCard from "../components/OfferCard";
import PopUp from "../components/PopUp";
import { User } from "../models/user";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";

export default function StatisticsScreen() {
  const { user } = useAuth();

  if (!user) return null;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "OffersHistory"
  >;
  const navigation = useNavigation<NavigationProp>();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabViews: JSX.Element[] = [
    <View style={{ flexDirection: "column", gap: 24 }}>
      <AppText>
        Retrouvez ici le résumé global de votre visibilité sur la plteforme
        Hyperion Connect.
      </AppText>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ width: "32%" }}>
          <Kpi title="Liens cliqués" iconName="link" value="47" />
        </View>
        <View style={{ width: "32%" }}>
          <Kpi title="Offres publiées" iconName="ticket" value="3" />
        </View>
        <View style={{ width: "32%" }}>
          <Kpi
            title="Title of the KPI"
            iconName="run"
            value="XXX"
            unit="yyy"
            fillIcon
          />
        </View>
      </View>
    </View>,
    <View style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <AppButton
          title="Publier une offre"
          iconName="handshake"
          type="secondary"
          onPress={() =>
            setAskForNewOfferPopUpVisible(!askForNewOfferPopUpVisible)
          }
        />
      </View>
      <AppText>
        Retrouvez ici toutes vos offres et vos sponsoring de sportifs conclus
        avec Hyperion.
      </AppText>
      <AppText style={GlobalStyles.h2}>OFFRES</AppText>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <AppButton
          type="linkNormal"
          title="Historique"
          iconName="eye"
          onPress={() => navigation.navigate("OffersHistory")}
        />
      </View>
      <OfferCard
        title="Title of the offer"
        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere turpis nibh, at aliquet justo viverra et. Donec ac sodales sem."
        conditions="Conditions to respect for this offer"
        startDate={new Date("2025-07-08")}
        endDate={new Date("2025-09-07")}
        companyName="Company name"
        isSponsorship={false}
        labelTxt="Label"
        companyImgUrl="users/companies/nutrisport-logo"
      />
    </View>,
  ];

  const [askForNewOfferPopUpVisible, setAskForNewOfferPopUpVisible] =
    useState(false);

  type StatisticsPageProfilePageRenderer = (user: LoggedUser) => JSX.Element;

  const StatisticsPageByProfile: Record<
    string,
    StatisticsPageProfilePageRenderer
  > = {
    partner: (user) => (
      <>
        <View style={{ flexDirection: "column", gap: 24 }}>
          <ViewController
            tabs={[
              { title: "Statistiques", icon: "stats" },
              { title: "Vos offres", icon: "ticket" },
            ]}
            onTabChange={setActiveTabIndex}
          />
          {tabViews[activeTabIndex]}
        </View>
        <Modal
          visible={askForNewOfferPopUpVisible}
          transparent
          onRequestClose={() =>
            setAskForNewOfferPopUpVisible(!askForNewOfferPopUpVisible)
          }
        >
          <Pressable
            onPress={() => {
              setAskForNewOfferPopUpVisible(!askForNewOfferPopUpVisible);
            }}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <PopUp
              title="Publier une offre"
              paragraph="Souhaitez-vous prendre contact avec les consultants Hyperion pour publier une nouvelle offre ?"
              onClose={() =>
                setAskForNewOfferPopUpVisible(!askForNewOfferPopUpVisible)
              }
              onSubmit={() =>
                setAskForNewOfferPopUpVisible(!askForNewOfferPopUpVisible)
              }
              closeText="Annuler"
              btnText="Contactez-nous"
              btnType="primary"
              iconName="send"
            />
          </Pressable>
        </Modal>
      </>
    ),
    admin: (user) => (
      <View style={{ flexDirection: "column", gap: 24 }}>
        <AppText>
          Retrouvez ici les statistiques globales de l'application.
        </AppText>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
          </View>
        </View>
        <ProgressGraph
          title="Nombre d'utilisateurs"
          data={[
            { month: "Jan", value: 55 },
            { month: "Fév", value: 62 },
            { month: "Mar", value: 70 },
            { month: "Avr", value: 68 },
          ]}
        />
      </View>
    ),
  };

  const RenderProfileComponents = StatisticsPageByProfile[user.profileCategory];

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
        {RenderProfileComponents ? RenderProfileComponents(user) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
