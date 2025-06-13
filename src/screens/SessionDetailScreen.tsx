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
import AddSessions from "../components/popups/AddSession";
import * as DocumentPicker from "expo-document-picker";
import AddContacts from "../components/popups/AddContacts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import {
  getMinutesFromDuration,
  SessionService,
} from "../services/api/session-service";
import { fileService } from "../services/api/file-service";
import { FileCategory } from "../models/file";
import { UpdateSessionRequest } from "../models/session";
import { getImageSource } from "../utils/imgSrcHandler";
import { exerciseService } from "../services/api/exercise-service";
import { ExerciseWithDetails } from "../models/exercise";
import { Category, CategoryType } from "../models/category";

type SessionDetailRouteProp = RouteProp<RootStackParamList, "SessionDetail">;

export default function SessionDetailScreen() {
  const route = useRoute<SessionDetailRouteProp>();
  const { session } = route.params;

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

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ExerciceDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const { user, token } = useAuth();

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

  const [exercisesOfSession, setExercisesOfSession] = useState<
    ExerciseWithDetails[]
  >([]);

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

  const handleEditSessionSubmit = async () => {
    setSessionEditionLoading(true);
    if (token && sessionForm) {
      const newSessionImageFile = await fileService.updateFile(
        session.filePictureId,
        {
          url:
            sessionForm.filePictureUrl !== session.filePicture.url
              ? sessionForm.filePictureUrl
              : session.filePicture.url,
        },
        token
      );

      const baseData: UpdateSessionRequest = {
        label:
          sessionForm.label !== session.label
            ? sessionForm.label
            : session.label,
        filePictureId: newSessionImageFile.file.id,
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
      } catch (error) {
        console.log("Error while trying to updating session : ", error);
      } finally {
        setSessionEditionLoading(false);
        setEditSessionPopUpVisible(false);
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

  useEffect(() => {
    if (session) {
      setSessionForm({
        label: session.label || "",
        filePictureUrl: session.filePicture.url || "",
        recommendations: session.recommendations || "",
        contributions: session.contributions || "",
      });
      handleFetchExercises(session.id);
    }
  }, [session]);

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
          <View
            style={{
              height: 192,
              backgroundColor: Colors.grey,
              borderRadius: 8,
            }}
          >
            <Image
              source={getImageSource(session.filePicture.url)}
              style={{ borderRadius: 8 }}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{session.label}</AppText>
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
                {getMinutesFromDuration(session.durationTime)} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            <Label
              title="Jambes"
              textColor="#1E3A8A"
              backgroundColor="#D6EBFF"
              size="normal"
            />
            <Label
              title="Cardio"
              textColor="#1E3A8A"
              backgroundColor="#D6EBFF"
              size="normal"
            />
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>Recommandations</AppText>
            <AppText>{session.recommendations}</AppText>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {/* interets */}
            <AppText style={{ fontWeight: "bold" }}>Apports & Interets</AppText>
            <AppText>{session.contributions}</AppText>
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
                {session.numberOfExercises} exercices
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
              <View
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
              </View>
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

              {/* {modalStep === "catalog" && (
                <AddSessions
                  visible={true}
                  listOfSession={tempListOfExercises}
                  onClose={closeModal}
                  onSubmit={(sessions) => {
                    console.log("Sessions sélectionnées :", sessions);
                    closeModal();
                  }}
                  isExercises
                />
              )} */}

              {modalStep === "custom" && (
                <PopUp
                  title="Editer un exercice"
                  btnText="Editer"
                  iconName="pencil"
                  closeText="Annuler"
                  onSubmit={closeModal}
                  btnType="primary"
                  inputs={
                    <>
                      <Input
                        type="text"
                        placeholder="Libellé"
                        label="Libellé de l'exercice"
                      />
                      <Input
                        type="multiSelector"
                        placeholder="Jambes"
                        label="Groupes musculaire"
                        options={[
                          {
                            label: "Fessiers",
                            value: "fessiers",
                          },
                          {
                            label: "Jambes",
                            value: "jambes",
                          },
                          {
                            label: "Cardio",
                            value: "cardio",
                          },
                        ]}
                      />
                      <Input
                        type="text"
                        placeholder="https://"
                        label="Lien image ou vidéo"
                      />
                      <Input
                        type="number"
                        placeholder="XX minutes"
                        label="Durée"
                      />
                      <Input
                        type="number"
                        placeholder="XX minutes"
                        label="Temps de repos"
                      />
                      <Input
                        type="number"
                        placeholder="4 x 10 répétitions"
                        label="Nombre de répétitions"
                      />
                      <Input
                        type="text"
                        label="Description"
                        placeholder="Remplissez une description ici..."
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
          token=""
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
