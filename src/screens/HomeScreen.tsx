import React from "react";
import { KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import GlobalStyles from "../styles/styles";
import AppText from "../components/AppText";

export default function HomeScreen() {
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
        <AppText>Home screen</AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
