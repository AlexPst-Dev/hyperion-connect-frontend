import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { ScrollView } from "react-native-gesture-handler";
import ItemUser from "../ItemUser";
import AppButton from "../AppButton";
import AppText from "../AppText";
import Session from "../Session";
import Label from "../Label";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";

export interface TempInterfaceSession {
  id: number;
  title: string;
  nbExercises?: number;
  durationTime: number;
  muscleGroups: Array<{
    title: string;
    color: "blue" | "orange" | "green";
  }>;
}

interface Props {
  visible: boolean;
  listOfSession: TempInterfaceSession[];
  onClose: () => void;
  onSubmit?: (selectedSessions: TempInterfaceSession[]) => void;
  isEditable?: boolean;
  isExercises?: boolean;
}

export default function AddSessions({
  visible,
  listOfSession,
  onClose,
  onSubmit,
  isExercises,
}: Props) {
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterCategories = Array.from(
    new Set(
      listOfSession
        .flatMap((session) => session.muscleGroups.map((group) => group.title))
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

  const filterOptions = filterCategories.map((cat) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat,
  }));

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

  const filteredSessions = listOfSession.filter((session) => {
    const matchesSearch =
      searchTerm.length < 3 ||
      session.title.toLowerCase().startsWith(searchTerm.toLowerCase());

    const matchesFilter = session.muscleGroups.some((group) =>
      selectedFilters.includes(group.title)
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
                  type="selector"
                  label="Groupe musculaire"
                  placeholder="Jambes"
                  value={selectedFilters}
                  onChangeText={(v) => {
                    const values = v.split(",");
                    setSelectedFilters(values);
                  }}
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
                      return (
                        <Pressable
                          key={session.id}
                          onPress={() => toggleSelection(session.id)}
                          style={{
                            marginBottom:
                              index === filteredSessions.length - 1 ? 0 : 12,
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <View style={{ width: "89%" }}>
                            {!isExercises ? (
                              <Session
                                title={session.title}
                                durationTime={session.durationTime}
                                nbExercises={session.nbExercises}
                                hideIcon
                                labels={
                                  <>
                                    {session.muscleGroups.map((group) => (
                                      <Label
                                        key={group.title}
                                        title={group.title}
                                        type={group.color}
                                        size="small"
                                      />
                                    ))}
                                  </>
                                }
                              />
                            ) : (
                              <Session
                                title={session.title}
                                durationTime={session.durationTime}
                                isExercice
                                hideIcon
                                labels={
                                  <>
                                    {session.muscleGroups.map((group) => (
                                      <Label
                                        key={group.title}
                                        title={group.title}
                                        type={group.color}
                                        size="small"
                                      />
                                    ))}
                                  </>
                                }
                              />
                            )}
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
