import React, { JSX, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import AppText from "../components/AppText";
import { User } from "../models/user";
import { useAuth } from "../hooks/useAuth";
import Objective from "../components/Objective";
import ViewController from "../components/ViewController";
import AppButton from "../components/AppButton";
import Session from "../components/Session";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import Label from "../components/Label";
import Kpi from "../components/Kpi";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import AddSessions, {
  TempInterfaceSession,
} from "../components/popups/AddSession";
import * as DocumentPicker from "expo-document-picker";
import { BlurView } from "expo-blur";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";

export default function SessionsScreen() {
  type SessionPageRenderer = (user: LoggedUser) => JSX.Element;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "SessionDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const SessionPageByProfile: Record<string, SessionPageRenderer> = {
    sportsman: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      const [changeDispoPopUpVisible, setChangeDispoPopUpVisible] =
        useState(false);
      const [evaluateSessionPopUpVisible, setEvaluateSessionPopUpVisible] =
        useState(false);
      const [addValueToGraphPopUpVisible, setAddValueToGraphPopUpVisible] =
        useState(false);
      const [value, setValue] = useState("");

      const handleDispoPopUpVisibility = () =>
        setChangeDispoPopUpVisible(!changeDispoPopUpVisible);
      const handleEvaluateSessionPopUpVisibility = () =>
        setEvaluateSessionPopUpVisible(!evaluateSessionPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Planning
        <View key="planning" style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View>
              <AppText style={{ fontWeight: "bold" }}>
                Vos disponibilités
              </AppText>
              <AppText>Du mardi au vendredi, de 16h00 à 19h00.</AppText>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
              <AppButton
                title="Modifier"
                iconName="pencil"
                type="primary"
                onPress={handleDispoPopUpVisibility}
              />
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText style={GlobalStyles.h3}>SEANCES A FAIRE</AppText>
            <Session
              title="Séance de fractionné"
              nbExercises={5}
              durationTime={68}
              coachFirstName="Marc"
              coachLastName="Dupont"
              location="Parc de Vannes"
              date={new Date("2025-05-07")}
              isToDo
              isInPerson
              hasChangeStateBtn
              onChangeStateBtnPress={handleEvaluateSessionPopUpVisibility}
            />
            <Session
              title="Séance de Tempo Run"
              nbExercises={3}
              durationTime={50}
              isDone
            />
          </View>
        </View>,

        // Tab 1 : Mes séances
        <View key="seances" style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <Session
              title="Séance de Tempo Run"
              nbExercises={3}
              durationTime={50}
              onPress={() =>
                navigation.navigate("SessionDetail", {
                  session: {
                    title: "SEANCE DE TEMPO RUN",
                    nbExercises: 3,
                    durationTime: 50,
                  },
                })
              }
              labels={
                <Label
                  title="Cardio"
                  textColor="#1E3A8A"
                  backgroundColor="#D6EBFF"
                  size="small"
                />
              }
            />
            <Session
              title="Séance de fractionné"
              nbExercises={5}
              durationTime={68}
              labels={[
                <Label
                  key={"cardio"}
                  title="Cardio"
                  textColor="#1E3A8A"
                  backgroundColor="#D6EBFF"
                  size="small"
                />,
                <Label
                  key={"jambes"}
                  title="Jambes"
                  textColor="#1E3A8A"
                  backgroundColor="#D6EBFF"
                  size="small"
                />,
              ]}
            />
            <Session
              title="Séance de Tempo Run"
              nbExercises={3}
              durationTime={50}
              labels={
                <Label
                  title="Cardio"
                  textColor="#1E3A8A"
                  backgroundColor="#D6EBFF"
                  size="small"
                />
              }
            />
          </View>
        </View>,

        // Tab 2 : Performances
        <View key="performances" style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View>
              <ProgressGraph
                title="Evolution de la VMA"
                data={[
                  { month: "Jan", value: 55 },
                  { month: "Fév", value: 62 },
                  { month: "Mar", value: 60 },
                  { month: "Avr", value: 68 },
                  { month: "Mai", value: 55 },
                  { month: "Jun", value: 62 },
                  { month: "Jul", value: 70 },
                  { month: "Aou", value: 65 },
                  { month: "Sep", value: 72 },
                ]}
              />
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton
                  type="primary"
                  title="Ajouter une mesure"
                  iconName="plus"
                  onPress={() =>
                    setAddValueToGraphPopUpVisible(!addValueToGraphPopUpVisible)
                  }
                />
              </View>
            </View>
            <AppText style={GlobalStyles.h3}>VOTRE RESUME</AppText>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Kpi
                    title="Motivation 
                    moyenne"
                    value="3.9"
                    iconName="star"
                    fillIcon
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Kpi
                    title="Distance parcourue"
                    value="104"
                    unit="km"
                    iconName="run"
                    fillIcon
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Kpi
                    title="Progression 
                    globale"
                    value="8.1"
                    iconName="star"
                    fillIcon
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Kpi
                    title="Taux d'adhérence au programme"
                    value="95"
                    unit="%"
                    iconName="star"
                    fillIcon
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText style={GlobalStyles.h3}>SEANCES ARCHIVEES</AppText>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <Session
                title="Séance de fractionné"
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={"cardio"}
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"jambes"}
                    title="Jambes"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
            </View>
          </View>
        </View>,
      ];

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View
              style={[
                shadowStyles.small,
                {
                  flexDirection: "column",
                  gap: 8,
                  borderRadius: 8,
                  paddingVertical: 16,
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderTopWidth: 1,
                  borderBottomWidth: 2,
                  borderLeftWidth: 1,
                  borderRightWidth: 2,
                  borderColor: Colors.shadow,
                },
              ]}
            >
              <AppText style={GlobalStyles.h3}>OBJECTIF</AppText>
              <Objective
                duration={10}
                onGoingNumber={7}
                label="Suivi par un coach sportif de running pour un marathon"
              />
            </View>

            <ViewController
              tabs={[
                { title: "Planning", icon: "calendar" },
                { title: "Mes séances", icon: "dumbell" },
                { title: "Preformances", icon: "stats" },
              ]}
              onTabChange={setActiveTabIndex}
            />

            {tabViews[activeTabIndex]}
          </View>
          <Modal
            visible={changeDispoPopUpVisible}
            transparent={true}
            onRequestClose={handleDispoPopUpVisibility}
          >
            <Pressable
              onPress={handleDispoPopUpVisibility}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              {/* Stop propagation here to avoid closing on content press */}
              <Pressable
                onPress={() => {}}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <PopUp
                  onClose={handleDispoPopUpVisibility}
                  title="Changer mes disponibilités"
                  paragraph="Définissez ici vos disponibilités"
                  btnText="Valider"
                  iconName="check"
                  btnType="primary"
                  onSubmit={handleDispoPopUpVisibility}
                  closeText="Annuler"
                  inputs={[
                    <Input
                      key="jours-dispo"
                      type="multiSelector"
                      label="Jours disponibles"
                      placeholder="Tous les jours"
                      options={[
                        {
                          label: "Lundi",
                          value: "lundi",
                        },
                        {
                          label: "Mardi",
                          value: "mardi",
                        },
                        {
                          label: "Mercredi",
                          value: "mercredi",
                        },
                        {
                          label: "Jeudi",
                          value: "jeudi",
                        },
                        {
                          label: "Vendredi",
                          value: "vendredi",
                        },
                        {
                          label: "Samedi",
                          value: "samedi",
                        },
                        {
                          label: "Dimanche",
                          value: "dimanche",
                        },
                      ]}
                    />,
                    <Input
                      key="creneaux"
                      type="selector"
                      label="Créneaux horaires"
                      placeholder="07h00 - 10h00"
                      options={[
                        {
                          label: "07h00 - 10h00",
                          value: "7-10",
                        },
                        {
                          label: "10h00 - 13h00",
                          value: "10-13",
                        },
                        {
                          label: "13h00 - 16h00",
                          value: "13-16",
                        },
                        {
                          label: "16h00 - 19h00",
                          value: "16-19",
                        },
                        {
                          label: "19h00 - 22h00",
                          value: "19-22",
                        },
                        {
                          label: "22h00 - 01h00",
                          value: "22-01",
                        },
                      ]}
                    />,
                  ]}
                />
              </Pressable>
            </Pressable>
          </Modal>
          <Modal
            visible={evaluateSessionPopUpVisible}
            transparent={true}
            onRequestClose={handleEvaluateSessionPopUpVisibility}
          >
            <Pressable
              onPress={handleEvaluateSessionPopUpVisibility}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              {/* Stop propagation here to avoid closing on content press */}
              <Pressable
                onPress={() => {}}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <PopUp
                  onClose={handleEvaluateSessionPopUpVisibility}
                  title="Evaluer la séance"
                  paragraph="Comment estimeriez-vous votre motivation à cette séance ?"
                  btnText="Valider"
                  iconName="check"
                  btnType="primary"
                  onSubmit={handleEvaluateSessionPopUpVisibility}
                  closeText="Annuler"
                  inputs={[
                    <Input
                      key="note"
                      type="selector"
                      label="Note"
                      placeholder="5"
                      options={[
                        {
                          label: "1",
                          value: "1",
                        },
                        {
                          label: "2",
                          value: "2",
                        },
                        {
                          label: "3",
                          value: "3",
                        },
                        {
                          label: "4",
                          value: "4",
                        },
                        {
                          label: "5",
                          value: "5",
                        },
                      ]}
                    />,
                  ]}
                  specificBody={
                    <>
                      <AppText>Souhaitez-vous ajouter un commentaire ?</AppText>
                      <Input
                        type="text"
                        label="Commentaire"
                        placeholder="douleur, fatigue, progression..."
                      />
                    </>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>
          <Modal
            visible={addValueToGraphPopUpVisible}
            transparent={true}
            onRequestClose={() =>
              setAddValueToGraphPopUpVisible(!addValueToGraphPopUpVisible)
            }
          >
            <Pressable
              onPress={() =>
                setAddValueToGraphPopUpVisible(!addValueToGraphPopUpVisible)
              }
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              {/* Stop propagation here to avoid closing on content press */}
              <Pressable
                onPress={() => {}}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <PopUp
                  onClose={() =>
                    setAddValueToGraphPopUpVisible(!addValueToGraphPopUpVisible)
                  }
                  title="Ajouter une mesure"
                  paragraph="Indiquez ici une nouvelle mesure pour votre graph sur “Evolution de la VMA”"
                  btnText="Enregistrer"
                  iconName="pencil"
                  btnType="primary"
                  onSubmit={() =>
                    setAddValueToGraphPopUpVisible(!addValueToGraphPopUpVisible)
                  }
                  closeText="Annuler"
                  inputs={[
                    <Input
                      key="value"
                      type="number"
                      label="Valeur"
                      placeholder="De 0 à 100"
                      value={value}
                      onChangeText={setValue}
                    />,
                  ]}
                />
              </Pressable>
            </Pressable>
          </Modal>
        </>
      );
    },
    coach: (user) => {
      const tempListOfSession: TempInterfaceSession[] = [
        {
          id: 1,
          title: "Séance de Tempo Run",
          nbExercises: 3,
          durationTime: 50,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
            {
              title: "Cardio",
              color: "orange",
            },
          ],
        },
        {
          id: 2,
          title: "Séance de fractionné",
          nbExercises: 6,
          durationTime: 68,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
          ],
        },
      ];

      type ModalStep = "selector" | "catalog" | "custom" | "import";

      const [modalStep, setModalStep] = useState<ModalStep | null>(null);

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

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <AppText style={GlobalStyles.h3}>PLANS D'ENTRAINEMENTS</AppText>
              <AppText>
                Sélectionnez un plan d'entraînement pour afficher ses programmes
                et l'envoyer à un ou plusieurs sportifs.
              </AppText>
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                onPress={() =>
                  navigation.navigate("SessionDetail", {
                    session: {
                      title: "SEANCE DE TEMPO RUN",
                      nbExercises: 3,
                      durationTime: 50,
                      isEditable: true,
                    },
                  })
                }
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <Session
                title="Séance de fractionné"
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={"cardio"}
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"jambes"}
                    title="Jambes"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  type="add"
                  iconName="plus"
                  onPress={() => setModalStep("selector")}
                />
              </View>
            </View>
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
                    title="Ajouter une séance"
                    paragraph="Souhaitez-vous ajouter une session depuis le catalogue existant ou la créer vous-même ?"
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

                {modalStep === "catalog" && (
                  <AddSessions
                    visible={true}
                    listOfSession={tempListOfSession}
                    onClose={closeModal}
                    onSubmit={(sessions) => {
                      console.log("Sessions sélectionnées :", sessions);
                      closeModal();
                    }}
                  />
                )}

                {modalStep === "custom" && (
                  <PopUp
                    title="Editer une séance"
                    paragraph="Créez une nouvelle séance d'entrainement pour un sportif en remplissant les champs ci-dessous."
                    btnText="Editer"
                    iconName="pencil"
                    closeText="Annuler"
                    onSubmit={closeModal}
                    btnType="primary"
                    inputs={
                      <>
                        <Input
                          type="text"
                          placeholder="Nom du programme"
                          label="Nom"
                        />
                        <Input
                          type="text"
                          placeholder="https://"
                          label="Lien image"
                        />
                        <Input type="text" placeholder="Adresse" label="Lieu" />
                        <Input type="date" label="Date" />
                        <Input
                          type="text"
                          placeholder="08:00"
                          label="Heure de début"
                        />
                        <Input
                          type="text"
                          placeholder="09:00"
                          label="Heure de fin"
                        />
                      </>
                    }
                    onClose={closeModal}
                  />
                )}
              </Pressable>
            </Pressable>
          </Modal>
        </>
      );
    },
    medic: (user) => {
      const tempListOfSession: TempInterfaceSession[] = [
        {
          id: 1,
          title: "Séance de Tempo Run",
          nbExercises: 3,
          durationTime: 50,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
            {
              title: "Cardio",
              color: "orange",
            },
          ],
        },
        {
          id: 2,
          title: "Séance de fractionné",
          nbExercises: 6,
          durationTime: 68,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
          ],
        },
      ];

      type ModalStep = "selector" | "catalog" | "custom" | "import";

      const [modalStep, setModalStep] = useState<ModalStep | null>(null);

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

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <AppText style={GlobalStyles.h3}>PLANS D'ENTRAINEMENTS</AppText>
              <AppText>
                Sélectionnez un plan d'entraînement pour afficher ses programmes
                et l'envoyer à un ou plusieurs sportifs.
              </AppText>
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                onPress={() =>
                  navigation.navigate("SessionDetail", {
                    session: {
                      title: "SEANCE DE TEMPO RUN",
                      nbExercises: 3,
                      durationTime: 50,
                      isEditable: true,
                    },
                  })
                }
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <Session
                title="Séance de fractionné"
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={"cardio"}
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"jambes"}
                    title="Jambes"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  type="add"
                  iconName="plus"
                  onPress={() => setModalStep("selector")}
                />
              </View>
            </View>
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
                    title="Ajouter une séance"
                    paragraph="Souhaitez-vous ajouter une session depuis le catalogue existant ou la créer vous-même ?"
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

                {modalStep === "catalog" && (
                  <AddSessions
                    visible={true}
                    listOfSession={tempListOfSession}
                    onClose={closeModal}
                    onSubmit={(sessions) => {
                      console.log("Sessions sélectionnées :", sessions);
                      closeModal();
                    }}
                  />
                )}

                {modalStep === "custom" && (
                  <PopUp
                    title="Editer une séance"
                    paragraph="Créez une nouvelle séance d'entrainement pour un sportif en remplissant les champs ci-dessous."
                    btnText="Editer"
                    iconName="pencil"
                    closeText="Annuler"
                    onSubmit={closeModal}
                    btnType="primary"
                    inputs={
                      <>
                        <Input
                          type="text"
                          placeholder="Nom du programme"
                          label="Nom"
                        />
                        <Input
                          type="text"
                          placeholder="https://"
                          label="Lien image"
                        />
                        <Input type="text" placeholder="Adresse" label="Lieu" />
                        <Input type="date" label="Date" />
                        <Input
                          type="text"
                          placeholder="08:00"
                          label="Heure de début"
                        />
                        <Input
                          type="text"
                          placeholder="09:00"
                          label="Heure de fin"
                        />
                      </>
                    }
                    onClose={closeModal}
                  />
                )}
              </Pressable>
            </Pressable>
          </Modal>
        </>
      );
    },
    free: (user) => {
      function BlurredSessionWrapper({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <View
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            {children}
            <BlurView
              intensity={64}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          </View>
        );
      }

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>Accès restreint</AppText>
              <AppText>
                Cette page est réservée aux membres Hyperion. Devenez membre
                pour débloquer tous les avantages !
              </AppText>
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>
                PLAN DE PERFORMANCES A LA UNE
              </AppText>
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <Session
                title="Séance de fractionné"
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={"cardio"}
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"jambes"}
                    title="Jambes"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <BlurredSessionWrapper>
                <Session
                  title="Séance de Tempo Run"
                  durationTime={50}
                  nbExercises={3}
                  labels={
                    <>
                      <Label
                        title="Cardio"
                        textColor="#1E3A8A"
                        backgroundColor="#D6EBFF"
                        size="small"
                      />
                      <Label
                        title="Jambes"
                        textColor="#F97316"
                        backgroundColor="#FFF9F4"
                        size="small"
                      />
                    </>
                  }
                  imageUrl="sessions/img-running"
                />
              </BlurredSessionWrapper>
              <View style={{ position: "absolute", bottom: "8%", left: "32%" }}>
                <AppButton
                  type="primary"
                  title="Voir plus"
                  iconName="chevronRight"
                />
              </View>
            </View>
          </View>
        </>
      );
    },
    admin: (user) => {
      const tempListOfSession: TempInterfaceSession[] = [
        {
          id: 1,
          title: "Séance de Tempo Run",
          nbExercises: 3,
          durationTime: 50,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
            {
              title: "Cardio",
              color: "orange",
            },
          ],
        },
        {
          id: 2,
          title: "Séance de fractionné",
          nbExercises: 6,
          durationTime: 68,
          muscleGroups: [
            {
              title: "Jambes",
              color: "blue",
            },
          ],
        },
      ];

      const [editSessionPopUp, setEditSessionPopUp] = useState(false);

      const closeModal = () => setEditSessionPopUp(!editSessionPopUp);

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <AppText style={GlobalStyles.h3}>PLANS D'ENTRAINEMENTS</AppText>
              <AppText>
                Sélectionnez un plan d'entraînement pour afficher ses programmes
                et l'envoyer à un ou plusieurs sportifs.
              </AppText>
            </View>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                onPress={() =>
                  navigation.navigate("SessionDetail", {
                    session: {
                      title: "SEANCE DE TEMPO RUN",
                      nbExercises: 3,
                      durationTime: 50,
                      isEditable: true,
                    },
                  })
                }
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <Session
                title="Séance de fractionné"
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={"cardio"}
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"jambes"}
                    title="Jambes"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <Session
                title="Séance de Tempo Run"
                nbExercises={3}
                durationTime={50}
                labels={
                  <Label
                    title="Cardio"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />
                }
              />
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  type="add"
                  iconName="plus"
                  onPress={() => setEditSessionPopUp(true)}
                />
              </View>
            </View>
          </View>
          <Modal
            visible={editSessionPopUp}
            transparent
            onRequestClose={() => setEditSessionPopUp}
          >
            <Pressable
              onPress={() => setEditSessionPopUp}
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
                  title="Editer une séance"
                  paragraph="Créez une nouvelle séance d'entrainement pour un sportif en remplissant les champs ci-dessous."
                  btnText="Editer"
                  iconName="pencil"
                  closeText="Annuler"
                  onSubmit={() => setEditSessionPopUp}
                  btnType="primary"
                  inputs={
                    <>
                      <Input
                        type="text"
                        placeholder="Nom du programme"
                        label="Nom"
                      />
                      <Input
                        type="text"
                        placeholder="https://"
                        label="Lien image"
                      />
                      <Input type="text" placeholder="Adresse" label="Lieu" />
                      <Input type="date" label="Date" />
                      <Input
                        type="text"
                        placeholder="08:00"
                        label="Heure de début"
                      />
                      <Input
                        type="text"
                        placeholder="09:00"
                        label="Heure de fin"
                      />
                    </>
                  }
                  onClose={closeModal}
                />
              </Pressable>
            </Pressable>
          </Modal>
        </>
      );
    },
  };

  const { user } = useAuth();

  if (!user) return null;

  const RenderProfileComponents = SessionPageByProfile[user.profileCategory];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {RenderProfileComponents ? RenderProfileComponents(user) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
