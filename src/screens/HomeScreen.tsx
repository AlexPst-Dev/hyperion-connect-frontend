import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import AppText from "../components/AppText";
import News from "../components/News";
import GlobalStyles from "../styles/styles";
import AppButton from "../components/AppButton";
import Session from "../components/Session";
import Label from "../components/Label";
import Event from "../components/Event";
import { User } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  const [newsVisible, setNewsVisible] = useState(true);

  const coachUser: User = {
    id: 1,
    firstName: "Alex",
    lastName: "Martin",
    email: "alex.martin@exemple.com",
    profileCategory: "coach",
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
      >
        {newsVisible && (
          <View style={styles.portalContainer}>
            <News
              title="Message de l'équipe Hyperion :"
              text="N'hésitez pas à donner un avis sur le Google Play Store ou l'Apple Store"
              onPress={() => setNewsVisible(false)}
            />
          </View>
        )}
        <View style={{ marginTop: 24, flexDirection: "column", gap: 16 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>VOTRE PROGRAMME DU JOUR</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View>
            <Session
              title="Séance de tempo run"
              durationTime={50}
              nbExercises={3}
              labels={
                <>
                  <Label title="Cardio" type="blue" size="small" />
                  <Label title="Jambes" type="orange" size="small" />
                </>
              }
            />
          </View>
        </View>
        <View style={{ marginTop: 24, flexDirection: "column", gap: 16 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>VOTRE PROCHAIN RDV</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View>
            <Event
              title="Séance de fractionné"
              isInPerson={true}
              type="session"
              personsInvolved={coachUser}
              location="Parc de Vannes"
              date={new Date("2025-05-05")}
              hour="14"
            />
          </View>
        </View>
        <View style={{ marginTop: 24, flexDirection: "column", gap: 8 }}>
          <AppText style={{ fontWeight: "bold" }}>A la une</AppText>
          <AppText>
            Conseil sommeil : Veillez à dormir au moins 8h par nuit et n'hésitez
            pas à mesurer la qualité de votre sommeil avec une montre connecté
            pour faire un retour à nos spécialiste disponible pour vous.
          </AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  portalContainer: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // paddingHorizontal: 16,
    zIndex: 9999,
  },
});
