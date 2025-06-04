import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";
import AppText from "../components/AppText";
import Event from "../components/Event";
import { ProfileCategory, User } from "../models/user";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";

type PlanningHistoryRouteProp = RouteProp<
  RootStackParamList,
  "PlanningHistory"
>;

export default function PlanningHistoryScreen() {
  const route = useRoute<PlanningHistoryRouteProp>();
  const screenWidth = Dimensions.get("window").width;

  const tempAdminUser: User = {
    id: 1,
    firstName: "Chloé",
    lastName: "Marchegay",
    email: "chloe.marchegay@hyperion.com",
    profileCategory: ProfileCategory.ADMIN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
  };

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
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>HISTORIQUE</AppText>
          <Event
            title="Evénement Hyperion Vannes"
            type="hyperion"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            hour="14h00"
          />
          <Event
            title="Evénement Hyperion Vannes"
            type="hyperion"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-10-10")}
            hour="14h00"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
