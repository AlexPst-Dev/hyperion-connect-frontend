import React, { JSX, useEffect, useState } from "react";
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
import { User, UserResponse } from "../models/user";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";
import { getDynamicMonthLabels } from "../models/graph";
import { UserService } from "../services/api/user-service";

export default function StatisticsScreen() {
  const { user, token } = useAuth();

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
          onPress={() => navigation.navigate("OffersHistory", { companyId: 1 })}
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
