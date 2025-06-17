import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";

export default function PartnersListScreen() {
  const screenWidth = Dimensions.get("window").width;

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
          style={
            Platform.OS === "web"
              ? { maxHeight: screenWidth + 180, paddingBottom: 32 }
              : {}
          }
        >
          <View style={{ flexDirection: "column", gap: 16 }}>
            {/* <ItemUser
              isCompany
              company={{
                name: "Nutrisport",
                id: 1,

              }}
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
            /> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
