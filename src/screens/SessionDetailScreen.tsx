// src/screens/SessionDetailScreen.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Modal,
  Pressable,
  Dimensions,
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
import AddSessions, {
  TempInterfaceSession,
} from "../components/popups/AddSession";
import * as DocumentPicker from "expo-document-picker";
import AddContacts from "../components/popups/AddContacts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";

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

  const tempListOfExercises: TempInterfaceSession[] = [
    {
      id: 1,
      title: "Course lente",
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
      title: "Course fractionné",
      durationTime: 68,
      muscleGroups: [
        {
          title: "Jambes",
          color: "blue",
        },
      ],
    },
  ];

  const { user } = useAuth();

  if (!user) return null;

  let isExerciceEditable: boolean = false;
  if (
    user.profileCategory !== "sportsman" &&
    user.profileCategory !== "free" &&
    user.profileCategory !== "partner"
  ) {
    isExerciceEditable = true;
  }

  const screenWidth = Dimensions.get("window").width;

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
              source={require("../assets/images/sessions/img-running.png")}
              style={{ borderRadius: 8 }}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <AppText style={GlobalStyles.h3}>{session.title}</AppText>
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
                {session.durationTime} min
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* labels */}
            <Label title="Jambes" type="blue" size="normal" />
            <Label title="Cardio" type="blue" size="normal" />
          </View>
          <View>
            {/* recommandations */}
            <AppText style={{ fontWeight: "bold" }}>Recommandations</AppText>
            <AppText>
              Hydratation : Boire de l'eau régulièrement avant, pendant et après
              la séance.
            </AppText>
            <AppText>
              Écoute du corps : Adapter l'intensité si nécessaire pour éviter
              les blessures.
            </AppText>
            <AppText>
              Suivi : Noter les sensations et les performances après la séance
              pour ajuster les futurs entraînements.
            </AppText>
            {session.isEditable && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton title="Modifier" iconName="pencil" type="primary" />
              </View>
            )}
          </View>
          <View>
            {/* interets */}
            <AppText style={{ fontWeight: "bold" }}>Apports & Interets</AppText>
            <AppText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AppText>
            {session.isEditable && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton title="Modifier" iconName="pencil" type="primary" />
              </View>
            )}
          </View>

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
                {session.nbExercises} exercices
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Session
              isExercice
              title="Course lente"
              durationTime={10}
              labels={<Label title="Jambes" type="blue" size="small" />}
              onPress={() =>
                navigation.navigate("ExerciceDetail", {
                  exercice: {
                    title: "Course lente",
                    durationTime: 10,
                    isEditable: isExerciceEditable,
                  },
                })
              }
            />
            <Session
              isExercice
              title="Exercices dynamiques"
              durationTime={18}
              labels={<Label title="Cardio" type="blue" size="small" />}
              onPress={() =>
                navigation.navigate("ExerciceDetail", {
                  exercice: {
                    title: "Exercices dynamiques",
                    durationTime: 18,
                    isEditable: isExerciceEditable,
                  },
                })
              }
            />
            {session.isEditable && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  iconName="plus"
                  type="add"
                  onPress={() => setModalStep("selector")}
                />
              </View>
            )}
          </View>

          {session.isEditable && (
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

              {modalStep === "catalog" && (
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
              )}

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
