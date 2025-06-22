// src/screens/SessionDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AppText from "@/src/components/AppText";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "../components/Icon";
import Session from "../components/Session";
import Label from "../components/Label";
import AppButton from "../components/AppButton";
import Input from "../components/Input";
import PopUp from "../components/PopUp";
import * as DocumentPicker from "expo-document-picker";
import AddContacts from "../components/popups/AddContacts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import {
  addExercisesToSessionList,
  getMinutesFromDuration,
  SessionService,
} from "../services/api/session-service";
import { fileService } from "../services/api/file-service";
import { UpdateSessionRequest } from "../models/session";
import { getImageSource } from "../utils/imgSrcHandler";
import { exerciseService } from "../services/api/exercise-service";
import { CreateExerciseRequest, ExerciseWithDetails } from "../models/exercise";
import { Category, CategoryType } from "../models/category";
import AddExercises from "../components/popups/AddExercise";
import {
  AdminProfile,
  CoachProfile,
  MedicProfile,
  ProfileCategory,
  User,
} from "../models/user";
import { UserService } from "../services/api/user-service";
import { FileCategory, File as FileModel } from "../models/file";
import { notify } from "../components/NotificationContainer";
import { categoryService } from "../services/api/category-service";

type SessionDetailRouteProp = RouteProp<RootStackParamList, "SessionDetail">;

