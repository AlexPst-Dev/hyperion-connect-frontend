import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="justify-center items-center bg-white mb-6">
          <Icon name="user" width={24} height={24} />
          <Text className="text-2xl font-bold text-deepBlue">
            Bienvenue {user?.firstName} {user?.lastName} 👋
          </Text>
        </View>

        <AppText style={GlobalStyles.h1}>Test composant ...</AppText>

        <View style={{ display: "flex", flexDirection: "column" }}></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
