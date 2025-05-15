import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AppText from "../components/AppText";
import GlobalStyles from "../styles/styles";

export default function Companycreen() {
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
        <AppText>Company screen</AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