export default function SessionDetailScreen() {
  const route = useRoute<SessionDetailRouteProp>();
  const { session } = route.params;

  const [currentSession, setCurrentSession] = useState({
    ...session,
    filePicture: session.filePicture || null,
  });

  type ModalStep = "selector" | "catalog" | "custom" | "import";

  const [modalStep, setModalStep] = useState<ModalStep | null>(null);

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);

  const closeModal = () => setModalStep(null);

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log("Annulé");
      return;
    }

    console.log("Fichier sélectionné :", result.assets[0]);
  };

  const handleAddContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };
  const handleAddContactSubmit = async (selectedUsers: User[]) => {
    if (!session || !selectedUsers || selectedUsers.length === 0 || !token)
      return;

    for (const selectedUser of selectedUsers) {
      const completeUserProfile = await UserService.getUserById(
        selectedUser.id,
        token
      );
      if (!completeUserProfile || !completeUserProfile.profile) {
        console.warn(
          `User with ID ${selectedUser.id} does not have a complete profile.`
        );
        continue;
      }
      const linkedSessionsOfSelectedUser =
        await SessionService.getSessionsByUser(selectedUser.id, token);

      // Ensure correct types for comparison
      const isDuplicate = linkedSessionsOfSelectedUser.some(
        (ls) =>
          Number(ls.sessionId) === Number(session.id) &&
          Number(ls.userId) === Number(selectedUser.id)
      );

      if (
        selectedUser.profileCategory !== ProfileCategory.SPORTSMAN ||
        isDuplicate
      ) {
        console.warn(
          `User ${selectedUser.firstName} ${selectedUser.lastName} is not a sportsman or already linked to this session.`
        );
        continue;
      }

      try {
        await SessionService.addSessionToUser(
          selectedUser.id,
          session.id,
          token
        );
        console.log(
          `Session ${session.label} added to sportsman ${selectedUser.firstName} ${selectedUser.lastName}.`
        );
      } catch (error) {
        console.error("Error adding session to sportsman:", error);
      }
    }
    setAddContactPopUpVisible(false);
  };

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ExerciceDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const { user, token } = useAuth();

  const [completeUserProfile, setCompleteUserProfile] = useState<
    MedicProfile | CoachProfile
  >();

  if (!user || !token) return null;

  let isEditable: boolean = false;
  if (
    user.profileCategory !== "sportsman" &&
    user.profileCategory !== "free" &&
    user.profileCategory !== "partner"
  ) {
    isEditable = true;
  }

  const screenWidth = Dimensions.get("window").width;

  const [editSessionPopUpVisible, setEditSessionPopUpVisible] = useState(false);
  const [sessionEditionLoading, setSessionEditionLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    label: "",
    filePictureUrl: "",
    recommendations: "",
    contributions: "",
  });

  const [exerciseditionLoading, setExerciseEditionLoading] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    label: "",
    muscleGroups: [] as Category[],
    recommendations: "",
    description: "",
    filePictureUrl: "",
    durationTime: "",
  });

  const [exercisesOfSession, setExercisesOfSession] = useState<
    ExerciseWithDetails[]
  >([]);
  const [allMuscleGroups, setAllMuscleGroups] = useState<Category[]>([]);

  type ExerciseWithMuscleGroups = {
    exercise: ExerciseWithDetails;
    muscleGroups: Category[];
  };

  const [muscleGroupsByExercise, setMuscleGroupsByExercise] = useState<
    ExerciseWithMuscleGroups[]
  >([]);
  const handleSessionFormChange = (field: string, value: any) => {
    setSessionForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleExerciseFormChange = (field: string, value: any) => {
    setExerciseForm((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch and update session after edit
  const refreshSession = async () => {
    try {
      const updated = await SessionService.getSessionById(session.id, token);
      setCurrentSession({
        ...updated.session,
        filePicture: updated.filePicture || updated.session.filePicture,
      });
    } catch (e) {
      console.error("Failed to refresh session:", e);
    }
  };

  const handleEditSessionSubmit = async () => {
    setSessionEditionLoading(true);
    if (token && sessionForm) {
      let newSessionImageFile: FileModel | undefined;
      if (sessionForm.filePictureUrl !== "") {
        const fileResponse = session.filePictureId
          ? await fileService.updateFile(
              session.filePictureId,
              {
                url: sessionForm.filePictureUrl,
              },
              token
            )
          : await fileService.createFile(
              {
                label: `${sessionForm.label.toLowerCase().trim()}-image`,
                url: sessionForm.filePictureUrl,
                fileCategory: FileCategory.IMAGE,
              },
              token
            );
        newSessionImageFile =
          "file" in fileResponse ? fileResponse.file : fileResponse;
      }

      const baseData: UpdateSessionRequest = {
        label:
          sessionForm.label !== session.label
            ? sessionForm.label
            : session.label,
        filePictureId:
          sessionForm.filePictureUrl !== "" && newSessionImageFile
            ? newSessionImageFile.id
            : undefined,

        recommendations:
          sessionForm.recommendations !== session.recommendations
            ? sessionForm.recommendations
            : session.recommendations,
        contributions:
          sessionForm.contributions !== session.contributions
            ? sessionForm.contributions
            : session.contributions,
      };

      try {
        await SessionService.updateSessionById(session.id, baseData, token);
        await refreshSession();
      } catch (error) {
        console.log("Error while trying to updating session : ", error);
      } finally {
        setSessionEditionLoading(false);
        setEditSessionPopUpVisible(false);
      }
    }
  };

  const handleEditExerciseSubmit = async () => {
    setExerciseEditionLoading(true);
    if (token && exerciseForm) {
      const newExerciseImageFile =
        exerciseForm.filePictureUrl !== ""
          ? await fileService.createFile(
              {
                label: `${exerciseForm.label.toLowerCase().trim()}-image`,
                url: exerciseForm.filePictureUrl,
                fileCategory: FileCategory.IMAGE,
              },
              token
            )
          : { id: undefined };

      const baseData: CreateExerciseRequest = {
        label: exerciseForm.label,
        durationTime: `${Math.floor(Number(exerciseForm.durationTime) / 60)}:${
          Number(exerciseForm.durationTime) % 60
        }`,
        filePictureId: newExerciseImageFile.id,
        recommendations: exerciseForm.recommendations,
        description: exerciseForm.description,
        listMuscleGroupIds: exerciseForm.muscleGroups
          .map((group) => group.id)
          .join("; "),
      };

      try {
        await exerciseService.createExercise(baseData, token).then((res) => {
          setExercisesOfSession((prev) => [...prev, res.exercice]);
          handleAddNewExercisesToSession([res.exercice]);
          notify({ title: "Exercice créé avec succès", type: "success" });
        });
      } catch (error) {
        notify({
          title: "Erreur lors de la création de la'exercice",
          type: "error",
        });
        console.log("Error while trying to create exercise : ", error);
      } finally {
        setExerciseEditionLoading(false);
      }
    }
  };

  const handleFetchExercises = async (sessionId: number) => {
    try {
      const resExercises = await SessionService.getExercisesBySessionId(
        sessionId,
        token
      );
      setExercisesOfSession(resExercises.exercises);

      if (resExercises.exercises.length > 0) {
        const exercisesWithMuscleGroups = await Promise.all(
          resExercises.exercises.map(async (exercise) => {
            const resMuscleGroups =
              await exerciseService.getMuscleGroupsForExercise(
                exercise.id,
                token
              );
            return {
              exercise,
              muscleGroups: resMuscleGroups.muscleGroups,
            };
          })
        );

        setMuscleGroupsByExercise(exercisesWithMuscleGroups);
      }
    } catch (e) {
      console.log("Error while fetching exercises of the session", e);
    }
  };

  const handleAddNewExercisesToSession = async (
    exercises: ExerciseWithDetails[]
  ) => {
    if (!token || !session) return;

    try {
      const exerciseIds = exercises.map((ex) => ex.id);
      if (exerciseIds.length === 0) {
        console.log("No exercises selected to add to the session.");
        return;
      }
      const newExercises = await SessionService.updateSessionById(
        session.id,
        {
          listExercises: addExercisesToSessionList(
            session.listExercises,
            exerciseIds
          ),
          numberOfExercises: session.numberOfExercises + exerciseIds.length,
        },
        token
      );
      await handleFetchExercises(session.id);
    } catch (error) {
      console.error("Error adding exercises to session:", error);
    }
  };

  const fetchAllMuscleGroups = async () => {
    try {
      const resMuscleGroups = await categoryService.getCategoriesByType(
        CategoryType.MUSCLE_GROUP,
        token
      );
      setAllMuscleGroups(resMuscleGroups);
    } catch (error) {
      console.error("Error fetching muscle groups:", error);
    }
  };

  const getMinutesOfAllExercises = () => {
    return muscleGroupsByExercise.reduce((total, item) => {
      const duration = getMinutesFromDuration(item.exercise.durationTime);
      return total + duration;
    }, 0);
  };
  const getAllDistinctMuscleGroups = () => {
    const uniqueMuscleGroups: Category[] = [];
    const seenMuscleGroupIds = new Set<number>();

    muscleGroupsByExercise.forEach((item) => {
      item.muscleGroups.forEach((mg) => {
        if (!seenMuscleGroupIds.has(mg.id)) {
          seenMuscleGroupIds.add(mg.id);
          uniqueMuscleGroups.push(mg);
        }
      });
    });
    return uniqueMuscleGroups.map((mg) => (
      <Label
        key={mg.id}
        title={mg.label}
        textColor={mg.textColor}
        backgroundColor={mg.backgroundColor}
        size="normal"
      />
    ));
  };

  const handleDeleteSession = async () => {
    if (token) {
      try {
        if (
          user.profileCategory === ProfileCategory.COACH ||
          user.profileCategory === ProfileCategory.MEDIC
        ) {
          await SessionService.removeSessionToUser(user.id, session.id, token);
        } else if (user.profileCategory === ProfileCategory.ADMIN) {
          await SessionService.deleteSessionById(session.id, token);
        }
        if (session.filePictureId) {
          await fileService.deleteFile(session.filePictureId, token);
        }
        navigation.goBack();
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  useEffect(() => {
    if (currentSession) {
      setSessionForm({
        label: currentSession.label || "",
        filePictureUrl: currentSession.filePicture?.url || "",
        recommendations: currentSession.recommendations || "",
        contributions: currentSession.contributions || "",
      });
      handleFetchExercises(currentSession.id);
      fetchAllMuscleGroups();
      async function fetchUserProfile() {
        if (token && user) {
          try {
            const profileConnected = await UserService.getUserById(
              user.id,
              token
            );
            setCompleteUserProfile(profileConnected.profile as MedicProfile);
          } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
          }
        }
      }
      fetchUserProfile();
    }
  }, [currentSession, token, user]);

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
        <View style={{ flexDirection: "column", gap: 24 }}>
          {currentSession.filePicture && currentSession.filePicture.url ? (
            <View
              style={{
                height: 192,
                backgroundColor: Colors.grey,
                borderRadius: 8,
              }}
            >
              <Image
                source={getImageSource(currentSession.filePicture.url)}
                style={{ borderRadius: 8 }}
              />
            </View>
          ) : null}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{currentSession.label}</AppText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Icon
                name="timer"
                fillColor="transparent"
                strokeColor={Colors.grey}
                strokeWidth={1}
                width={12}
                height={12}
              />
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                {getMinutesOfAllExercises()} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            {getAllDistinctMuscleGroups()}
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>Recommandations</AppText>
            <AppText>{currentSession.recommendations}</AppText>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* interets */}
            <AppText style={{ fontWeight: "bold" }}>Apports & Interets</AppText>
            <AppText>{currentSession.contributions}</AppText>
          </View>
          {isEditable && (
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                title="Modifier"
                iconName="pencil"
                type="primary"
                onPress={() => setEditSessionPopUpVisible(true)}
              />
            </View>
          )}

          <Modal
            transparent
            visible={editSessionPopUpVisible}
            onRequestClose={() => setEditSessionPopUpVisible(false)}
          >
            <Pressable
              onPress={() => setEditSessionPopUpVisible(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Pressable
                onPress={() => {}}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <PopUp
                  onClose={() => setEditSessionPopUpVisible(false)}
                  title="Editer la session"
                  paragraph="Vous pouvez modifier dans les champs ci-dessous la session"
                  closeText="Annuler"
                  btnText="Modifier"
                  iconName="pencil"
                  btnType="primary"
                  onSubmit={handleEditSessionSubmit}
                  inputs={
                    sessionEditionLoading ? (
                      <ActivityIndicator />
                    ) : (
                      <>
                        <Input
                          type="text"
                          placeholder={
                            sessionForm.label || "Nom du plan d'entrainement"
                          }
                          label="Label"
                          value={sessionForm.label}
                          onChangeText={(v) =>
                            handleSessionFormChange("label", v)
                          }
                        />
                        <Input
                          type="text"
                          placeholder={"https://"}
                          label="Lien image"
                          value={sessionForm.filePictureUrl}
                          onChangeText={(v) =>
                            handleSessionFormChange("filePictureUrl", v)
                          }
                        />
                        <Input
                          type="textarea"
                          placeholder={
                            sessionForm.recommendations ||
                            "Conseils, mises en garde..."
                          }
                          label="Recommandations"
                          value={sessionForm.recommendations}
                          onChangeText={(v) =>
                            handleSessionFormChange("recommendations", v)
                          }
                        />
                        <Input
                          type="textarea"
                          placeholder={
                            sessionForm.contributions ||
                            "Apports et intérêts du programme"
                          }
                          label="Contributions"
                          value={sessionForm.contributions}
                          onChangeText={(v) =>
                            handleSessionFormChange("contributions", v)
                          }
                        />
                      </>
                    )
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>PROGRAMMES</AppText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Icon
                name="dumbell"
                fillColor="transparent"
                strokeColor={Colors.grey}
                strokeWidth={1}
                width={12}
                height={12}
              />
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                {muscleGroupsByExercise.length} exercices
              </AppText>
            </View>
          </View>
          {/* Exercises */}
          <View style={{ flexDirection: "column", gap: 8 }}>
            {muscleGroupsByExercise.length > 0 ? (
              muscleGroupsByExercise.map((item) => {
                return (
                  <Session
                    key={item.exercise.id}
                    isExercice
                    title={item.exercise.label}
                    durationTime={getMinutesFromDuration(
                      item.exercise.durationTime
                    )}
                    labels={item.muscleGroups.map((muscleGroup) => (
                      <Label
                        key={muscleGroup.id}
                        title={muscleGroup.label}
                        textColor={muscleGroup.textColor}
                        backgroundColor={muscleGroup.backgroundColor}
                        size="small"
                      />
                    ))}
                    onPress={() =>
                      navigation.navigate("ExerciceDetail", {
                        exercise: item.exercise,
                        muscleGroups: item.muscleGroups,
                      })
                    }
                  />
                );
              })
            ) : (
              <AppText>Aucun exercises dans ce plan d'entrainement</AppText>
            )}
            {isEditable && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  iconName="plus"
                  type="add"
                  onPress={() => setModalStep("selector")}
                />
              </View>
            )}
          </View>

          {isEditable && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={handleDeleteSession}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingBottom: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: "#C61010",
                }}
              >
                <AppText style={{ color: "#C61010" }}>Supprimer</AppText>
                <Icon
                  name="trash"
                  strokeColor="#C61010"
                  fillColor="transparent"
                  strokeWidth={1}
                />
              </Pressable>
              <AppButton
                type="secondary"
                title="Envoyer"
                iconName="send"
                onPress={handleAddContactPopUpVisible}
              />
            </View>
          )}
        </View>

        <Modal
          visible={modalStep !== null}
          transparent
          onRequestClose={closeModal}
        >
          <Pressable
            onPress={closeModal}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              {modalStep === "selector" && (
                <PopUp
                  onClose={closeModal}
                  title="Ajouter un exercice"
                  paragraph="Souhaitez-vous ajouter un exercice depuis le catalogue existant ou le créer vous-même ?"
                  onSubmit={closeModal}
                  specificBody={
                    <View style={{ flexDirection: "column", gap: 24 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <AppButton
                          type="secondary"
                          title="Catalogue"
                          iconName="plus"
                          onPress={() => setModalStep("catalog")}
                        />
                        <View
                          style={{
                            height: 24,
                            width: 1,
                            backgroundColor: "black",
                          }}
                        />
                        <AppButton
                          type="secondary"
                          title="Personnalisé"
                          iconName="plus"
                          onPress={() => setModalStep("custom")}
                        />
                      </View>
                      {completeUserProfile?.canImportSessions && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                          }}
                        >
                          <AppButton
                            type="secondary"
                            title="Importer"
                            iconName="download"
                            onPress={() => {
                              setModalStep("import");
                              handleImport();
                            }}
                          />
                        </View>
                      )}
                      <Pressable
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                        onPress={closeModal}
                      >
                        <AppText>Annuler</AppText>
                      </Pressable>
                    </View>
                  }
                />
              )}

              {modalStep === "import" && (
                <PopUp
                  title="Importation d'une session"
                  closeText="Fermer"
                  onClose={closeModal}
                  paragraph="Importation du fichier en cours..."
                />
              )}

              {modalStep === "catalog" && (
                <AddExercises
                  visible={true}
                  onClose={closeModal}
                  onSubmit={(exercises) => {
                    handleAddNewExercisesToSession(exercises);
                    console.log("Sessions sélectionnées :", exercises);
                    closeModal();
                  }}
                />
              )}

              {modalStep === "custom" && (
                <PopUp
                  title="Editer un exercice"
                  btnText="Editer"
                  iconName="pencil"
                  closeText="Annuler"
                  onSubmit={() => {
                    handleEditExerciseSubmit();
                    closeModal();
                  }}
                  btnType="primary"
                  inputs={
                    <>
                      <Input
                        type="text"
                        label="Libellé de l'exercice"
                        placeholder="Libellé"
                        value={exerciseForm.label}
                        onChangeText={(v) =>
                          handleExerciseFormChange("label", v)
                        }
                      />
                      <Input
                        type="multiSelector"
                        placeholder="Jambes"
                        label="Groupes musculaire"
                        value={exerciseForm.muscleGroups.map((mg) =>
                          String(mg.id)
                        )}
                        onChangeText={(idsString: string) => {
                          // Convert comma-separated string to array of IDs
                          const ids = idsString.split(",").filter(Boolean);
                          // Map IDs to Category objects from allMuscleGroups
                          const selected = allMuscleGroups.filter((mg) =>
                            ids.includes(String(mg.id))
                          );
                          setExerciseForm((prev) => ({
                            ...prev,
                            muscleGroups: selected,
                          }));
                        }}
                        options={allMuscleGroups.map((mg) => ({
                          label: mg.label,
                          value: String(mg.id),
                        }))}
                      />
                      <Input
                        type="text"
                        placeholder="https://"
                        label="Lien image"
                        value={exerciseForm.filePictureUrl}
                        onChangeText={(v) =>
                          handleExerciseFormChange("filePictureUrl", v)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="XX minutes"
                        label="Durée"
                        value={exerciseForm.durationTime}
                        onChangeText={(v) =>
                          handleExerciseFormChange("durationTime", v)
                        }
                      />
                      <Input
                        type="textarea"
                        label="Description"
                        placeholder="Remplissez une description ici..."
                        value={exerciseForm.description}
                        onChangeText={(v) =>
                          handleExerciseFormChange("description", v)
                        }
                      />
                      <Input
                        type="textarea"
                        label="Recommandations"
                        placeholder="Conseils, recommandations..."
                        value={exerciseForm.recommendations}
                        onChangeText={(v) =>
                          handleExerciseFormChange("recommendations", v)
                        }
                      />
                    </>
                  }
                  onClose={closeModal}
                />
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <AddContacts
          visible={addContactPopUpVisible}
          onClose={handleAddContactPopUpVisible}
          token={token}
          onSubmit={(selectedUsers) => {
            handleAddContactSubmit(selectedUsers);
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
