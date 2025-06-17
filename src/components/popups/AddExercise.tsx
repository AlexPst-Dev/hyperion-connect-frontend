import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { ScrollView } from "react-native-gesture-handler";
import AppText from "../AppText";
import Session from "../Session";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { getMinutesFromDuration } from "@/src/services/api/session-service";
import { exerciseService } from "@/src/services/api/exercise-service";
import { ExerciseWithDetails } from "@/src/models/exercise";
import { Category } from "@/src/models/category";
import { useAuth } from "@/src/hooks/useAuth";
import Label from "../Label";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (selectedExercises: ExerciseWithDetails[]) => void;
  isEditable?: boolean;
}

export default function AddExercises({ visible, onClose, onSubmit }: Props) {
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const { token } = useAuth();
  if (!token) return;

  type ExerciseWithMuscleGroups = {
    exercise: ExerciseWithDetails;
    muscleGroups: Category[];
  };
  const [catalogExercises, setCatalogExercises] = useState<
    ExerciseWithMuscleGroups[]
  >([]);

  const fetchCatalogExercises = async () => {
    try {
      const resExercises = await exerciseService.getAllExercises(token);

      if (resExercises.length > 0) {
        const exercisesWithMuscleGroups = await Promise.all(
          resExercises.map(async (exercise) => {
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
        setCatalogExercises(exercisesWithMuscleGroups);
      }
    } catch (e) {
      console.log("Error while fetching exercises of the session", e);
    }
  };

  const toggleSelection = (userId: number) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    const selectedExercises = catalogExercises.filter((exerciseDetail) =>
      selectedExerciseIds.includes(exerciseDetail.exercise.id)
    );
    onSubmit?.(selectedExercises.map((ex) => ex.exercise));
    onClose();
  };

  useEffect(() => {
    if (visible) {
      fetchCatalogExercises();
    }
  }, [visible]);

  const filteredExercises = catalogExercises.filter((exerciseWithDetails) => {
    if (!searchTerm || searchTerm.length < 3) return true;
    return exerciseWithDetails.exercise.label
      .toLowerCase()
      .startsWith(searchTerm.toLowerCase());
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.inner} onPress={(e) => e.stopPropagation()}>
          <PopUp
            onClose={onClose}
            title="Ajouter un exercice"
            closeText="Annuler"
            paragraph="Sélectionnez les exercices que vous souhaitez ajouter depuis le catalogue."
            inputs={
              <>
                <Input
                  type="text"
                  label="Rechercher"
                  placeholder="Séance de fractionné, séance de tempo run..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </>
            }
            specificBody={
              <>
                <ScrollView style={styles.sessionList}>
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map((exerciseWithDetails, index) => {
                      const isSelected = selectedExerciseIds.includes(
                        exerciseWithDetails.exercise.id
                      );

                      return (
                        <Pressable
                          key={exerciseWithDetails.exercise.id}
                          onPress={() =>
                            toggleSelection(exerciseWithDetails.exercise.id)
                          }
                          style={{
                            marginBottom:
                              index === catalogExercises.length - 1 ? 0 : 12,
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <View style={{ width: "89%" }}>
                            <Session
                              title={exerciseWithDetails.exercise.label}
                              durationTime={getMinutesFromDuration(
                                exerciseWithDetails.exercise.durationTime
                              )}
                              isExercice
                              hideIcon
                              labels={
                                exerciseWithDetails.muscleGroups.length > 0
                                  ? exerciseWithDetails.muscleGroups.map(
                                      (group) => (
                                        <Label
                                          key={group.id}
                                          title={group.label}
                                          size={"small"}
                                          backgroundColor={
                                            group.backgroundColor
                                          }
                                          textColor={group.textColor}
                                        />
                                      )
                                    )
                                  : undefined
                              }
                            />
                          </View>
                          <Icon
                            name={isSelected ? "circleChecked" : "circle"}
                            fillColor="transparent"
                            strokeColor={Colors.deepBlue}
                            strokeWidth={2}
                          />
                        </Pressable>
                      );
                    })
                  ) : (
                    <AppText>Aucuns exercices trouvés.</AppText>
                  )}
                </ScrollView>
              </>
            }
            onSubmit={handleSubmit}
            btnText="Valider"
            btnType="primary"
            iconName="check"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
  },
  inner: {
    width: "90%",
  },
  sessionList: {
    maxHeight: 300,
    marginBottom: 24,
  },
});
