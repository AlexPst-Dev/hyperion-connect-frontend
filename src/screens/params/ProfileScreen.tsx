import env from "@/env";
import AppButton from "@/src/components/AppButton";
import AppText from "@/src/components/AppText";
import { FileUploadButton } from "@/src/components/FileUploadButton";
import Icon from "@/src/components/Icon";
import Input from "@/src/components/Input";
import { notify } from "@/src/components/NotificationContainer";
import PopUp from "@/src/components/PopUp";
import UserCard from "@/src/components/UserCard";
import { useAuth } from "@/src/hooks/useAuth";
import { File, FileCategory } from "@/src/models/file";
import {
  UserResponse,
  ProfileCategory,
  SportsmanProfile,
  CoachProfile,
  MedicProfile,
} from "@/src/models/user";
import { categoryService } from "@/src/services/api/category-service";
import { UserService } from "@/src/services/api/user-service";
import GlobalStyles, { Colors } from "@/src/styles/styles";
import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
  Pressable,
  Modal,
} from "react-native";

export default function ProfileScreen() {
  const { user, token } = useAuth();

  const screenWidth = Dimensions.get("window").width;

  const [userLoading, setUserLoading] = useState(false);
  const [completeUser, setCompleteUser] = useState<UserResponse | null>(null);

  const [sportLabel, setSportLabel] = useState<string>("");

  const [editUserCardPopUpVisible, setEditUserCardPopupVisible] =
    useState(false);
  const [editSocialsLinks, setEditSocialsLinks] = useState(false);

  const [profilePicture, setProfilePicture] = useState("");

  const [userInfoForm, setUserInfoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
    city: "",
    postalCode: "",
    street: "",
  });

  const [socialLinksForm, setSocialLinksForm] = useState({
    stravaLink: "",
    facebookLink: "",
    instagramLink: "",
    linkedinLink: "",
    tiktokLink: "",
    youtubeLink: "",
  });

  async function fetchCompleteUserProfile() {
    if (token && user) {
      const req = await UserService.getUserById(user.id, token);
      setCompleteUser(req);

      if (req.filePicture) getImageUrl(req.filePicture);

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
  useEffect(() => {
    setUserLoading(true);
    fetchCompleteUserProfile();
  }, [user, token]);

  useEffect(() => {
    if (editUserCardPopUpVisible && completeUser) {
      setUserInfoForm({
        firstName: completeUser.user.firstName || "",
        lastName: completeUser.user.lastName || "",
        description: completeUser.user.description || "",
        email: completeUser.user.email || "",
        phone: completeUser.user.phone || "",
        city: completeUser.user.city || "",
        postalCode: completeUser.user.postalCode || "",
        street: completeUser.user.street || "",
      });
    }
  }, [editUserCardPopUpVisible, completeUser?.user.id]);

  useEffect(() => {
    if (editSocialsLinks && completeUser) {
      setSocialLinksForm({
        stravaLink: completeUser.user.stravaLink || "",
        facebookLink: completeUser.user.facebookLink || "",
        instagramLink: completeUser.user.instagramLink || "",
        linkedinLink: completeUser.user.linkedinLink || "",
        tiktokLink: completeUser.user.tiktokLink || "",
        youtubeLink: completeUser.user.youtubeLink || "",
      });
    }
  }, [editSocialsLinks, completeUser?.user.id]);

  // Handle input changes
  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinksChange = (field: string, value: string) => {
    setSocialLinksForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserInfoSubmit = async () => {
    if (!completeUser || !token) return;
    try {
      await UserService.updateUserByProfileAndId(
        completeUser.user.id,
        completeUser.user.profileCategory,
        userInfoForm,
        token
      );

      const newUserForRefetch = await UserService.getUserById(
        completeUser.user.id,
        token
      );

      setCompleteUser(newUserForRefetch);
      setEditUserCardPopupVisible(false);

      notify({
        title: "Informations modifiées avec succès",
        type: "success",
      });
    } catch (e) {
      console.log("Error updating user:", e);
      notify({
        title: "Les informations n'ont pas pu être modifiées",
        type: "error",
      });
    }
  };

  const handleSocialLinksSubmit = async () => {
    if (!completeUser || !token) return;
    try {
      await UserService.updateUserByProfileAndId(
        completeUser.user.id,
        completeUser.user.profileCategory,
        socialLinksForm,
        token
      );

      const newUserForRefetch = await UserService.getUserById(
        completeUser.user.id,
        token
      );

      setCompleteUser(newUserForRefetch);
      setEditSocialsLinks(false);

      notify({
        title: "Liens sociaux modifiés avec succès",
        type: "success",
      });
    } catch (e) {
      console.log("Error updating social links:", e);
      notify({
        title: "Les liens sociaux n'ont pas pu être modifiés",
        type: "error",
      });
    }
  };

  const getImageUrl = async (filePicture: File) => {
    if (!filePicture || filePicture.fileCategory !== FileCategory.IMAGE) {
      return "";
    }

    if (!token) {
      console.error("Token manquant !");
      return "";
    }

    const fullUrl = `${env.API_URL}/files/image/${filePicture.id}`;

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Convertir en base64 pour React Native
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          setProfilePicture(base64String);
          resolve(base64String);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'image:", error);
      return "";
    }
  };

  if (!completeUser || !user || !token)
    return <AppText>Impossible de récupérer le profil</AppText>;

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
              firstName={completeUser.user.firstName}
              lastName={completeUser.user.lastName}
              email={completeUser.user.email}
              phone={completeUser.user.phone}
              sport={sportLabel}
              age={UserService.getUserAge(completeUser.user)?.toString()}
              profilePictureUrl={completeUser.filePicture ? profilePicture : ""}
              token={token}
            />
            <FileUploadButton
              fileCategory={FileCategory.IMAGE}
              label="Changer de photo de profil"
              authToken={token}
              authUser={user}
              onUploadSuccess={(file) => {
                fetchCompleteUserProfile();
                setEditUserCardPopupVisible(false);
              }}
              onUploadError={(error) => {
                console.error("Erreur:", error);
              }}
            />
            {completeUser.user.facebookLink ||
            completeUser.user.instagramLink ||
            completeUser.user.linkedinLink ||
            completeUser.user.stravaLink ||
            completeUser.user.tiktokLink ||
            completeUser.user.youtubeLink ? (
              <>
                <AppText>Réseaux sociaux</AppText>
                <View
                  style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}
                >
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    {completeUser.user.stravaLink && (
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
                    {completeUser.user.facebookLink && (
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
                    {completeUser.user.instagramLink && (
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
                    {completeUser.user.linkedinLink && (
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
                    {completeUser.user.tiktokLink && (
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
                    {completeUser.user.youtubeLink && (
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
                  <Pressable
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      backgroundColor: "transparent",
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: Colors.deepBlue,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => setEditSocialsLinks(true)}
                  >
                    <Icon
                      name="pencil"
                      strokeColor={Colors.deepBlue}
                      fillColor="transparent"
                    />
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <AppText>
                  Aucun réseaux social enregistré pour le moment.
                </AppText>
                <Pressable
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: Colors.deepBlue,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setEditSocialsLinks(true)}
                >
                  <Icon
                    name="pencil"
                    strokeColor={Colors.deepBlue}
                    fillColor="transparent"
                  />
                </Pressable>
              </>
            )}
            <AppText>{completeUser.user.description}</AppText>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="primary"
                title="Modifier"
                iconName="pencil"
                onPress={() => {
                  setEditUserCardPopupVisible(true);
                }}
              />
            </View>
          </View>
        )}
        {editUserCardPopUpVisible && (
          <Modal
            visible={editUserCardPopUpVisible}
            onRequestClose={() => setEditUserCardPopupVisible(false)}
            transparent
          >
            <Pressable
              onPress={() => setEditUserCardPopupVisible(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                onClose={() => setEditUserCardPopupVisible(false)}
                title={"Modifier vos informations"}
                onSubmit={handleUserInfoSubmit}
                btnText="Modifier"
                btnType="primary"
                iconName="pencil"
                closeText="Annuler"
                inputs={
                  <>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Nom"
                          placeholder="DOE"
                          value={userInfoForm.lastName}
                          onChangeText={(v) =>
                            handleUserInfoChange("lastName", v)
                          }
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Prénom"
                          placeholder="John"
                          value={userInfoForm.firstName}
                          onChangeText={(v) =>
                            handleUserInfoChange("firstName", v)
                          }
                        />
                      </View>
                    </View>
                    <Input
                      type="text"
                      label="Email"
                      placeholder="exemple@mail.com"
                      value={userInfoForm.email}
                      onChangeText={(v) => handleUserInfoChange("email", v)}
                    />
                    <Input
                      type="text"
                      label="Téléphone"
                      placeholder="06XXXXXXXX"
                      value={userInfoForm.phone}
                      onChangeText={(v) => handleUserInfoChange("phone", v)}
                    />
                    <Input
                      type="textarea"
                      label="Description"
                      placeholder="Description"
                      value={userInfoForm.description}
                      onChangeText={(v) =>
                        handleUserInfoChange("description", v)
                      }
                    />
                    <Input
                      type="text"
                      label="Adresse"
                      placeholder="Adresse"
                      value={userInfoForm.street}
                      onChangeText={(v) => handleUserInfoChange("street", v)}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Ville"
                          placeholder="Ville"
                          value={userInfoForm.city}
                          onChangeText={(v) => handleUserInfoChange("city", v)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Code postal"
                          placeholder="Code postal"
                          value={userInfoForm.postalCode}
                          onChangeText={(v) =>
                            handleUserInfoChange("postalCode", v)
                          }
                        />
                      </View>
                    </View>
                  </>
                }
              />
            </Pressable>
          </Modal>
        )}
        {editSocialsLinks && (
          <Modal
            visible={editSocialsLinks}
            onRequestClose={() => setEditSocialsLinks(false)}
            transparent
          >
            <Pressable
              onPress={() => setEditSocialsLinks(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                onClose={() => setEditSocialsLinks(false)}
                title={"Modifier les réseaux sociaux de l'entreprise"}
                onSubmit={handleSocialLinksSubmit}
                btnText="Modifier"
                btnType="primary"
                iconName="pencil"
                closeText="Annuler"
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Strava"
                      placeholder="https://strava.com/..."
                      value={socialLinksForm.stravaLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("stravaLink", v)
                      }
                    />
                    <Input
                      type="text"
                      label="Facebook"
                      placeholder="https://facebook.com/..."
                      value={socialLinksForm.facebookLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("facebookLink", v)
                      }
                    />
                    <Input
                      type="text"
                      label="Instagram"
                      placeholder="https://instagram.com/..."
                      value={socialLinksForm.instagramLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("instagramLink", v)
                      }
                    />
                    <Input
                      type="text"
                      label="LinkedIn"
                      placeholder="https://linkedin.com/..."
                      value={socialLinksForm.linkedinLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("linkedinLink", v)
                      }
                    />
                    <Input
                      type="text"
                      label="TikTok"
                      placeholder="https://tiktok.com/..."
                      value={socialLinksForm.tiktokLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("tiktokLink", v)
                      }
                    />
                    <Input
                      type="text"
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      value={socialLinksForm.youtubeLink}
                      onChangeText={(v) =>
                        handleSocialLinksChange("youtubeLink", v)
                      }
                    />
                  </>
                }
              />
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
