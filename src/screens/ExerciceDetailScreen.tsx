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
  Modal,
  Pressable,
} from "react-native";
import AppText from "@/src/components/AppText";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "../components/Icon";
import Label from "../components/Label";
import AppButton from "../components/AppButton";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import { getImageSource } from "../utils/imgSrcHandler";
import { exerciseService } from "../services/api/exercise-service";
import Input from "../components/Input";
import PopUp from "../components/PopUp";
import { Category, CategoryType } from "../models/category";
import { categoryService } from "../services/api/category-service";
import { fileService } from "../services/api/file-service";
import { UpdateExerciseRequest } from "../models/exercise";
import { getMinutesFromDuration } from "../services/api/session-service";
import { FileCategory, File as FileModel } from "../models/file";
import { WebView } from "react-native-webview";
import { notify } from "../components/NotificationContainer";

type ExerciceDetailRouteProp = RouteProp<RootStackParamList, "ExerciceDetail">;

export default function ExerciceDetailScreen() {
  const route = useRoute<ExerciceDetailRouteProp>();
  const { exercise, muscleGroups, isEditable } = route.params;
  const { user, token } = useAuth();
  const navigation = useNavigation();

  const [currentExercise, setCurrentExercise] = useState({
    ...exercise,
  });
  const [currentMuscleGroups, setCurrentMuscleGroups] = useState<Category[]>(
    muscleGroups || []
  );

  if (!user || !token) return null;

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);

  const [editExercisePopUpVisible, setEditExercisePopUpVisible] =
    useState(false);
  const [exerciseEditionLoading, setExerciseEditionLoading] = useState(false);
  const [exerciseForm, setExerciseForm] = useState<{
    label: string;
    publicImageUrl: string;
    muscleGroups: Category[];
    duration: string;
    description: string;
    recommendations: string;
  }>({
    label: "",
    publicImageUrl: "",
    muscleGroups: [] as Category[],
    duration: "",
    description: "",
    recommendations: "",
  });

  const [allMuscleGroups, setAllMuscleGroups] = useState<Category[]>([]);

  const handleAddContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };

  const handleExerciseFormChange = (field: string, value: any) => {
    setExerciseForm((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch and update session after edit
  const refreshExercise = async () => {
    try {
      const updated = await exerciseService.getExerciseById(exercise.id, token);
      setCurrentExercise({
        ...updated.exercice,
        muscleGroups: muscleGroups || [],
      });
      const updatedMuscleGroups =
        await exerciseService.getMuscleGroupsForExercise(exercise.id, token);
      setCurrentMuscleGroups(updatedMuscleGroups.muscleGroups);
    } catch (e) {
      console.error("Failed to refresh session:", e);
    }
  };

  const handleEditExerciseSubmit = async () => {
    setExerciseEditionLoading(true);
    if (token && exerciseForm) {
      let newExerciseImageFile: FileModel | undefined;

      const baseData: UpdateExerciseRequest = {
        label:
          exerciseForm.label !== exercise.label
            ? exerciseForm.label
            : exercise.label,
        publicImageUrl:
          exerciseForm.publicImageUrl !== exercise.publicImageUrl
            ? exerciseForm.publicImageUrl
            : exercise.publicImageUrl,
        recommendations:
          exerciseForm.recommendations !== exercise.recommendations
            ? exerciseForm.recommendations
            : exercise.recommendations,
        description:
          exerciseForm.description !== exercise.description
            ? exerciseForm.description
            : exercise.description,
        listMuscleGroupIds:
          exerciseForm.muscleGroups.length > 0
            ? exerciseForm.muscleGroups
                .map((muscleGroup) => muscleGroup.id)
                .join(";")
            : exercise.listMuscleGroupIds,
        durationTime:
          exerciseForm.duration !==
          getMinutesFromDuration(exercise.durationTime).toString()
            ? `${Math.floor(Number(exerciseForm.duration) / 60)}:${
                Number(exerciseForm.duration) % 60
              }`
            : exercise.durationTime,
      };

      try {
        await exerciseService.updateExerciseById(exercise.id, baseData, token);
        await refreshExercise();
      } catch (error) {
        console.log("Error while trying to updating exercise : ", error);
      } finally {
        setExerciseEditionLoading(false);
        setEditExercisePopUpVisible(false);
      }
    }
  };

  const handleDeleteExercise = async () => {
    if (token) {
      try {
        await exerciseService.deleteExerciseById(exercise.id, token);
        notify({
          title: "Exercice supprimé avec succès",
          type: "success",
        });
        const { onExerciseDeleted } = route.params;
        if (onExerciseDeleted) {
          onExerciseDeleted();
        }

        navigation.goBack();
      } catch (error) {
        console.error("Error deleting exercise:", error);
        notify({
          title: "L'exercice n'a pas pu être supprimé",
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    if (exercise) {
      setExerciseForm({
        label: exercise.label || "",
        publicImageUrl: exercise.publicImageUrl || "",
        muscleGroups: muscleGroups || [],
        duration: getMinutesFromDuration(exercise.durationTime).toString(),
        description: exercise.description || "",
        recommendations: exercise.recommendations || "",
      });
    }
    const fetchAllMuscleGroups = async () => {
      await categoryService
        .getCategoriesByType(CategoryType.MUSCLE_GROUP, token)
        .then((res) => {
          if (res) {
            setAllMuscleGroups(res);
          } else {
            console.error("Expected an array of categories, got:", res);
          }
        })
        .catch((error) => {
          console.error("Error fetching muscle groups:", error);
        });
    };
    fetchAllMuscleGroups();
  }, [exercise, muscleGroups]);

  const screenWidth = Dimensions.get("window").width;

  function isYoutubeUrl(url: string) {
    return url.includes("youtube.com") || url.includes("youtu.be");
  }
  function getYoutubeEmbedUrl(url: string) {
    // Gère les deux formats : youtube.com/watch?v=... et youtu.be/...
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

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
          {currentExercise.publicImageUrl && (
            <View
              style={{
                height: 192,
                backgroundColor: Colors.grey,
                borderRadius: 8,
              }}
            >
              {isYoutubeUrl(currentExercise.publicImageUrl) ? (
                Platform.OS === "web" ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYoutubeEmbedUrl(currentExercise.publicImageUrl)}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <WebView
                    source={{
                      uri: getYoutubeEmbedUrl(currentExercise.publicImageUrl),
                    }}
                    style={{ borderRadius: 8, height: "100%", width: "100%" }}
                    allowsFullscreenVideo
                  />
                )
              ) : (
                <Image
                  source={getImageSource(currentExercise.publicImageUrl)}
                  style={{ borderRadius: 8, height: "100%", width: "100%" }}
                />
              )}
            </View>
          )}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{currentExercise.label}</AppText>
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
                {getMinutesFromDuration(currentExercise.durationTime)} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            {currentMuscleGroups.map((item) => (
              <Label
                key={item.id}
                title={item.label}
                textColor={item.textColor}
                backgroundColor={item.backgroundColor}
                size="normal"
              />
            ))}
          </View>
          <View>
            <AppText>{currentExercise.description}</AppText>
          </View>
          <View>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>
              Notes & Recommandations
            </AppText>
            <AppText>{currentExercise.recommendations}</AppText>

            {isEditable && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton
                  title="Modifier"
                  iconName="pencil"
                  type="primary"
                  onPress={() => setEditExercisePopUpVisible(true)}
                />
              </View>
            )}
            <Modal
              transparent
              visible={editExercisePopUpVisible}
              onRequestClose={() => setEditExercisePopUpVisible(false)}
            >
              <Pressable
                onPress={() => setEditExercisePopUpVisible(false)}
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
                    onClose={() => setEditExercisePopUpVisible(false)}
                    title="Modifier l'exercice"
                    paragraph="Vous pouvez modifier dans les champs ci-dessous l'exercice."
                    closeText="Annuler"
                    btnText="Modifier"
                    iconName="pencil"
                    btnType="primary"
                    onSubmit={handleEditExerciseSubmit}
                    inputs={
                      exerciseEditionLoading ? (
                        <ActivityIndicator />
                      ) : (
                        <>
                          <Input
                            type="text"
                            placeholder={
                              exerciseForm.label || "Nom de l'exercice"
                            }
                            label="Label"
                            value={exerciseForm.label}
                            onChangeText={(v) =>
                              handleExerciseFormChange("label", v)
                            }
                          />
                          <Input
                            type="multiSelector"
                            label="Groupes musculaires"
                            placeholder="Jambes"
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
                            placeholder={"https://"}
                            label="Lien image"
                            value={exerciseForm.publicImageUrl}
                            onChangeText={(v) =>
                              handleExerciseFormChange("publicImageUrl", v)
                            }
                          />
                          <Input
                            type="text"
                            placeholder={"45"}
                            label="Durée en minutes"
                            value={exerciseForm.duration}
                            onChangeText={(v) =>
                              handleExerciseFormChange("duration", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder={
                              exerciseForm.recommendations ||
                              "Conseils, mises en garde..."
                            }
                            label="Recommandations"
                            value={exerciseForm.recommendations}
                            onChangeText={(v) =>
                              handleExerciseFormChange("recommendations", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder={
                              "Description de l'exercice, comment le réaliser..."
                            }
                            label="Description"
                            value={exerciseForm.description}
                            onChangeText={(v) =>
                              handleExerciseFormChange("description", v)
                            }
                          />
                        </>
                      )
                    }
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </View>

          {isEditable && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Pressable
                onPress={handleDeleteExercise}
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
              {/* <AppButton
                type="secondary"
                title="Envoyer"
                iconName="send"
                onPress={handleAddContactPopUpVisible}
              /> */}
            </View>
          )}
        </View>

        <AddContacts
          visible={addContactPopUpVisible}
          onClose={handleAddContactPopUpVisible}
          token={token}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
