// src/screens/SessionDetailScreen.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import AppText from "@/src/components/AppText";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "../components/Icon";
import Session from "../components/Session";
import Label from "../components/Label";
import AppButton from "../components/AppButton";
import Input from "../components/Input";
import PopUp from "../components/PopUp";
import AddSessions, {
  TempInterfaceSession,
} from "../components/popups/AddSession";
import * as DocumentPicker from "expo-document-picker";
import AddContacts from "../components/popups/AddContacts";

type ExerciceDetailRouteProp = RouteProp<RootStackParamList, "ExerciceDetail">;

export default function ExerciceDetailScreen() {
  const route = useRoute<ExerciceDetailRouteProp>();
  const { exercice } = route.params;

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);

  const handleAddContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };

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
          <View
            style={{
              height: 192,
              backgroundColor: Colors.grey,
              borderRadius: 8,
            }}
          >
            <Image
              source={require("../assets/images/sessions/img-running.png")}
              style={{ borderRadius: 8 }}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{exercice.title}</AppText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Icon
                name="timer"
                fillColor="transparent"
                strokeColor={Colors.grey}
                strokeWidth={1}
                width={12}
                height={12}
              />
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                {exercice.durationTime} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            <Label
              title="Jambes"
              textColor="#1E3A8A"
              backgroundColor="#D6EBFF"
              size="normal"
            />
            <Label
              title="Cardio"
              textColor="#1E3A8A"
              backgroundColor="#D6EBFF"
              size="normal"
            />
          </View>
          <View>
            <AppText>
              Talons-fesses (30 secondes) Montées de genoux (30 secondes)
              Rotations de hanches (30 secondes) Étirements des mollets et des
              ischio-jambiers (30 secondes chacun)
            </AppText>
          </View>
          <View>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>
              Notes & Recommandations
            </AppText>
            <AppText>
              Commencez par une course lente de 5 à 10 minutes pour augmenter
              progressivement votre fréquence cardiaque et préparer vos muscles
              à l'effort..Buvez de l'eau avant, pendant et après les exercices
              pour rester bien hydraté et optimiser vos performances.
            </AppText>

            {exercice.isEditable && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton title="Modifier" iconName="pencil" type="primary" />
              </View>
            )}
          </View>

          {exercice.isEditable && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingBottom: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: "#C61010",
                }}
              >
                <AppText style={{ color: "#C61010" }}>Supprimer</AppText>
                <Icon
                  name="trash"
                  strokeColor="#C61010"
                  fillColor="transparent"
                  strokeWidth={1}
                />
              </View>
              <AppButton
                type="secondary"
                title="Envoyer"
                iconName="send"
                onPress={handleAddContactPopUpVisible}
              />
            </View>
          )}
        </View>

        <AddContacts
          visible={addContactPopUpVisible}
          onClose={handleAddContactPopUpVisible}
          token=""
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
