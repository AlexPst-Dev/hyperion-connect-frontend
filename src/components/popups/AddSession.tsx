import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { ScrollView } from "react-native-gesture-handler";
import AppText from "../AppText";
import Session from "../Session";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { Session as SessionModel } from "@/src/models/session";
import { ExerciseWithDetails } from "@/src/models/exercise";
import { Category } from "@/src/models/category";
import Label from "../Label";

interface Props {
  visible: boolean;
  listOfSession: SessionModel[];
  onClose: () => void;
  onSubmit?: (selectedSessions: SessionModel[]) => void;
  isEditable?: boolean;
  isExercises?: boolean;
  exercises: ExerciseWithDetails[];
  categories: Category[];
}

export default function AddSessions({
  visible,
  listOfSession,
  onClose,
  onSubmit,
  isExercises,
  exercises,
  categories,
}: Props) {
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Helper to get muscle group categories for a session
  const getSessionMuscleGroups = (session: SessionModel) => {
    // Get exercise IDs from session.listExercises
    const exerciseIds = session.listExercises
      .split(";")
      .map((id) => id.trim())
      .filter(Boolean)
      .map(Number);

    // Get all muscle group IDs from those exercises
    const muscleGroupIds = exercises
      .filter((ex) => exerciseIds.includes(ex.id))
      .flatMap((ex) =>
        ex.listMuscleGroupIds
          .split(";")
          .map((id) => id.trim())
          .filter(Boolean)
          .map(Number)
      );

    // Get unique muscle group IDs
    const uniqueMuscleGroupIds = Array.from(new Set(muscleGroupIds));

    // Map to category objects
    return categories.filter((cat) => uniqueMuscleGroupIds.includes(cat.id));
  };

  // For filter options
  const filterCategories = Array.from(
    new Set(
      listOfSession
        .flatMap((session) =>
          session.listExercises && session.listExercises !== ""
            ? getSessionMuscleGroups(session).map((group) => group.label)
            : []
        )
        .filter(Boolean)
    )
  );

  // Reset filters when popup opens
  useEffect(() => {
    if (visible) {
      setSelectedFilters([]);
      setSearchTerm("");
      setSelectedSessionIds([]);
    }
  }, [visible]);

  const allMuscleGroups = Array.from(
    new Set(
      listOfSession
        .flatMap((session) =>
          session.listExercises && session.listExercises !== ""
            ? getSessionMuscleGroups(session).map((group) => group.label)
            : []
        )
        .filter(Boolean)
    )
  );

  const filterOptions = allMuscleGroups.map((label) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: label,
  }));

  const handleFilterChange = (value: string) => {
    if (!value) {
      setSelectedFilters([]);
      return;
    }
    setSelectedFilters(
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    );
  };

  const toggleSelection = (userId: number) => {
    setSelectedSessionIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    const selectedSessions = listOfSession.filter((session) =>
      selectedSessionIds.includes(session.id)
    );
    onSubmit?.(selectedSessions);
    onClose();
  };

  const filteredSessions = listOfSession
    .filter((s) => s.isActive)
    .filter((session) => {
      const sessionMuscleGroups =
        session.listExercises && session.listExercises !== ""
          ? getSessionMuscleGroups(session)
          : [];

      const matchesSearch =
        searchTerm.length < 3 ||
        session.label
          .toLowerCase()
          .startsWith(searchTerm.toLowerCase());

      // Logique de filtrage corrigée
      let matchesFilter = true;

      if (selectedFilters.length > 0) {
        // Si des filtres sont sélectionnés
        if (sessionMuscleGroups.length === 0) {
          // Session sans groupes musculaires : ne pas afficher
          matchesFilter = false;
        } else {
          // Session avec groupes musculaires : vérifier la correspondance
          matchesFilter = sessionMuscleGroups.some((group) =>
            selectedFilters.includes(group.label)
          );
        }
      }
      // Si aucun filtre sélectionné, matchesFilter reste true (toutes les sessions)

      return matchesSearch && matchesFilter;
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
            title={isExercises ? "Ajouter un exercice" : "Ajouter une séance"}
            closeText="Annuler"
            paragraph={
              isExercises
                ? "Sélectionnez les exercices que vous souhaitez ajouter depuis le catalogue."
                : "Sélectionnez une session que vous souhaitez ajouter depuis le catalogue."
            }
            inputs={
              <>
                <Input
                  type="multiSelector"
                  label="Groupes musculaires"
                  placeholder="Filtrer par groupe musculaire"
                  value={selectedFilters.join(",")}
                  onChangeText={handleFilterChange}
                  options={filterOptions}
                />
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
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session, index) => {
                      const isSelected = selectedSessionIds.includes(
                        session.id
                      );
                      const sessionMuscleGroups =
                        session.listExercises && session.listExercises !== ""
                          ? getSessionMuscleGroups(session)
                          : [];

                      return (
                        <Pressable
                          key={session.id}
                          onPress={() =>
                            toggleSelection(session.id)
                          }
                          style={{
                            marginBottom:
                              index === filteredSessions.length - 1 ? 0 : 12,
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <View style={{ width: "89%" }}>
                            <Session
                              title={session.label}
                              labels={
                                sessionMuscleGroups.length > 0
                                  ? sessionMuscleGroups.map(
                                      (muscleGroup, index) => (
                                        <Label
                                          key={index}
                                          title={muscleGroup.label}
                                          textColor={muscleGroup.textColor}
                                          backgroundColor={
                                            muscleGroup.backgroundColor
                                          }
                                          size="small"
                                        />
                                      )
                                    )
                                  : undefined
                              }
                              hideIcon
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
                    <AppText>Aucune sessions trouvées.</AppText>
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
