// src/screens/SessionDetailScreen.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Dimensions,
} from "react-native";
import AppText from "@/src/components/AppText";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "../components/Icon";
import Label from "../components/Label";
import AppButton from "../components/AppButton";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import { getImageSource } from "../utils/imgSrcHandler";
import { getMinutesFromDuration } from "../services/api/session-service";

type ExerciceDetailRouteProp = RouteProp<RootStackParamList, "ExerciceDetail">;

export default function ExerciceDetailScreen() {
  const route = useRoute<ExerciceDetailRouteProp>();
  const { exercise, muscleGroups } = route.params;
  const { user, token } = useAuth();

  if (!user || !token) return null;

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);

  const handleAddContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };

  const screenWidth = Dimensions.get("window").width;

  let isEditable: boolean = false;
  if (
    user.profileCategory !== "sportsman" &&
    user.profileCategory !== "free" &&
    user.profileCategory !== "partner"
  ) {
    isEditable = true;
  }

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
              source={getImageSource(exercise.filePicture.url)}
              style={{ borderRadius: 8 }}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{exercise.label}</AppText>
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
                {getMinutesFromDuration(exercise.durationTime)} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            {muscleGroups.map((muscleGroup) => (
              <Label
                key={muscleGroup.id}
                title={muscleGroup.label}
                textColor={muscleGroup.textColor}
                backgroundColor={muscleGroup.backgroundColor}
                size="normal"
              />
            ))}
          </View>
          <View>
            <AppText>{exercise.description}</AppText>
          </View>
          <View>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>
              Notes & Recommandations
            </AppText>
            <AppText>{exercise.recommendations}</AppText>

            {isEditable && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton title="Modifier" iconName="pencil" type="primary" />
              </View>
            )}
          </View>

          {isEditable && (
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
          token={token}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
