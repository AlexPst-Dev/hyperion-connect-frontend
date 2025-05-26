import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import GlobalStyles from "../styles/styles";
import ItemUser from "../components/ItemUser";

export default function PartnersListScreen() {
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
        style={GlobalStyles.pageStyle}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "column", gap: 16 }}>
            <ItemUser
              isCompany
              companyName="Nutrisport"
              iconName="link"
              profilePictureUrl="users/companies/nutrisport-logo"
            />
            <ItemUser
              isCompany
              companyName="Nutrisport"
              iconName="link"
              profilePictureUrl="users/companies/nutrisport-logo"
            />
            <ItemUser
              isCompany
              companyName="Nutrisport"
              iconName="link"
              profilePictureUrl="users/companies/nutrisport-logo"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
