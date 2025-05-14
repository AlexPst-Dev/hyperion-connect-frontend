import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import GlobalStyles from "../styles/styles";
import Kpi from "../components/Kpi";
import DisplayEvent from "../components/popups/DisplayEvent";
import Event from "../components/Event";
import { User } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

export default function SessionsScreen() {
  const coachUser: User = {
    id: 1,
    firstName: "Alex",
    lastName: "Martin",
    email: "alex.martin@exemple.com",
    profileCategory: "coach",
  };

  const sportsmanUser: User = {
    id: 14,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@exemple.com",
    profileCategory: "sportsman",
  };

  const { user } = useAuth();

  const [eventPopUpVisible, setEventPopUpVisible] = useState(false);
  const [sportingActivityPopUpVisible, setSportingActivityPopUpVisible] =
    useState(false);

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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <View style={{ width: "48%" }}>
            <Kpi
              title="Nombre de kilomètres"
              iconName="run"
              value="24"
              unit="km"
              fillIcon
            />
          </View>
          <View style={{ width: "48%" }}>
            <Kpi
              title="Séances réalisées cette semaine"
              iconName="dumbell"
              value="7"
              fillIcon
            />
          </View>
          <View style={{ width: "48%" }}>
            <Kpi
              title="Nombre de patients cette semaine"
              iconName="medic"
              value="12"
            />
          </View>
          <View style={{ width: "48%" }}>
            <Kpi
              title="Nombre de kilos perdus"
              iconName="dumbell"
              value="17"
              unit="kg"
              fillIcon
            />
          </View>
        </View>

        <View style={{ flexDirection: "column", gap: 16 }}>
          <Event
            title="Séance de fractionné"
            isInPerson={true}
            type="session"
            personsInvolved={coachUser}
            location="Fitness Park de Vannes"
            date={new Date("2025-05-05")}
            hour="14h"
            onPress={() => setEventPopUpVisible(true)}
          />
          <Event
            title="Sortie sportive"
            type="sportingActivity"
            personsInvolved={sportsmanUser}
            location="Parc de Vannes"
            date={new Date("2025-06-12")}
            hour="17h"
            onPress={() => setSportingActivityPopUpVisible(true)}
          />
        </View>
        {eventPopUpVisible && user && (
          <DisplayEvent
            visible={eventPopUpVisible}
            userConnected={user.id}
            listOfUser={[coachUser]}
            onClose={() => setEventPopUpVisible(false)}
            title="Séance de fractionné"
            eventType="session"
            location="Fitness Park de Vannes"
            date={new Date("2025-05-05")}
            hour="14h"
            isInPerson
            infoDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            createdBy={coachUser.id}
          />
        )}
        {sportingActivityPopUpVisible && user && (
          <DisplayEvent
            visible={sportingActivityPopUpVisible}
            userConnected={user.id}
            listOfUser={[sportsmanUser]}
            onClose={() => setSportingActivityPopUpVisible(false)}
            link="https://strava.com/frnejqnfrbgsgbh"
            title="Sortie sportive"
            eventType="sportingActivity"
            location="Parc de Vannes"
            date={new Date("2025-06-12")}
            hour="17h"
            infoDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            createdBy={sportsmanUser.id}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
