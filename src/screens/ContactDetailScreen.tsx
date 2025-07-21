// src/screens/SessionDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles from "../styles/styles";
import UserCard from "../components/UserCard";
import AppText from "../components/AppText";
import {
  CoachProfile,
  MedicProfile,
  ProfileCategory,
  SportsmanProfile,
  UserResponse,
} from "../models/user";
import { UserService } from "../services/api/user-service";
import { useAuth } from "../hooks/useAuth";
import { categoryService } from "../services/api/category-service";
import { fileService } from "../services/api/file-service";
import { File } from "../models/file";
import { useAnyUserProfileImage } from "../hooks/useImageProfilePicture";

type ContactDetailRouteProp = RouteProp<RootStackParamList, "ContactDetail">;

export default function ContactDetailScreen() {
  const route = useRoute<ContactDetailRouteProp>();
  const { contact } = route.params;

  const { token } = useAuth();

  const screenWidth = Dimensions.get("window").width;

  const [userLoading, setUserLoading] = useState(false);
  const [completeUser, setCompleteUser] = useState<UserResponse | null>(null);
  const [profileFile, setProfileFile] = useState<File | undefined>(undefined);

  const [sportLabel, setSportLabel] = useState<string>("");

  useEffect(() => {
    setUserLoading(true);
    async function fetchCompleteUserProfile() {
      if (token) {
        const req = await UserService.getUserById(contact.id, token);
        setCompleteUser(req);

        // Fetch sport/medic category label if available
        let categoryId: number | undefined;
        if (
          req.user.profileCategory === ProfileCategory.SPORTSMAN &&
          (req.profile as SportsmanProfile)?.sportCategoryId
        ) {
          categoryId = (req.profile as SportsmanProfile).sportCategoryId;
        } else if (
          req.user.profileCategory === ProfileCategory.COACH &&
          (req.profile as CoachProfile)?.sportCategoryId
        ) {
          categoryId = (req.profile as CoachProfile).sportCategoryId;
        } else if (
          req.user.profileCategory === ProfileCategory.MEDIC &&
          (req.profile as MedicProfile)?.medicCategoryId
        ) {
          categoryId = (req.profile as MedicProfile).medicCategoryId;
        }

        if (categoryId && token) {
          try {
            const category = await categoryService.getCategoryById(
              categoryId,
              token
            );
            setSportLabel(category.label);
          } catch (e) {
            setSportLabel("");
          }
        } else {
          setSportLabel("");
        }

        setUserLoading(false);
      }
    }
    fetchCompleteUserProfile();
  }, [contact, token]);
  useEffect(() => {
    async function fetchProfileFile() {
      if (contact.filePictureId && token) {
        try {
          const file = await fileService.getFileById(
            Number(contact.filePictureId),
            token
          );
          setProfileFile(file);
        } catch (e) {
          setProfileFile(undefined);
        }
      } else {
        setProfileFile(undefined);
      }
    }
    fetchProfileFile();
  }, [contact.filePictureId, token]);

  const { profilePicture, isUserPPLoading } =
    useAnyUserProfileImage(profileFile);

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
        {userLoading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ flexDirection: "column", gap: 24 }}>
            <UserCard
              detailled
              canBeContacted
              firstName={contact.firstName}
              lastName={contact.lastName}
              email={contact.email}
              phone={contact.phone}
              sport={sportLabel}
              age={UserService.getUserAge(contact)?.toString()}
              profilePictureUrl={profilePicture}
            />
            {(contact.facebookLink ||
              contact.instagramLink ||
              contact.linkedinLink) && (
              <>
                <AppText>Réseaux sociaux</AppText>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  {contact.facebookLink && (
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                  )}
                  {contact.instagramLink && (
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                  )}
                  {contact.linkedinLink && (
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                  )}
                </View>
              </>
            )}
            <AppText>{contact.description}</AppText>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
