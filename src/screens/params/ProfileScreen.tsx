import env from "@/env";
import AppButton from "@/src/components/AppButton";
import AppText from "@/src/components/AppText";
import { FileUploadButton } from "@/src/components/FileUploadButton";
import Icon from "@/src/components/Icon";
import Input from "@/src/components/Input";
import ItemFile from "@/src/components/ItemFile";
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
import {
  getMonthsBetween,
  getOngoingMonth,
  Objective as ObjectiveModel,
} from "@/src/models/objective";
import { categoryService } from "@/src/services/api/category-service";
import { fileService } from "@/src/services/api/file-service";
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
  Linking,
} from "react-native";
import { Billing } from "@/src/models/billing";
import { ObjectivesApiService } from "@/src/services/api/objective-service";
import { SessionService } from "@/src/services/api/session-service";
import Objective from "@/src/components/Objective";
import { billingService } from "@/src/services/api/billing-service";
import BillingGroup from "@/src/components/BillingGroup";
import BillingLine from "@/src/components/BillingLine";

export default function ProfileScreen() {
  const { user, token } = useAuth();

  const screenWidth = Dimensions.get("window").width;

  const [userLoading, setUserLoading] = useState(false);
  const [completeUser, setCompleteUser] = useState<UserResponse | null>(null);

  const [objectives, setObjectives] = useState<ObjectiveModel[]>([]);
  const [billingGroups, setBillingGroups] = useState<
    {
      objective: ObjectiveModel;
      billings: Billing[];
    }[]
  >([]);

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

  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [medicFiles, setMedicFiles] = useState<File[]>([]);
  let isMounted = true;

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
        }
      } else if (
        req.user.profileCategory === ProfileCategory.COACH &&
        (req.profile as CoachProfile)?.sportCategories
      ) {
        const catCoach = (req.profile as CoachProfile).sportCategories || [];
        setSportLabel(
          catCoach.length > 0 ? catCoach.map((c) => c.label).join(", ") : ""
        );
      } else if (
        req.user.profileCategory === ProfileCategory.MEDIC &&
        (req.profile as MedicProfile)?.sportCategories
      ) {
        const catMedic = (req.profile as MedicProfile).sportCategories || [];
        setSportLabel(
          catMedic.length > 0 ? catMedic.map((c) => c.label).join(", ") : ""
        );
      }

      if (req.user.profileCategory === ProfileCategory.SPORTSMAN) {
        // User files
        if ((req.profile as SportsmanProfile)?.listUserFiles) {
          const listUserFiles = (req.profile as SportsmanProfile).listUserFiles;
          const ids = listUserFiles
            ? listUserFiles
                .split(";")
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id))
            : [];
          try {
            const files = await Promise.all(
              ids.map((id) => fileService.getFileById(id, token))
            );
            if (isMounted) setUserFiles(files);
          } catch {
            if (isMounted) setUserFiles([]);
          }
        }

        // Medic files
        if ((req.profile as SportsmanProfile)?.listMedicFiles) {
          const listMedicFiles = (req.profile as SportsmanProfile)
            .listMedicFiles;
          const ids = listMedicFiles
            ? listMedicFiles
                .split(";")
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id))
            : [];
          try {
            const files = await Promise.all(
              ids.map((id) => fileService.getFileById(id, token))
            );
            if (isMounted) setMedicFiles(files);
          } catch {
            if (isMounted) setMedicFiles([]);
          }
        }

        const objectives = await ObjectivesApiService.getObjectivesBySportsman(
          req.user.id,
          token
        );

        if (!isMounted) return;
        setObjectives(objectives);

        try {
          const activeObjectives = objectives.filter((obj) => obj.isActive);
          const groups = await Promise.all(
            activeObjectives.map(async (objective) => {
              const { billings } =
                await billingService.getBillingsByObjectiveId(
                  objective.id,
                  token
                );
              return { objective, billings };
            })
          );
          if (isMounted) setBillingGroups(groups);
        } catch {
          if (isMounted) setBillingGroups([]);
        }
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
          <>
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
                profilePictureUrl={
                  completeUser.filePicture ? profilePicture : ""
                }
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
              completeUser.user.tiktokLink ? (
                <>
                  <AppText>Réseaux sociaux</AppText>
                  <View
                    style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}
                  >
                    {completeUser.user.stravaLink && (
                      <Pressable
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        onPress={() =>
                          completeUser.user.stravaLink
                            ? Linking.openURL(completeUser.user.stravaLink)
                            : {}
                        }
                      >
                        <Image
                          source={require("../../assets/images/socials/strava-icon.png")}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    {completeUser.user.facebookLink && (
                      <Pressable
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        onPress={() =>
                          completeUser.user.facebookLink
                            ? Linking.openURL(completeUser.user.facebookLink)
                            : {}
                        }
                      >
                        <Image
                          source={require("../../assets/images/socials/facebook-icon.png")}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    {completeUser.user.instagramLink && (
                      <Pressable
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        onPress={() =>
                          completeUser.user.instagramLink
                            ? Linking.openURL(completeUser.user.instagramLink)
                            : {}
                        }
                      >
                        <Image
                          source={require("../../assets/images/socials/instagram-icon.png")}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    {completeUser.user.linkedinLink && (
                      <Pressable
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        onPress={() =>
                          completeUser.user.linkedinLink
                            ? Linking.openURL(completeUser.user.linkedinLink)
                            : {}
                        }
                      >
                        <Image
                          source={require("../../assets/images/socials/linkedin-icon.png")}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    {completeUser.user.tiktokLink && (
                      <Pressable
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                        onPress={() =>
                          completeUser.user.tiktokLink
                            ? Linking.openURL(completeUser.user.tiktokLink)
                            : {}
                        }
                      >
                        <Image
                          source={require("../../assets/images/socials/tiktok-icon.png")}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
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
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
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
            {user.profileCategory === ProfileCategory.SPORTSMAN && (
              <View style={{ flexDirection: "column", gap: 24, marginTop: 24 }}>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>
                    TESTS SPORTIFS & BILANS
                  </AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    {userFiles.length > 0 ? (
                      userFiles.map((file) => (
                        <ItemFile
                          key={file.id}
                          file={file}
                          displayControllers={
                            user.profileCategory === "admin" ||
                            user.profileCategory === "coach"
                          }
                          token={token!}
                          uploadToASpecificId={user.id}
                        />
                      ))
                    ) : (
                      <AppText>Aucun tests sportifs ou bilans</AppText>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>
                    COMPTES RENDUS MEDICAUX
                  </AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    {medicFiles.length > 0 ? (
                      medicFiles.map((file) => (
                        <ItemFile
                          key={file.id}
                          file={file}
                          displayControllers={
                            user.profileCategory === "admin" ||
                            user.profileCategory === "medic"
                          }
                          token={token!}
                          uploadToASpecificId={user.id}
                        />
                      ))
                    ) : (
                      <AppText>Aucun compte rendu médical</AppText>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>
                    PRESTATION & ECHEANCES
                  </AppText>
                  {objectives.filter((obj) => obj.isActive).length > 0 ? (
                    objectives
                      .filter((obj) => obj.isActive)
                      .map((objective) => (
                        <Objective
                          key={objective.id}
                          duration={getMonthsBetween(
                            objective.startDate,
                            objective.endDate
                          )}
                          onGoingNumber={getOngoingMonth(
                            objective.startDate,
                            objective.endDate
                          )}
                          label={objective.label}
                        />
                      ))
                  ) : (
                    <AppText>Aucun objectif défini</AppText>
                  )}
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>FACTURATION</AppText>
                  {billingGroups.length > 0 ? (
                    billingGroups.map(({ objective, billings }) => {
                      if (!billings.length) return null;

                      // Group billings by isMonthly
                      const isMonthly = billings[0].isMonthly;

                      // For monthly, sort by date descending (optional)
                      const sortedBillings = [...billings].sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                      );

                      return (
                        <BillingGroup
                          key={objective.id}
                          label={objective.label}
                          proFirstName={objective.responsible.firstName}
                          proLastName={objective.responsible.lastName}
                          sportsmanFirstName={objective.sportsman.firstName}
                          sportsmanLastName={objective.sportsman.lastName}
                          billingStartDate={new Date(objective.startDate)}
                          billingEndDate={new Date(objective.endDate)}
                          globalAmount={billings[0].globalAmount}
                          billingLines={
                            isMonthly
                              ? sortedBillings.map((billing) => (
                                  <BillingLine
                                    key={billing.billingId}
                                    amount={billing.monthlyAmount}
                                    state={
                                      billing.paymentReceived
                                        ? "received"
                                        : "pending"
                                    }
                                    startDate={new Date(billing.date)}
                                    // set endate to startDate + 1 month
                                    endDate={
                                      new Date(
                                        new Date(billing.date).setMonth(
                                          new Date(billing.date).getMonth() + 1
                                        )
                                      )
                                    }
                                    onBtnChangeStatePress={() => {
                                      if (token)
                                        try {
                                          billingService.updateBilling(
                                            billing.billingId,
                                            {
                                              paymentReceived: true,
                                            },
                                            token
                                          );
                                          notify({
                                            title:
                                              "Facture marquée comme payée",
                                            type: "success",
                                          });
                                        } catch (error) {
                                          notify({
                                            title:
                                              "Erreur lors de la mise à jour de la facture",
                                            type: "error",
                                          });
                                          console.log(error);
                                        }
                                    }}
                                  />
                                ))
                              : [
                                  <BillingLine
                                    key={billings[0].billingId}
                                    amount={billings[0].globalAmount}
                                    state={
                                      billings[0].paymentReceived
                                        ? "received"
                                        : "pending"
                                    }
                                    startDate={new Date(objective.startDate)}
                                    endDate={new Date(objective.endDate)}
                                  />,
                                ]
                          }
                        />
                      );
                    })
                  ) : (
                    <AppText>Aucune facturation trouvée</AppText>
                  )}
                </View>
              </View>
            )}
          </>
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
