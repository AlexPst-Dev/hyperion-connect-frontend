import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
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
import { ProfileCategory, User, UserResponse } from "../models/user";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";
import { getDynamicMonthLabels } from "../models/graph";
import { UserService } from "../services/api/user-service";
import { KpiModel, useKpis } from "../hooks/useKpis";
import { CompanyService } from "../services/api/company-service";
import { Company } from "../models/company";
import { Offer, OfferCategory, OfferCompleteResponse } from "../models/offer";
import { OffersApiService } from "../services/api/offer-service";

export default function StatisticsScreen() {
  const { user, token } = useAuth();

  if (!user || !token) return null;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "OffersHistory"
  >;
  const navigation = useNavigation<NavigationProp>();

  const { kpis, kpisLoading, kpisError } = useKpis(
    user?.profileCategory as ProfileCategory,
    token!
  );

  const [connectedCompany, setConnectedCompany] = useState<Company>();
  const [activeOffers, setActiveOffers] = useState<OfferCompleteResponse[]>([]);

  useEffect(() => {
    async function fetchCompanyConnectedAndOffers() {
      if (!token || !user) return;
      try {
        const allCompanies = await CompanyService.getAllCompanies(token);
        const companyConnected = allCompanies.filter(
          (c) => c.responsibleId === user.id
        )[0];
        setConnectedCompany(companyConnected);
        const offers = await OffersApiService.getOffersByCompanyId(
          companyConnected.id
        );
        setActiveOffers(offers.filter((o) => o.isActive));
      } catch (e) {
        console.log(
          "Error while fetching companies and the connected company : ",
          e
        );
      }
    }
    fetchCompanyConnectedAndOffers();
  }, [user, token]);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabViews: JSX.Element[] = [
    <View key={"stats"} style={{ flexDirection: "column", gap: 24 }}>
      <AppText>
        Retrouvez ici le résumé global de votre visibilité sur la plteforme
        Hyperion Connect.
      </AppText>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {kpis.length > 0 &&
          kpis.map((kpi, index) => (
            <View style={{ flex: 1 }} key={`view-${index}`}>
              <Kpi
                key={index}
                title={kpi.title}
                iconName={kpi.iconName}
                value={kpi.value}
                unit={kpi.unit}
                fillIcon={kpi.fillIcon}
              />
            </View>
          ))}
      </View>
    </View>,
    <View key={"offers"} style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <AppButton
          title="Publier une offre"
          iconName="handshake"
          type="secondary"
          buttonStyle={{ flex: 1 }}
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
      {connectedCompany && (
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <AppButton
            type="linkNormal"
            title="Historique"
            iconName="eye"
            onPress={() =>
              navigation.navigate("OffersHistory", {
                companyId: connectedCompany.id,
              })
            }
          />
        </View>
      )}
      {activeOffers.length > 0 &&
        connectedCompany &&
        activeOffers.map((offerComplete) => (
          <OfferCard
            key={offerComplete.id}
            title={offerComplete.title}
            paragraph={offerComplete.description}
            conditions={offerComplete.conditions ?? ""}
            startDate={new Date(offerComplete.startDate)}
            endDate={new Date(offerComplete.endDate)}
            companyName={connectedCompany.name}
            isSponsorship={
              offerComplete.offerCategory === OfferCategory.SPONSORSHIP
                ? true
                : false
            }
            labelTxt={
              offerComplete.offerCategory === OfferCategory.DISCOUNT
                ? `-${String(offerComplete.discountDetails.amount).slice(
                    0,
                    -3
                  )}%`
                : undefined
            }
            companyImgUrl={
              connectedCompany.fileImageCompany
                ? connectedCompany.fileImageCompany.url
                : ""
            }
          />
        ))}
    </View>,
  ];

  const [askForNewOfferPopUpVisible, setAskForNewOfferPopUpVisible] =
    useState(false);

  type StatisticsPageProfilePageRenderer = (user: LoggedUser) => JSX.Element;

  const [usersByMonth, setUsersByMonth] = useState<
    { month: string; value: number }[]
  >([]);

  useEffect(() => {
    async function fetchUsersStats() {
      if (user?.profileCategory !== "admin" || !token) return;
      const users = await UserService.getAllUsers(token);

      // Parse createdAt and group by month
      const monthMap: Record<string, number> = {};
      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      const usersResponse: User[] | { users: User[] } =
        await UserService.getAllUsers(token);
      const usersArray = Array.isArray(usersResponse)
        ? usersResponse
        : (usersResponse as { users: User[] }).users || [];
      usersArray.forEach((u) => {
        const date = new Date(u.createdAt);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });

      if (!minDate || !maxDate) {
        setUsersByMonth([]);
        return;
      }

      // Generate all months between minDate and maxDate
      const months: string[] = [];
      let current = new Date(
        (minDate as Date).getFullYear(),
        (minDate as Date).getMonth(),
        1
      );
      const end = new Date(
        (maxDate as Date).getFullYear(),
        (maxDate as Date).getMonth(),
        1
      );
      while (current <= end) {
        months.push(
          `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
            2,
            "0"
          )}`
        );
        current.setMonth(current.getMonth() + 1);
      }

      // Get month labels (e.g., ["Avr", "Mai", ...])
      const monthLabels = getDynamicMonthLabels(
        `${(minDate as Date).getFullYear()}-${String(
          (minDate as Date).getMonth() + 1
        ).padStart(2, "0")}-01`,
        months.length
      );

      // Get values and normalize between 0 and 100
      const values = months.map((m) => monthMap[m] || 0);

      setUsersByMonth(
        monthLabels.map((label, i) => ({
          month: label,
          value: values[i],
        }))
      );
    }

    fetchUsersStats();
  }, [user, token]);

  const StatisticsPageByProfile: Record<
    string,
    StatisticsPageProfilePageRenderer
  > = {
    partner: (user) => (
      <>
        <View style={{ flexDirection: "column", gap: 24, marginBottom: 32 }}>
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
        {kpisLoading && <ActivityIndicator />}
        {kpisError && (
          <AppText style={{ color: Colors.red }}>{kpisError}</AppText>
        )}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {kpis.length > 0 &&
            kpis.map((kpi, index) => (
              <View style={{ flex: 1 }} key={`view-${index}`}>
                <Kpi
                  key={index}
                  title={kpi.title}
                  iconName={kpi.iconName}
                  value={kpi.value}
                  unit={kpi.unit}
                  fillIcon={kpi.fillIcon}
                />
              </View>
            ))}
        </View>
        <ProgressGraph
          title="Nombre d'utilisateurs"
          data={
            usersByMonth.length > 0
              ? usersByMonth
              : [
                  { month: "Jan", value: 55 },
                  { month: "Fév", value: 62 },
                  { month: "Mar", value: 70 },
                  { month: "Avr", value: 68 },
                ]
          }
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
