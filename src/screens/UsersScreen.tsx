import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import GlobalStyles from "../styles/styles";
import AppText from "../components/AppText";

export default function UsersScreen() {
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
        <AppText>Users screen</AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
