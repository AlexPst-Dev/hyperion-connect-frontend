// src/screens/SessionDetailScreen.tsx
import React, { JSX, useEffect, useState } from "react";
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import UserCard from "../components/UserCard";
import AppText from "../components/AppText";
import ViewController from "../components/ViewController";
import {
  getMonthStartDates,
  ProfileCategory,
  SportsmanProfile,
  User,
} from "../models/user";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import AppButton from "../components/AppButton";
import Objective from "../components/Objective";
import Session from "../components/Session";
import Label from "../components/Label";
import BillingGroup from "../components/BillingGroup";
import BillingLine from "../components/BillingLine";
import ItemUser from "../components/ItemUser";
import OfferCard from "../components/OfferCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";
import { Category, CategoryType } from "../models/category";
import { File } from "../models/file";
import {
  getMonthsBetween,
  getOngoingMonth,
  Objective as ObjectiveModel,
} from "../models/objective";
import { SessionWithFile } from "../models/session";
import { categoryService } from "../services/api/category-service";
import { SubscriptionService } from "../services/api/subscription-service";
import { fileService } from "../services/api/file-service";
import { ObjectivesApiService } from "../services/api/objective-service";
import {
  getMinutesFromDuration,
  SessionService,
} from "../services/api/session-service";
import { GraphService } from "../services/api/graph-service";
import { getDynamicMonthLabels, Graph } from "../models/graph";
import { Billing } from "../models/billing";
import { billingService } from "../services/api/billing-service";
import { UserService } from "../services/api/user-service";
import AddContacts from "../components/popups/AddContacts";
import AddSessions from "../components/popups/AddSession";
import { ExerciseWithDetails } from "../models/exercise";
import { exerciseService } from "../services/api/exercise-service";

type ClientDetailRouteProp = RouteProp<RootStackParamList, "ClientDetail">;

