import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";
import { useAuth } from "../hooks/useAuth";
import { CompanyService } from "../services/api/company-service";
import { Company } from "../models/company";
import ItemUser from "../components/ItemUser";
import { UserService } from "../services/api/user-service";
import { UserResponse } from "../models/user";

export default function PartnersListScreen() {
  const screenWidth = Dimensions.get("window").width;

  const { token, user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [completeUser, setCompleteUser] = useState<UserResponse>();

  useEffect(() => {
    if (user && token) {
      try {
        async function fetchCompanies() {
          const companies = (await CompanyService.getAllCompanies()).filter(
            (c) => c.isActive
          );
          const completeUser = await UserService.getUserById(user!.id, token!);
          setCompanies(companies);
          setCompleteUser(completeUser);
        }
        fetchCompanies();
      } catch (e) {
        console.log("Error while fetching companies", e);
      }
    }
  }, [token, user]);

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
            {completeUser?.user &&
              companies.map((c) => (
                <ItemUser
                  isCompany={true}
                  user={completeUser?.user}
                  company={c}
                  iconName="link"
                />
              ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
