import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { ScrollView } from "react-native-gesture-handler";
import AppText from "../AppText";
import Session from "../Session";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { SessionWithFile } from "@/src/models/session";
import { getMinutesFromDuration } from "@/src/services/api/session-service";
import { ExerciseWithDetails } from "@/src/models/exercise";
import { Category } from "@/src/models/category";
import Label from "../Label";

interface Props {
  visible: boolean;
  listOfSession: SessionWithFile[];
  onClose: () => void;
  onSubmit?: (selectedSessions: SessionWithFile[]) => void;
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
  const getSessionMuscleGroups = (sessionWithFile: SessionWithFile) => {
    // Get exercise IDs from session.listExercises
    const exerciseIds = sessionWithFile.session.listExercises
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
          getSessionMuscleGroups(session).map((group) => group.label)
        )
        .filter(Boolean)
    )
  );

  useEffect(() => {
    if (
      visible &&
      filterCategories.length > 0 &&
      selectedFilters.length === 0
    ) {
      setSelectedFilters(filterCategories);
    }
  }, [visible, filterCategories]);

  const allMuscleGroups = Array.from(
    new Set(
      listOfSession
        .flatMap((session) =>
          getSessionMuscleGroups(session).map((group) => group.label)
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
    const selectedSessions = listOfSession.filter((sessionWithFile) =>
      selectedSessionIds.includes(sessionWithFile.session.id)
    );
    onSubmit?.(selectedSessions);
    onClose();
  };

  const filteredSessions = listOfSession.filter((sessionWithFile) => {
    const sessionMuscleGroups = getSessionMuscleGroups(sessionWithFile);

    const matchesSearch =
      searchTerm.length < 3 ||
      sessionWithFile.session.label
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());

    // If no filters, show all
    const matchesFilter =
      selectedFilters.length === 0 ||
      sessionMuscleGroups.some((group) =>
        selectedFilters.includes(group.label)
      );

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
                    filteredSessions.map((sessionWithFile, index) => {
                      const isSelected = selectedSessionIds.includes(
                        sessionWithFile.session.id
                      );
                      const sessionMuscleGroups =
                        getSessionMuscleGroups(sessionWithFile);

                      return (
                        <Pressable
                          key={sessionWithFile.session.id}
                          onPress={() =>
                            toggleSelection(sessionWithFile.session.id)
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
                              title={sessionWithFile.session.label}
                              labels={sessionMuscleGroups.map(
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
                              )}
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