export default function ClientDetailScreen() {
  const route = useRoute<ClientDetailRouteProp>();
  const { client } = route.params;

  type ClientDetailPageRenderer = (user: LoggedUser) => JSX.Element;

  const { user, token } = useAuth();

  if (!user) return null;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "OffersHistory"
  >;
  const navigation = useNavigation<NavigationProp>();

  const [
    editSubscriptionEditPopUpVisible,
    setEditSubscriptionEditPopUpVisible,
  ] = useState(false);

  const [sportCategories, setSportCategories] = useState<Category[]>([]);
  const [medicCategories, setMedicCategories] = useState<Category[]>([]);

  const [subscriptionFile, setSubscriptionFile] = useState<File | null>(null);
  const [medicFiles, setMedicFiles] = useState<File[]>([]);

  const [objectives, setObjectives] = useState<ObjectiveModel[]>([]);
  const [currentObjective, setCurrentObjective] =
    useState<ObjectiveModel | null>(null);

  const [activeSessions, setActiveSessions] = useState<SessionWithFile[]>([]);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [progressGraphData, setProgressGraphData] = useState<
    { month: string; value: number }[]
  >([]);

  const [billingGroups, setBillingGroups] = useState<
    {
      objective: ObjectiveModel;
      billings: Billing[];
    }[]
  >([]);

  const [linkedMedics, setLinkedMedics] = useState<User[]>([]);

  // Popup for data edition
  const [editNotesPopUpVisible, setEditNotesPopUpVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const [addObjectivePopUpVisible, setAddObjectivePopUpVisible] =
    useState(false);
  const [coachSelectorVisible, setCoachSelectorVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);

  const [objectiveLoading, setObjectiveLoading] = useState(false);

  const [addSessionPopUpVisible, setAddSessionPopUpVisible] = useState(false);

  const [addMedicToSportsmanPopUpVisible, setAddMedicToSportsmanPopUpVisible] =
    useState(false);

  interface ObjectiveFormData {
    objectiveLabel: string;
    objectiveStartDate: string;
    objectiveEndDate: string;
    objectiveIsMonthly: boolean;
    billingMonthlyAmount: string;
    billingTotalAmount: string;
  }

  const [formData, setFormData] = useState<ObjectiveFormData>({
    objectiveLabel: "",
    objectiveStartDate: "",
    objectiveEndDate: "",
    objectiveIsMonthly: false,
    billingMonthlyAmount: "",
    billingTotalAmount: "",
  });

  const [allExercises, setAllExercises] = useState<ExerciseWithDetails[]>([]);
  const [allSessions, setAllSessions] = useState<SessionWithFile[]>([]);
  const [muscleGroupCategories, setMuscleGroupCategories] = useState<
    Category[]
  >([]);

  const [archiveUserPopupVisible, setArchiveUserPopupVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAllClientData() {
      // Optionally: set a loading state here
      try {
        // Fetch categories in parallel
        const [sports, medics, muscleGroups] = await Promise.all([
          categoryService.getCategoriesByType(CategoryType.SPORT, token ?? ""),
          categoryService.getCategoriesByType(
            CategoryType.MEDICAL,
            token ?? ""
          ),
          categoryService.getCategoriesByType(
            CategoryType.MUSCLE_GROUP,
            token ?? ""
          ),
        ]);
        if (!isMounted) return;
        setSportCategories(sports);
        setMedicCategories(medics);
        setMuscleGroupCategories(muscleGroups);

        // Only fetch sportsman-specific data if needed
        if (
          client.profileCategory === ProfileCategory.SPORTSMAN &&
          client.id &&
          token
        ) {
          // Fetch objectives, graph, sessions, exercises, medics, files, billings in parallel
          const [objectives, graphs, allSessions, exercises] =
            await Promise.all([
              ObjectivesApiService.getObjectivesBySportsman(client.id, token),
              GraphService.getGraphsByUserId(client.id, token),
              new SessionService().getAllSessions(token),
              exerciseService.getAllExercises(token),
            ]);
          if (!isMounted) return;
          setObjectives(objectives);
          const activeObjective =
            objectives.find((o) => o.isActive) || objectives[0] || null;
          setCurrentObjective(activeObjective);

          const sessionsWithFiles: SessionWithFile[] = await Promise.all(
            allSessions.map(async (session) => ({
              session,
              filePicture: session.filePictureId
                ? await fileService
                    .getFileById(session.filePictureId, token)
                    .catch(() => null)
                : null,
            }))
          );
          setAllSessions(sessionsWithFiles);
          setAllExercises(exercises as ExerciseWithDetails[]);

          // Graph
          setGraph(graphs[0] || null);
          const graph = graphs.find((g) => g.isActive) || graphs[0];
          if (graph && graph.listMonthlyValue && graph.startDate) {
            const entries = graph.listMonthlyValue
              .split(";")
              .map((entry) => entry.trim())
              .filter(Boolean);
            const monthLabels = getDynamicMonthLabels(
              graph.startDate,
              entries.length
            );
            const data = entries.map((entry, idx) => {
              const [monthNum, value] = entry.split(":").map((s) => s.trim());
              return {
                month: monthLabels[idx] || monthNum,
                value: Number(value),
              };
            });
            setProgressGraphData(data);
          } else {
            setProgressGraphData([]);
          }

          // Subscription file
          if ((client.profile as SportsmanProfile)?.subscriptionId) {
            try {
              const subscription =
                await new SubscriptionService().getSubscriptionById(
                  (client.profile as SportsmanProfile).subscriptionId!,
                  token
                );
              if (subscription?.subscriptionFileId) {
                const file = await fileService.getFileById(
                  subscription.subscriptionFileId,
                  token
                );
                if (isMounted) setSubscriptionFile(file);
              }
            } catch {
              if (isMounted) setSubscriptionFile(null);
            }
          }

          // Medic files
          if ((client.profile as SportsmanProfile)?.listMedicFiles) {
            const listMedicFiles = (client.profile as SportsmanProfile)
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

          // Linked medics
          if ((client.profile as SportsmanProfile)?.listMedicsIds) {
            const listMedicsIds = (client.profile as SportsmanProfile)
              .listMedicsIds;
            const ids = listMedicsIds
              ? listMedicsIds
                  .split(";")
                  .map((id) => parseInt(id.trim(), 10))
                  .filter((id) => !isNaN(id))
              : [];
            try {
              const users = await Promise.all(
                ids.map((id) => UserService.getUserById(id, token))
              );
              if (isMounted) setLinkedMedics(users.map((res) => res.user));
            } catch {
              if (isMounted) setLinkedMedics([]);
            }
          } else {
            setLinkedMedics([]);
          }

          // Active sessions
          try {
            const sessionService = new SessionService();
            const linkedSessions = await sessionService.getSessionsBySportsman(
              client.id,
              token
            );
            const sessionPromises = linkedSessions.map((ls) =>
              sessionService.getSessionById(ls.sessionId, token)
            );
            const allActiveSessions = await Promise.all(sessionPromises);
            const onlyActive = allActiveSessions.filter(
              (s) => s.session.isActive
            );
            if (isMounted) setActiveSessions(onlyActive);
          } catch {
            if (isMounted) setActiveSessions([]);
          }

          // Billings
          try {
            const objectives =
              await ObjectivesApiService.getObjectivesBySportsman(
                client.id,
                token
              );
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
      } catch (e) {
        console.error(
          "Erreur lors de la récupération des données du client :",
          e
        );
      }
    }
    fetchAllClientData();
    return () => {
      isMounted = false;
    };
  }, [client, token]);

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Get sport or medical category label for the client
  const getCategoryLabel = () => {
    if (
      (client.profileCategory === ProfileCategory.SPORTSMAN ||
        client.profileCategory === ProfileCategory.COACH) &&
      typeof (client.profile as any).sportCategoryId !== "undefined" &&
      (client.profile as any).sportCategoryId &&
      sportCategories.length > 0
    ) {
      const sportCategoryId = (client.profile as any).sportCategoryId;
      const cat = sportCategories.find((c) => c.id === sportCategoryId);
      return cat ? cat.label : "";
    }
    if (
      client.profileCategory === ProfileCategory.MEDIC &&
      typeof (client.profile as any).medicCategoryId !== "undefined" &&
      (client.profile as any).medicCategoryId &&
      medicCategories.length > 0
    ) {
      const medicCategoryId = (client.profile as any).medicCategoryId;
      const cat = medicCategories.find((c) => c.id === medicCategoryId);
      return cat ? cat.label : "";
    }
    return "";
  };

  // Parse all notes from the notes string
  const getAllNotes = (notesString?: string) => {
    if (!notesString) return [];
    // Split on };{ and fix the curly braces
    return notesString.split(/};\s*{/).map((note, idx, arr) => {
      // Add missing braces for first and last
      let cleanNote = note;
      if (idx === 0 && !note.startsWith("{")) cleanNote = "{" + note;
      if (idx === arr.length - 1 && !note.endsWith("}")) cleanNote = note + "}";
      if (idx !== 0 && !note.startsWith("{")) cleanNote = "{" + note;
      if (idx !== arr.length - 1 && !note.endsWith("}")) cleanNote = note + "}";
      // Now parse header/message
      const firstComma = cleanNote.indexOf(",");
      if (firstComma === -1) return { header: cleanNote, message: "" };
      const header = cleanNote.slice(1, firstComma).trim();
      const message = cleanNote
        .slice(firstComma + 1, cleanNote.length - 1)
        .trim();
      return { header, message };
    });
  };

  const notesString = (client.profile as SportsmanProfile)?.listMedicNotes;
  const allNotes = getAllNotes(notesString);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    // Build author info
    const authorCategory = `[${
      user.profileCategory.charAt(0).toUpperCase() +
      user.profileCategory.slice(1)
    }]`;
    const authorName = `${user.lastName.toUpperCase()} ${user.firstName}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR");
    const hourStr = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const header = `${authorCategory} ${authorName} - le ${dateStr} à ${hourStr}`;

    // Build new note
    const newNote = `{${header}, ${newNoteContent.trim()}}`;

    // Get previous notes
    const prevNotes =
      (client.profile as SportsmanProfile)?.listMedicNotes || "";

    // Concatenate with ";" if needed
    const updatedNotes = prevNotes ? `${prevNotes};${newNote}` : newNote;

    // Update the sportsman profile
    try {
      await UserService.updateSportsman(
        client.id,
        { listMedicNotes: updatedNotes },
        token as string
      );
      // Optionally, refresh client/profile data here
      setEditNotesPopUpVisible(false);
      setNewNoteContent("");
      // Refresh the notes
    } catch (e) {
      console.error("Erreur lors de l'ajout de la note :", e);
    }
  };

  const handleNewObjectiveInputChange = (
    field: keyof ObjectiveFormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddObjective = async () => {
    setObjectiveLoading(true);
    let createdObjective: ObjectiveModel | null = null;
    try {
      if (client.profileCategory === ProfileCategory.SPORTSMAN && token) {
        const objectivePayload = {
          sportsmanId: client.id,
          label: formData.objectiveLabel || "",
          ...(selectedCoach && { responsibleId: selectedCoach.id }),
          startDate: formData.objectiveStartDate || "",
          endDate: formData.objectiveEndDate || "",
          isActive: true,
        };
        const objectiveRes = await ObjectivesApiService.createObjective(
          objectivePayload as any,
          token
        );
        createdObjective = objectiveRes.objective;
      }

      if (
        client.profileCategory === ProfileCategory.SPORTSMAN &&
        createdObjective !== null &&
        token
      ) {
        if (formData.objectiveIsMonthly) {
          const monthDates = getMonthStartDates(
            createdObjective.startDate,
            createdObjective.endDate
          );
          await Promise.all(
            monthDates.map((date, idx) =>
              billingService.createBilling(
                {
                  objectiveId: createdObjective!.id,
                  billingId: Number(`${createdObjective!.id}${idx + 1}`),
                  date,
                  globalAmount: 0,
                  isMonthly: true,
                  monthlyAmount: Number(formData.billingMonthlyAmount) || 0,
                  paymentReceived: false,
                  isActive: true,
                },
                token
              )
            )
          );
        } else {
          await billingService.createBilling(
            {
              objectiveId: createdObjective.id,
              billingId: createdObjective.id,
              date: createdObjective.startDate,
              globalAmount: Number(formData.billingTotalAmount),
              isMonthly: false,
              monthlyAmount: 0,
              paymentReceived: false,
              isActive: true,
            },
            token
          );
        }
      }
      setAddObjectivePopUpVisible(false);
      // Optionally refresh objectives/billings here
    } catch (e) {
      // Optionally show an error message
    } finally {
      setObjectiveLoading(false);
    }
  };
  const handleAddCoachSubmit = (users: User[]) => {
    setSelectedCoach(users[0] || null);
    setCoachSelectorVisible(false);
  };

  const handleMedicToSportsmanSubmit = async (
    selectedMedics: User[],
    isMounted: boolean
  ) => {
    if (selectedMedics.length > 0 && token) {
      let listMedicsIds = "";
      selectedMedics.map((medic) => {
        listMedicsIds += `${medic.id};`;
      });
      const ids = listMedicsIds
        ? listMedicsIds
            .split(";")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];
      try {
        const users = await Promise.all(
          ids.map((id) => UserService.getUserById(id, token))
        );
        if (isMounted) setLinkedMedics(users.map((res) => res.user));
      } catch {
        if (isMounted) setLinkedMedics([]);
      }
    } else {
      setLinkedMedics([]);
    }
  };

  const clientInformationsContent: JSX.Element = (
    <>
      <View style={{ flexDirection: "column", gap: 24 }}>
        <UserCard
          detailled
          canBeContacted
          firstName={client.firstName}
          lastName={client.lastName}
          susbcriptionLabel={
            client.profileCategory === ProfileCategory.SPORTSMAN
              ? (client.profile as SportsmanProfile)?.subscription
                  ?.subscriptionFile.label || ""
              : ""
          }
          email={client.email || ""}
          phone={client.phone || ""}
          sport={getCategoryLabel()}
          age={getAge(client.birthDate)}
          profilePictureUrl={
            client.image || "users/profilePicture/img-profile-1"
          }
        />
        <AppText>Réseaux sociaux</AppText>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {client.facebookLink && (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
          )}
          {client.instagramLink && (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
          )}
          {client.linkedinLink && (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
                style={{ height: "100%" }}
              />
            </View>
          )}
        </View>
        <AppText>
          {client.description || "Aucune description renseignée."}
        </AppText>
        {/* Tests sportifs & bilans */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>TESTS SPORTIFS & BILANS</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {subscriptionFile ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <AppText>{subscriptionFile.label}</AppText>
                <Icon
                  name="download"
                  width={24}
                  height={24}
                  fillColor="transparent"
                  strokeColor="black"
                  strokeWidth={2}
                />
              </View>
            ) : (
              <AppText>Aucun fichier de test sportif</AppText>
            )}
          </View>
          {(user.profileCategory === "admin" ||
            user.profileCategory === "coach") && (
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton type="add" iconName="plus" />
            </View>
          )}
        </View>
        {/* Comptes rendus médicaux */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>COMPTES RENDUS MEDICAUX</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {medicFiles.length > 0 ? (
              medicFiles.map((file) => (
                <View
                  key={file.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText>{file.label}</AppText>
                  <Icon
                    name="download"
                    width={24}
                    height={24}
                    fillColor="transparent"
                    strokeColor="black"
                    strokeWidth={2}
                  />
                </View>
              ))
            ) : (
              <AppText>Aucun compte rendu médical</AppText>
            )}
          </View>
          {(user.profileCategory === "admin" ||
            user.profileCategory === "medic") && (
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton type="add" iconName="plus" />
            </View>
          )}
        </View>
        {/* Notes */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>NOTES</AppText>
          <View>
            {allNotes.length > 0 ? (
              allNotes.map((note, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <AppText style={{ fontWeight: "bold" }}>
                    {note.header}
                  </AppText>
                  <AppText>{note.message}</AppText>
                </View>
              ))
            ) : (
              <AppText>Aucune note</AppText>
            )}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={() => setEditNotesPopUpVisible(true)}
            />
          </View>
        </View>
        {editNotesPopUpVisible && (
          <Modal
            visible={editNotesPopUpVisible}
            transparent
            onRequestClose={() => {
              setEditNotesPopUpVisible(false);
            }}
          >
            <Pressable
              onPress={() => {
                setEditNotesPopUpVisible(false);
              }}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                onClose={() => {
                  setEditNotesPopUpVisible(false);
                  setNewNoteContent("");
                }}
                title="Ajouter une note"
                btnType="primary"
                btnText="Valider"
                iconName="check"
                closeText="Annuler"
                onSubmit={handleAddNote}
                paragraph="Renseignez ici le contenu de la note"
                inputs={
                  <>
                    <Input
                      type="textarea"
                      label="Contenu de la note"
                      placeholder="Remarques, conseils, etc."
                      value={newNoteContent}
                      onChangeText={setNewNoteContent}
                    />
                  </>
                }
              />
            </Pressable>
          </Modal>
        )}
        {/* Prestation & échéance */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>PRESTATION & ECHEANCES</AppText>
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
          {user.profileCategory === "admin" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppButton
                type="linkNormal"
                title="Voir la facturation"
                iconName="eye"
              />
              <AppButton
                type="add"
                iconName="plus"
                onPress={() => setAddObjectivePopUpVisible(true)}
              />
            </View>
          )}
          {addObjectivePopUpVisible && (
            <Modal
              visible={addObjectivePopUpVisible}
              transparent
              onRequestClose={() => {
                setAddObjectivePopUpVisible(false);
              }}
            >
              <Pressable
                onPress={() => {
                  setAddObjectivePopUpVisible(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <PopUp
                  onClose={() => {
                    if (!objectiveLoading) setAddObjectivePopUpVisible(false);
                  }}
                  title="Ajouter un objectif"
                  btnType="primary"
                  btnText="Valider"
                  iconName="check"
                  closeText="Annuler"
                  onSubmit={handleAddObjective}
                  paragraph="Renseignez les champs ci-dessous pour ajouter un objectif"
                  specificBody={
                    objectiveLoading ? (
                      <View style={{ alignItems: "center", padding: 32 }}>
                        <ActivityIndicator
                          size="large"
                          color={Colors.deepBlue}
                        />
                        <AppText style={{ marginTop: 16 }}>
                          Création en cours...
                        </AppText>
                      </View>
                    ) : (
                      <View style={{ flexDirection: "column", gap: 16 }}>
                        <Input
                          type="text"
                          label="Libellé de la prestation"
                          placeholder="Libellé"
                          value={formData.objectiveLabel || ""}
                          onChangeText={(v) =>
                            handleNewObjectiveInputChange("objectiveLabel", v)
                          }
                        />
                        <Input
                          type="date"
                          label="Date de début"
                          placeholder="XX/XX/XXXX"
                          value={formData.objectiveStartDate || ""}
                          onChangeText={(v) =>
                            handleNewObjectiveInputChange(
                              "objectiveStartDate",
                              v
                            )
                          }
                        />

                        <Input
                          type="date"
                          label="Date de fin"
                          placeholder="XX/XX/XXXX"
                          value={formData.objectiveEndDate || ""}
                          onChangeText={(v) =>
                            handleNewObjectiveInputChange("objectiveEndDate", v)
                          }
                        />

                        <View style={{ flexDirection: "column", gap: 8 }}>
                          <AppText>Tarification complète par défaut</AppText>
                          <Input
                            type="checkbox"
                            label="Passer en tarification par mois"
                            value={formData.objectiveIsMonthly || false}
                            onChange={(v) =>
                              handleNewObjectiveInputChange(
                                "objectiveIsMonthly",
                                v
                              )
                            }
                          />
                        </View>

                        <Input
                          type="text"
                          label={
                            formData.objectiveIsMonthly
                              ? "Tarification par mois"
                              : "Tarification totale"
                          }
                          placeholder={
                            formData.objectiveIsMonthly ? "XX€/mois" : "XX€"
                          }
                          value={
                            formData.objectiveIsMonthly
                              ? formData.billingMonthlyAmount || ""
                              : formData.billingTotalAmount || ""
                          }
                          onChangeText={(v) =>
                            handleNewObjectiveInputChange(
                              formData.objectiveIsMonthly
                                ? "billingMonthlyAmount"
                                : "billingTotalAmount",
                              v
                            )
                          }
                        />
                        <Pressable
                          onPress={() =>
                            setCoachSelectorVisible(!coachSelectorVisible)
                          }
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: Colors.deepBlue,
                            marginTop: 8,
                          }}
                        >
                          {selectedCoach ? (
                            <AppText>
                              {selectedCoach.firstName} {selectedCoach.lastName}
                            </AppText>
                          ) : (
                            <AppText style={{ color: Colors.grey }}>
                              Sélectionnez un coach à affecter
                            </AppText>
                          )}
                        </Pressable>
                        <AppText>
                          Le coach sélectionné sera responsable de l'objectif de
                          ce sportif.
                        </AppText>
                      </View>
                    )
                  }
                />
              </Pressable>
            </Modal>
          )}
          {coachSelectorVisible && (
            <AddContacts
              visible={coachSelectorVisible}
              onClose={() => setCoachSelectorVisible(!coachSelectorVisible)}
              onSubmit={handleAddCoachSubmit}
              token={token as string}
            />
          )}
          <AppText style={GlobalStyles.h3}>PLAN DE PERFORMANCES</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            {activeSessions.length > 0 ? (
              activeSessions.map((sessionWithFile) => (
                <Session
                  key={sessionWithFile.session.id}
                  title={sessionWithFile.session.label}
                  nbExercises={sessionWithFile.session.numberOfExercises}
                  durationTime={getMinutesFromDuration(
                    sessionWithFile.session.durationTime
                  )}
                  labels={[]}
                />
              ))
            ) : (
              <AppText>Aucune séance active</AppText>
            )}
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="primary"
                title="Envoyer un plan"
                iconName="send"
                onPress={() => {
                  setAddSessionPopUpVisible(true);
                }}
              />
            </View>
            {addSessionPopUpVisible && (
              <AddSessions
                visible={addSessionPopUpVisible}
                listOfSession={allSessions}
                onClose={() => setAddSessionPopUpVisible(false)}
                onSubmit={(selectedSessions) => {
                  selectedSessions.map(async (s) => {
                    await new SessionService().addSessionToSportsman(
                      client.id,
                      s.session.id,
                      token as string
                    );
                  });
                }}
                exercises={allExercises}
                categories={muscleGroupCategories}
              />
            )}
          </View>
          {user.profileCategory === "coach" && (
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>AVANCEMENT</AppText>
              <Session
                title="Séance de fracitionné"
                isToDo
                onChangeStateBtnPress={() => {}}
                hasChangeStateBtn
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label
                    key={1}
                    backgroundColor="#D6EBFF"
                    textColor="#1E3A8A"
                    size="small"
                    title="Label"
                  />,
                  <Label
                    key={2}
                    backgroundColor="#D6EBFF"
                    textColor="#1E3A8A"
                    size="small"
                    title="Label"
                  />,
                ]}
              />
            </View>
          )}
        </View>
        {/* Formulaire de suivi */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>FORMULAIRE DE SUIVI</AppText>
          <View>
            <AppText style={{ fontWeight: "bold" }}>
              Mis à jour le DD/MM/YYYY
            </AppText>
            <AppText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id
              volutpat sem.
            </AppText>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton type="primary" title="Télécharger" iconName="download" />
          </View>
        </View>
        {graph && graph.isActive && (
          <View>
            <ProgressGraph title={graph.title} data={progressGraphData} />
          </View>
        )}
        {/* User profile management */}
        {user.profileCategory === "admin" && (
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppButton
                type="primary"
                title="Archiver"
                iconName="archive"
                onPress={() => setArchiveUserPopupVisible(true)}
              />
              <AppButton
                type="secondary"
                title="Abonnement"
                iconName="subscription"
                onPress={() => {
                  setEditSubscriptionEditPopUpVisible(
                    !editSubscriptionEditPopUpVisible
                  );
                }}
              />
            </View>
            {archiveUserPopupVisible && (
              <Modal
                visible={archiveUserPopupVisible}
                transparent
                onRequestClose={() => {
                  setArchiveUserPopupVisible(false);
                }}
              >
                <Pressable
                  onPress={() => {
                    setArchiveUserPopupVisible(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <PopUp
                    onClose={() => {
                      setArchiveUserPopupVisible(false);
                    }}
                    title="Archiver l'utilisateur"
                    btnType="primary"
                    btnText="Archiver"
                    iconName="archive"
                    closeText="Annuler"
                    onSubmit={async () => {
                      try {
                        await UserService.updateUserByProfileAndId(
                          client.id,
                          client.profileCategory,
                          { isActive: false },
                          token!
                        );
                        setArchiveUserPopupVisible(false);
                      } catch (error) {
                        console.error("Erreur lors de l'archivage :", error);
                      }
                    }}
                    paragraph="Êtes-vous sûr de vouloir archiver cet utilisateur ?"
                  />
                </Pressable>
              </Modal>
            )}
          </View>
        )}
      </View>
    </>
  );

  const ClientDetailPageByProfile: Record<string, ClientDetailPageRenderer> = {
    coach: (user) => <>{clientInformationsContent}</>,
    medic: (user) => <>{clientInformationsContent}</>,
    admin: (user) => {
      const [editNewOfferPopUpVisible, setEditNewOfferPopUpVisible] =
        useState(false);
      const [newOfferType, setNewOfferType] = useState("commerciale");
      const handleTypeNewOffer = () => {
        if (newOfferType === "commerciale") {
          setNewOfferType("sponsoring");
        } else if (newOfferType === "sponsoring") {
          setNewOfferType("commerciale");
        }
      };
      const handleEditNewOfferPopUp = () => {
        setEditNewOfferPopUpVisible(!editNewOfferPopUpVisible);
      };

      switch (client.profileCategory) {
        case "sportsman":
          const [activeTabIndex, setActiveTabIndex] = useState(0);
          const tabViews: JSX.Element[] = [
            <View key="informations">{clientInformationsContent}</View>,
            <View key="billing" style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>FACTURATION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <AppText style={{ fontWeight: "bold" }}>
                  Plan de facturation choisi
                </AppText>
                <View>
                  <AppText>
                    {
                      (client.profile as SportsmanProfile).subscription
                        ?.labelDiagnostic
                    }
                  </AppText>
                  <AppText>
                    {
                      (client.profile as SportsmanProfile).subscription
                        ?.labelPerformancePlan
                    }
                  </AppText>
                </View>
              </View>
              {billingGroups.length > 0 ? (
                billingGroups.map(({ objective, billings }) => {
                  if (!billings.length) return null;

                  // Group billings by isMonthly
                  const isMonthly = billings[0].isMonthly;

                  // For monthly, sort by date descending (optional)
                  const sortedBillings = [...billings].sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
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
            </View>,
            <View key="medics" style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>SOIGNANTS</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                {linkedMedics.length > 0 ? (
                  linkedMedics.map((medic) => (
                    <View
                      key={medic.id}
                      style={{ flexDirection: "column", gap: 8 }}
                    >
                      <ItemUser user={medic} isCompany={false} />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                        }}
                      >
                        <AppButton
                          type="linkSmall"
                          title="Supprimer"
                          iconName="trash"
                          textStyle={{ color: Colors.lightRed }}
                          borderColor={Colors.lightRed}
                          iconColor={Colors.lightRed}
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <AppText>Aucun soignant lié</AppText>
                )}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  type="add"
                  iconName="plus"
                  onPress={() => {
                    setAddMedicToSportsmanPopUpVisible(true);
                  }}
                />
              </View>
              {addMedicToSportsmanPopUpVisible && (
                <AddContacts
                  visible={addMedicToSportsmanPopUpVisible}
                  onClose={() => setAddMedicToSportsmanPopUpVisible(false)}
                  onSubmit={(users) => {
                    handleMedicToSportsmanSubmit(users, true);
                    setAddMedicToSportsmanPopUpVisible(false);
                  }}
                  token={token!}
                />
              )}
            </View>,
          ];

          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <ViewController
                  tabs={[
                    { title: "Informations", icon: "information" },
                    { title: "Facturation", icon: "billing" },
                    { title: "Soignants", icon: "medic" },
                  ]}
                  onTabChange={setActiveTabIndex}
                />
                {tabViews[activeTabIndex]}
              </View>
              <Modal
                visible={editSubscriptionEditPopUpVisible}
                transparent
                onRequestClose={() => {
                  setEditSubscriptionEditPopUpVisible(false);
                }}
              >
                <Pressable
                  onPress={() => {
                    setEditSubscriptionEditPopUpVisible(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <PopUp
                    title="Editer l'abonnement"
                    paragraph="Importez le contrat d'offre d'abonnement ici"
                    specificBody={
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                        }}
                      >
                        <AppButton
                          type="secondary"
                          title="Sélectionner le fichier"
                          iconName="download"
                        />
                      </View>
                    }
                    inputs={
                      <>
                        <Input
                          type="selector"
                          label="Choix du diagnostic"
                          options={[
                            {
                              label: "Gold",
                              value: "gold",
                            },
                            {
                              label: "Silver",
                              value: "silver",
                            },
                          ]}
                        />
                      </>
                    }
                    onClose={() =>
                      setEditSubscriptionEditPopUpVisible(
                        !editSubscriptionEditPopUpVisible
                      )
                    }
                    closeText="Annuler"
                    onSubmit={() =>
                      setEditSubscriptionEditPopUpVisible(
                        !editSubscriptionEditPopUpVisible
                      )
                    }
                    btnType="primary"
                    btnText="Modifier"
                    iconName="check"
                  />
                </Pressable>
              </Modal>
            </>
          );
        case "medic":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email}
                  phone="0606060606"
                  age="24"
                  profilePictureUrl="users/profilePicture/img-profile-1"
                />
                <AppText>Réseaux sociaux</AppText>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                </View>
                <AppText>
                  Passionné de trail et de nature, je participe régulièrement à
                  des courses en montagne. J'aime partager mes expériences et
                  conseiller les autres coureurs sur les meilleures techniques
                  et équipements pour le trail.
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES PATIENTS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    <ItemUser
                      user={{
                        firstName: "firstName",
                        lastName: "Lastname",
                        email: "one@mail.com",
                        id: 1,
                        isActive: true,
                        profileCategory: ProfileCategory.SPORTSMAN,
                        createdAt: new Date().toLocaleDateString("fr-FR"),
                        updatedAt: new Date().toLocaleDateString("fr-FR"),
                      }}
                      isCompany={false}
                    />
                    <ItemUser
                      user={{
                        firstName: "firstName",
                        lastName: "Lastname",
                        email: "one@mail.com",
                        id: 1,
                        isActive: true,
                        profileCategory: ProfileCategory.SPORTSMAN,
                        createdAt: new Date().toLocaleDateString("fr-FR"),
                        updatedAt: new Date().toLocaleDateString("fr-FR"),
                      }}
                      isCompany={false}
                    />
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton type="add" iconName="plus" />
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
            </>
          );
        case "coach":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email}
                  phone="0606060606"
                  age="24"
                  profilePictureUrl="users/profilePicture/img-profile-1"
                />
                <AppText>Réseaux sociaux</AppText>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                </View>
                <AppText>
                  Passionné de trail et de nature, je participe régulièrement à
                  des courses en montagne. J'aime partager mes expériences et
                  conseiller les autres coureurs sur les meilleures techniques
                  et équipements pour le trail.
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES CLIENTS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    <ItemUser
                      user={{
                        firstName: "firstName",
                        lastName: "Lastname",
                        email: "one@mail.com",
                        id: 1,
                        isActive: true,
                        profileCategory: ProfileCategory.SPORTSMAN,
                        createdAt: new Date().toLocaleDateString("fr-FR"),
                        updatedAt: new Date().toLocaleDateString("fr-FR"),
                      }}
                      isCompany={false}
                    />
                    <ItemUser
                      user={{
                        firstName: "firstName",
                        lastName: "Lastname",
                        email: "two@mail.com",
                        id: 2,
                        isActive: true,
                        profileCategory: ProfileCategory.SPORTSMAN,
                        createdAt: new Date().toLocaleDateString("fr-FR"),
                        updatedAt: new Date().toLocaleDateString("fr-FR"),
                      }}
                      isCompany={false}
                    />
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton type="add" iconName="plus" />
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
            </>
          );
        case "partner":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 32 }}>
                <View style={{ flexDirection: "column", gap: 24 }}>
                  <UserCard
                    companyName={client.firstName}
                    companyAdress="10 rue François Mitterand 56000 Vannes"
                    profilePictureUrl="users/companies/nutrisport-logo"
                    companyLink="https://nutrisport.com"
                  />
                  <AppText>Adhésion valide jusqu'au XX/XX/XXXX</AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <AppButton
                      type="primary"
                      title="Modifier"
                      iconName="pencil"
                    />
                  </View>
                  <AppText style={GlobalStyles.h3}>REPRESENTANT</AppText>
                  <UserCard
                    detailled
                    canBeContacted
                    firstName="firstName"
                    lastName="LastName"
                    email={client.email}
                    phone="0606060606"
                    age="24"
                    profilePictureUrl="users/profilePicture/img-profile-1"
                  />
                  <AppText>Réseaux sociaux entreprise</AppText>
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                  </View>
                  <AppText>
                    Nutrisport a pour but d'offrir des produits nutritionnels de
                    qualité aux sportifs et promouvoir la marque via des
                    événements et des sponsorings.
                  </AppText>
                </View>
                <View style={{ flexDirection: "column", gap: 24 }}>
                  <AppText style={GlobalStyles.h2}>OFFRES</AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <AppButton
                      type="linkNormal"
                      title="Historique"
                      iconName="eye"
                      onPress={() => {
                        navigation.navigate("OffersHistory");
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <OfferCard
                      companyName={client.firstName}
                      companyImgUrl="users/companies/nutrisport-logo"
                      title="Abonnement Acces +"
                      paragraph="-20% pour les 3 premiers mois sur l'abonnement Acces + et frais d'adhésion offert. "
                      conditions="Bon à usage unique."
                      startDate={new Date("2025-03-30")}
                      endDate={new Date("2025-04-30")}
                      isSponsorship={false}
                      labelTxt="-20%"
                      onPress={() => {}}
                      iconName="link"
                    />
                    <OfferCard
                      companyName={client.firstName}
                      companyImgUrl="users/companies/nutrisport-logo"
                      title="Marathon de Vannes"
                      paragraph="Offre de sponsoring pour le marathon de Vannes. T-shirt running et dossard offert."
                      conditions="Plan d'entrainement running sur Hyperion Connect requis."
                      startDate={new Date("2025-03-30")}
                      endDate={new Date("2025-04-30")}
                      isSponsorship
                      onPress={() => {}}
                      iconName="send"
                    />
                    <View
                      style={{ flexDirection: "row", justifyContent: "center" }}
                    >
                      <AppButton
                        type="add"
                        iconName="plus"
                        onPress={handleEditNewOfferPopUp}
                      />
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
              <Modal
                visible={editNewOfferPopUpVisible}
                transparent
                onRequestClose={handleEditNewOfferPopUp}
              >
                <ScrollView>
                  <Pressable
                    onPress={handleEditNewOfferPopUp}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <PopUp
                      title="Editer une offre partenaire"
                      paragraph="De quelle type d'offre s'agit t'il ? "
                      onClose={handleEditNewOfferPopUp}
                      closeText="Annuler"
                      onSubmit={handleEditNewOfferPopUp}
                      btnText="Valider"
                      btnType="primary"
                      iconName="check"
                      specificBody={
                        <View style={{ flexDirection: "column", gap: 16 }}>
                          <View style={{ flexDirection: "column", gap: 8 }}>
                            <Input
                              type="selector"
                              label="Catégorie d'offre"
                              options={[
                                {
                                  label: "Offre commerciale",
                                  value: "commerciale",
                                },
                                {
                                  label: "Offre de sponsoring",
                                  value: "sponsoring",
                                },
                              ]}
                              onChangeText={() => handleTypeNewOffer()}
                            />
                            {newOfferType === "commerciale" && (
                              <Input
                                type="text"
                                label="Taux de réduction"
                                placeholder="10%"
                              />
                            )}
                            {newOfferType === "sponsoring" && (
                              <Input
                                type="selector"
                                label="Pour quelle catégorie de sport ?"
                                placeholder="Running"
                                options={[
                                  {
                                    label: "Running",
                                    value: "running",
                                  },
                                  {
                                    label: "Natation",
                                    value: "natation",
                                  },
                                ]}
                              />
                            )}
                          </View>
                          <View style={{ flexDirection: "column", gap: 8 }}>
                            <AppText>Détails de l'offre</AppText>
                            {newOfferType === "commerciale" && (
                              <>
                                <Input
                                  type="text"
                                  label="Libellé"
                                  placeholder="Nom du magasin, ..."
                                />
                                <Input
                                  type="text"
                                  label="Descritpion"
                                  placeholder="Comment fonctionne l'offre..."
                                />
                                <Input
                                  type="text"
                                  label="Conditions"
                                  placeholder="Jusqu'à quand ? Conditions d'utilistations..."
                                />
                                <Input
                                  type="text"
                                  label="Lien de l'offre"
                                  placeholder="https://www..."
                                />
                                <View style={{ flexDirection: "row", gap: 16 }}>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de début"
                                      placeholder="XX/XX/XXX"
                                    />
                                  </View>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de fin"
                                      placeholder="XX/XX/XXX"
                                    />
                                  </View>
                                </View>
                              </>
                            )}
                            {newOfferType === "sponsoring" && (
                              <>
                                <Input
                                  type="text"
                                  label="Libellé"
                                  placeholder="Nom du contrat"
                                />
                                <Input
                                  type="text"
                                  label="Descritpion"
                                  placeholder="Résumé de l'offre"
                                />
                                <Input
                                  type="text"
                                  label="Contrat"
                                  placeholder="Choisir un fichier"
                                />
                                <View style={{ flexDirection: "row", gap: 16 }}>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de début"
                                      placeholder="XX/XX/XXX"
                                    />
                                  </View>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de fin"
                                      placeholder="XX/XX/XXX"
                                    />
                                  </View>
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      }
                    />
                  </Pressable>
                </ScrollView>
              </Modal>
            </>
          );
        default:
          return <>{clientInformationsContent}</>;
      }
    },
  };

  const RenderProfileComponents =
    ClientDetailPageByProfile[user.profileCategory];

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
        {RenderProfileComponents ? RenderProfileComponents(user) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
