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
  Linking,
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
import { useCoachClients } from "../hooks/useCoachClients";
import { addSportsmanToCoachObjective } from "../utils/objective-utils";
import { useMedicClients } from "../hooks/useMedicClients";
import { addMedicToSportsman } from "../utils/sportsman-utils";
import { usePartnerAndCompany } from "../hooks/usePartnerAndCompany";
import { useCompanyOffers } from "../hooks/useCompanyOffers";
import { OfferCategory } from "../models/offer";
import { handleCreateOffer } from "../utils/offer-utils";
import { CompanyService } from "../services/api/company-service";
import { notify } from "../components/NotificationContainer";
import { eventService } from "../services/api/event-service";
import { CoachingEvent, EventCategory, isCoachingEvent } from "../models/event";
import { clientService } from "../services/api/client-service";

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
  const [sportsmanSelectorVisible, setSportsmanSelectorVisible] =
    useState(false);
  const [selectedSportsman, setSelectedSportsman] = useState<User | null>(null);

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

  const [
    changeTrackingFileLinkPopupVisible,
    setChangeTrackingFileLinkPopupVisible,
  ] = useState(false);
  const [trackingFileLink, setTrackingFileLink] = useState<string>("");

  const [subscriptionFileOfSportsman, setSubscriptionFileOfSportsman] =
    useState<File | null>(null);

  const [currentCoachingEvents, setCurrentCoachingEvents] = useState<
    { eventId: number; coachingEvent: CoachingEvent }[]
  >([]);
  const [
    evaluateCoachingEventPopUpVisible,
    setEvaluateCoachingEventPopUpVisible,
  ] = useState(false);
  const [coachCommentNote, setCoachCommentNote] = useState("");
  const [coachCommentText, setCoachCommentText] = useState("");
  const [selectedCoachingEvent, setSelectedCoachingEvent] = useState(0);

  const [
    editGraphOfSportsmanAsCoachVisible,
    setEditGraphOfSportsmanAsCoachVisible,
  ] = useState(false);
  const [editGraphFormAsCoach, setEditGraphFormAsCoach] = useState<{
    graphTitle: string;
    graphMeasuredValue: string;
  }>();

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
          const [objectives, graphs, allSessions, exercises, eventsComplete] =
            await Promise.all([
              ObjectivesApiService.getObjectivesBySportsman(client.id, token),
              GraphService.getGraphsByUserId(client.id, token),
              SessionService.getAllSessions(token),
              exerciseService.getAllExercises(token),
              eventService.getEventsByUserId(client.id, token),
            ]);
          if (!isMounted) return;
          setObjectives(objectives);

          setSportsmanNotes(
            getAllNotes((client.profile as SportsmanProfile)?.listMedicNotes)
          );
          if (eventsComplete.events.length > 0) {
            // Filter only coaching events using the type guard
            const coachingEvents =
              eventsComplete.events.filter(isCoachingEvent);

            // Fetch full event details for each coaching event in parallel
            const coachingEventDetails = await Promise.all(
              coachingEvents.map(async (e) => {
                const { event } = await eventService.getEventById(e.id, token);
                // Return both the parent event id and the coaching event details
                return {
                  eventId: event.id, // parent event id
                  coachingEvent: event.specificEvent as CoachingEvent,
                };
              })
            );
            if (isMounted) setCurrentCoachingEvents(coachingEventDetails);
          }

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
                setSubscriptionFileOfSportsman(file);
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
            const linkedSessions = await SessionService.getSessionsByUser(
              client.id,
              token
            );
            const sessionPromises = linkedSessions.map((ls) =>
              SessionService.getSessionById(ls.sessionId, token)
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
          if (user?.profileCategory === ProfileCategory.ADMIN) {
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

  useEffect(() => {
    if (editGraphOfSportsmanAsCoachVisible && graph) {
      setEditGraphFormAsCoach({
        graphTitle: graph.title,
        graphMeasuredValue: graph.measuredValue,
      });
    }
  }, [editGraphOfSportsmanAsCoachVisible, graph]);

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
  const [sportsmanNotes, setSportsmanNotes] = useState(allNotes);

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
      setEditNotesPopUpVisible(false);
      setNewNoteContent("");
      setSportsmanNotes(getAllNotes(updatedNotes));
      notify({ title: "Note ajoutée avec succès", type: "success" });
    } catch (e) {
      notify({
        title: "Une erreur est survenue lors de l'ajout d'une note",
        type: "error",
      });
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
      // Create objective
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
        setObjectives((prev) => [...prev, createdObjective as ObjectiveModel]);
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
        // Add sportsman to client table for coach if sporstman's id wasn't already in it
        if (selectedCoach) {
          let listClientOfSelectedPro = null;
          try {
            listClientOfSelectedPro =
              await clientService.getClientListByProfessionalId(
                selectedCoach.id,
                token
              );
          } catch (error: any) {
            // If 404, it means no client list exists yet for this pro
            if (error.status !== 404) {
              console.error("Erreur lors de la récupération du client:", error);
              // skip this pro if another error
              return;
            }
          }
          if (
            listClientOfSelectedPro &&
            !listClientOfSelectedPro.clientIds.includes(client.id)
          ) {
            await clientService.updateClientListByProfessionalId(
              selectedCoach.id,
              client.id,
              "add",
              token
            );
          } else {
            await clientService.createClientList(
              selectedCoach.id,
              client.id,
              token
            );
          }
        }
      }
      setAddObjectivePopUpVisible(false);
      notify({
        title: "Objectif créé avec succès",
        type: "success",
      });
    } catch (e) {
      notify({
        title: "L'objectif n'a pas pu être créé",
        type: "error",
      });
      console.error("Erreur lors de la création de l'objectif :", e);
    } finally {
      setObjectiveLoading(false);
    }
  };
  const handleAddCoachSubmit = (users: User[]) => {
    setSelectedCoach(users[0] || null);
    setCoachSelectorVisible(false);
  };
  const handleAddSportsmanSubmit = (users: User[]) => {
    setSelectedSportsman(users[0] || null);
    setSportsmanSelectorVisible(false);
  };

  const handleMedicToSportsmanSubmit = async (
    selectedMedics: User[],
    isMounted: boolean
  ) => {
    if (selectedMedics.length > 0 && token) {
      // Get current list of medic IDs
      const currentList =
        (client.profile as SportsmanProfile)?.listMedicsIds || "";
      const currentIds = currentList
        ? currentList
            .split(";")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];

      // Get new medic IDs from selection
      const newIds = selectedMedics.map((medic) => medic.id);

      // Merge and deduplicate
      const mergedIds = Array.from(new Set([...currentIds, ...newIds]));

      // Build new list string
      const updatedList = mergedIds.join(";");

      try {
        // Update the sportsman profile with the new list
        await UserService.updateSportsman(
          client.id,
          { listMedicsIds: updatedList },
          token
        );
        if (selectedMedics && selectedMedics.length > 0) {
          for (const medic of selectedMedics) {
            let listClientOfSelectedPro = null;
            try {
              listClientOfSelectedPro =
                await clientService.getClientListByProfessionalId(
                  medic.id,
                  token
                );
            } catch (error: any) {
              // If 404, it means no client list exists yet for this pro
              if (error.status !== 404) {
                console.error(
                  "Erreur lors de la récupération du client:",
                  error
                );
                continue; // skip this medic if another error
              }
            }
            if (listClientOfSelectedPro) {
              await clientService.updateClientListByProfessionalId(
                medic.id,
                client.id,
                "add",
                token
              );
            } else {
              await clientService.createClientList(medic.id, client.id, token);
            }
          }
        }

        // Optionally, fetch updated medic users for display
        const users = await Promise.all(
          mergedIds.map((id) => UserService.getUserById(id, token))
        );
        if (isMounted) setLinkedMedics(users.map((res) => res.user));
        notify({
          title: "Médecin ajouté avec succès",
          type: "success",
        });
      } catch {
        if (isMounted) setLinkedMedics([]);
      }
    } else {
      setLinkedMedics([]);
    }
  };

  const handleRemoveMedicFromSportsman = async (
    medicIdToRemove: number,
    isMounted: boolean
  ) => {
    if (!token) return;

    // Get current list of medic IDs
    const currentList =
      (client.profile as SportsmanProfile)?.listMedicsIds || "";
    const currentIds = currentList
      ? currentList
          .split(";")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id) && id !== medicIdToRemove)
      : [];

    // Build new list string with trailing semicolon if not empty
    const updatedList =
      currentIds.length > 0 ? currentIds.join("; ") + ";" : "";

    try {
      // Update the sportsman profile with the new list
      await UserService.updateSportsman(
        client.id,
        { listMedicsIds: updatedList },
        token
      );

      // Optionally, fetch updated medic users for display
      const users = await Promise.all(
        currentIds.map((id) => UserService.getUserById(id, token))
      );
      if (isMounted) setLinkedMedics(users.map((res) => res.user));
      notify({
        title: "Médecin retiré avec succès",
        type: "success",
      });
    } catch {
      if (isMounted) setLinkedMedics([]);
    }
  };

  // Handler for adding a sportsman to a coach
  const handleAddSportsmanToCoach = async (
    selectedSportsman: User,
    formData: ObjectiveFormData
  ) => {
    if (!selectedSportsman || !token) return;
    setObjectiveLoading(true);
    try {
      const createdObjective = await addSportsmanToCoachObjective({
        sportsmanId: selectedSportsman.id,
        coachId: client.id, // client is the coach in this context
        label: formData.objectiveLabel,
        startDate: formData.objectiveStartDate,
        endDate: formData.objectiveEndDate,
        token,
      });
      // Optionally refresh objectives/clients here
      setAddObjectivePopUpVisible(false);
      if (selectedSportsman) {
        let listClientOfSelectedPro = null;
        try {
          listClientOfSelectedPro =
            await clientService.getClientListByProfessionalId(client.id, token);
        } catch (error: any) {
          // If 404, it means no client list exists yet for this pro
          if (error.status !== 404) {
            console.error("Erreur lors de la récupération du client:", error);
            // skip this pro if another error
            return;
          }
        }
        if (
          listClientOfSelectedPro &&
          !listClientOfSelectedPro.clientIds.includes(selectedSportsman.id)
        ) {
          await clientService.updateClientListByProfessionalId(
            client.id,
            selectedSportsman.id,
            "add",
            token
          );
        } else {
          await clientService.createClientList(
            client.id,
            selectedSportsman.id,
            token
          );
        }
      }
    } catch (e) {
      // Optionally show an error message
    } finally {
      setObjectiveLoading(false);
    }
  };

  const handleChangeLinkTrackingFile = async () => {
    if (
      !trackingFileLink ||
      !client.id ||
      !token ||
      !(client.profile as SportsmanProfile).subscriptionId
    ) {
      return;
    } else {
      const subscription = await new SubscriptionService().getSubscriptionById(
        (client.profile as SportsmanProfile)?.subscriptionId!,
        token
      );
      const subsciptionFile = await fileService.getFileById(
        subscription.subscriptionFileId,
        token
      );
      try {
        await fileService.updateFile(
          subsciptionFile.id,
          {
            url: trackingFileLink,
          },
          token
        );
        setChangeTrackingFileLinkPopupVisible(false);
        notify({
          title: "Lien de suivi mis à jour avec succès",
          type: "success",
        });
      } catch (e) {
        notify({
          title: "Erreur lors de la mise à jour du lien de suivi",
          type: "error",
        });
        console.error("Erreur lors de la mise à jour du lien de suivi :", e);
      }
    }
  };

  // Handler to add a commentary when set a coaching event at isDone for coach profile
  const handleAddCommentaryToCoachingEventDone = async (eventId: number) => {
    if (user && token && coachCommentNote) {
      const updatedCoachingEvent = await eventService.getEventById(
        eventId,
        token
      );
      const event = updatedCoachingEvent.event.specificEvent as CoachingEvent;
      try {
        eventService.updateEvent(
          eventId,
          {
            coachNote: coachCommentNote,
            coachComment: coachCommentText,
            isDone:
              event.sportsmanComment !== null && event.sportsmanNote !== null
                ? true
                : false,
          },
          token
        );
      } catch (e) {
        console.log("Error while updating coaching event : ", e);
      }
    }
  };

  const handleUpdateGraphAsCoach = async (
    newTitle: string,
    newMeasuredValue: string
  ) => {
    if (!graph || !token) return;
    try {
      const updatedGraph = await GraphService.updateGraph(
        graph.id,
        {
          title: newTitle,
          measuredValue: newMeasuredValue,
        },
        token
      );
      setGraph(updatedGraph);
      notify({ title: "Graphique mis à jour avec succès", type: "success" });
      setEditGraphOfSportsmanAsCoachVisible(false);
    } catch (e) {
      notify({
        title: "Erreur lors de la mise à jour du graphique",
        type: "error",
      });
      console.error("Erreur lors de la mise à jour du graphique :", e);
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
            client.filePicture?.url || "users/profilePicture/img-profile-1"
          }
        />
        {(client.facebookLink ||
          client.instagramLink ||
          client.linkedinLink) && (
          <>
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
                    source={{
                      uri: "https://reactnative.dev/img/tiny_logo.png",
                    }}
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
                    source={{
                      uri: "https://reactnative.dev/img/tiny_logo.png",
                    }}
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
                    source={{
                      uri: "https://reactnative.dev/img/tiny_logo.png",
                    }}
                    style={{ height: "100%" }}
                  />
                </View>
              )}
            </View>
          </>
        )}
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
            {sportsmanNotes.length > 0 ? (
              sportsmanNotes.map((note, idx) => (
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
                onSubmit={async (selectedSessions) => {
                  await Promise.all(
                    selectedSessions.map((s) =>
                      SessionService.addSessionToUser(
                        client.id,
                        s.session.id,
                        token as string
                      )
                    )
                  );
                  const newSessions = await Promise.all(
                    selectedSessions.map((s) =>
                      SessionService.getSessionById(
                        s.session.id,
                        token as string
                      )
                    )
                  );
                  setActiveSessions((prev) => [
                    ...prev,
                    ...newSessions.filter(
                      (newSession) =>
                        !prev.some(
                          (s) => s.session.id === newSession.session.id
                        )
                    ),
                  ]);
                  setAddSessionPopUpVisible(false);
                  notify({
                    title: "Séances ajoutées avec succès",
                    type: "success",
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
              {currentCoachingEvents.length > 0 ? (
                currentCoachingEvents
                  .filter(
                    (e) =>
                      e.coachingEvent.isDone === false &&
                      !e.coachingEvent.coachNote
                  )
                  .map(({ eventId, coachingEvent }) => {
                    if (
                      coachingEvent.sessionId &&
                      coachingEvent.session?.label &&
                      token
                    ) {
                      return (
                        <Session
                          key={coachingEvent.id}
                          title={coachingEvent.session?.label}
                          isToDo
                          onChangeStateBtnPress={() => {
                            setSelectedCoachingEvent(eventId);
                            setEvaluateCoachingEventPopUpVisible(true);
                          }}
                          hasChangeStateBtn
                        />
                      );
                    }
                    return null;
                  })
              ) : (
                <AppText>Aucune session en cours</AppText>
              )}
              {evaluateCoachingEventPopUpVisible && (
                <Modal
                  visible={evaluateCoachingEventPopUpVisible}
                  transparent
                  onRequestClose={() =>
                    setEvaluateCoachingEventPopUpVisible(false)
                  }
                >
                  <Pressable
                    onPress={() => setEvaluateCoachingEventPopUpVisible(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <PopUp
                      onClose={() =>
                        setEvaluateCoachingEventPopUpVisible(false)
                      }
                      title="Evaluer la séance"
                      paragraph={`Comment estimeriez-vous la motivation de ${client.firstName} ${client.lastName} à cette séance ?`}
                      onSubmit={() => {
                        handleAddCommentaryToCoachingEventDone(
                          selectedCoachingEvent
                        );
                        notify({
                          title: "Evaluation ajoutée avec succès",
                          type: "success",
                        });
                        setEvaluateCoachingEventPopUpVisible(false);
                      }}
                      iconName="check"
                      btnText="Valider"
                      btnType="primary"
                      closeText="Annuler"
                      inputs={
                        <View style={{ flexDirection: "column", gap: 16 }}>
                          <Input
                            type="selector"
                            label="Note"
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
                            value={coachCommentNote}
                            onChangeText={(v) => setCoachCommentNote(v)}
                          />
                          <AppText>
                            Souhaitez-vous ajouter un commentaire
                          </AppText>
                          <Input
                            type="text"
                            label="Commentaire"
                            placeholder="douleur, fatigue, progression, ..."
                            value={coachCommentText}
                            onChangeText={(v) => setCoachCommentText(v)}
                          />
                        </View>
                      }
                    />
                  </Pressable>
                </Modal>
              )}
            </View>
          )}
        </View>
        {/* Formulaire de suivi */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>FORMULAIRE DE SUIVI</AppText>
          <View>
            <AppText style={{ fontWeight: "bold" }}>
              Mis à jour le{" "}
              {subscriptionFileOfSportsman?.updatedAt
                ? new Date(
                    subscriptionFileOfSportsman.updatedAt
                  ).toLocaleDateString()
                : "N/A"}
            </AppText>
            <Pressable
              style={[
                {
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 8,
                  justifyContent: "center",
                  paddingVertical: 8,
                  borderRadius: 4,
                },
                GlobalStyles.button_changeState,
              ]}
              onPress={() => {
                if (subscriptionFileOfSportsman?.url) {
                  Linking.openURL(subscriptionFileOfSportsman.url);
                }
              }}
            >
              <Icon
                name="link"
                fillColor="transparent"
                strokeColor={Colors.deepBlue}
                width={20}
                height={20}
              />
              <AppText style={{ color: Colors.deepBlue }}>
                {subscriptionFileOfSportsman?.url
                  ? "Voir le document"
                  : "Aucun lien de suivi renseigné."}
              </AppText>
              <View style={{ marginLeft: 8 }}>
                <Icon
                  name="chevronRight"
                  fillColor="transparent"
                  strokeColor={Colors.deepBlue}
                  width={24}
                  height={24}
                />
              </View>
            </Pressable>
          </View>
          {user.profileCategory === ProfileCategory.ADMIN && (
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="primary"
                title="Mettre à jour le lien"
                iconName="link"
                onPress={() => setChangeTrackingFileLinkPopupVisible(true)}
              />
            </View>
          )}
        </View>
        <Modal
          visible={changeTrackingFileLinkPopupVisible}
          transparent
          onRequestClose={() => setChangeTrackingFileLinkPopupVisible(false)}
        >
          <Pressable
            onPress={() => setChangeTrackingFileLinkPopupVisible(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <PopUp
              onClose={() => setChangeTrackingFileLinkPopupVisible(false)}
              title={"Editer le lien du formulaire de suivi"}
              paragraph="Renseignez ici le lien du formulaire de suivi (google docx - lien public)"
              btnType="primary"
              btnText="Valider"
              iconName="check"
              closeText="Annuler"
              inputs={
                <>
                  <Input
                    type="text"
                    label="Lien du formulaire de suivi"
                    placeholder={"https://docs.google.com/forms/d/..."}
                    value={trackingFileLink}
                    onChangeText={setTrackingFileLink}
                  />
                </>
              }
              onSubmit={handleChangeLinkTrackingFile}
            />
          </Pressable>
        </Modal>
        {graph && graph.isActive && (
          <View style={{ flexDirection: "column", gap: 16 }}>
            <ProgressGraph title={graph.title} data={progressGraphData} />
            {user.profileCategory === ProfileCategory.COACH && (
              <AppButton
                type="primary"
                title="Modifier"
                iconName="pencil"
                onPress={() => setEditGraphOfSportsmanAsCoachVisible(true)}
                buttonStyle={{ alignSelf: "flex-end" }}
              />
            )}
          </View>
        )}
        {/* Coach graph control */}
        <Modal
          visible={editGraphOfSportsmanAsCoachVisible}
          transparent
          onRequestClose={() => setEditGraphOfSportsmanAsCoachVisible(false)}
        >
          <Pressable
            onPress={() => setEditGraphOfSportsmanAsCoachVisible(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <PopUp
              onClose={() => setEditGraphOfSportsmanAsCoachVisible(false)}
              title="Changer le graphique du sportif"
              paragraph="Choisissez comment le sportif verra l'évolution de ses performances"
              btnText="Valider"
              iconName="check"
              btnType="primary"
              closeText="Annuler"
              onSubmit={() => {
                if (editGraphFormAsCoach) {
                  handleUpdateGraphAsCoach(
                    editGraphFormAsCoach.graphTitle,
                    editGraphFormAsCoach.graphMeasuredValue
                  );
                }
              }}
              inputs={
                <>
                  <Input
                    type="text"
                    label="Titre"
                    placeholder={graph?.title ? graph.title : "Evolution de..."}
                    value={editGraphFormAsCoach?.graphTitle ?? ""}
                    onChangeText={(v) =>
                      setEditGraphFormAsCoach((prev) => ({
                        graphTitle: v,
                        graphMeasuredValue: prev?.graphMeasuredValue ?? "",
                      }))
                    }
                  />
                  <Input
                    type="text"
                    label="Valeur mesurée"
                    placeholder={
                      graph?.measuredValue
                        ? graph.measuredValue
                        : "VMA, sommeil..."
                    }
                    value={editGraphFormAsCoach?.graphMeasuredValue ?? ""}
                    onChangeText={(v) =>
                      setEditGraphFormAsCoach((prev) => ({
                        graphTitle: prev?.graphTitle ?? "",
                        graphMeasuredValue: v,
                      }))
                    }
                  />
                </>
              }
            />
          </Pressable>
        </Modal>
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
            {editSubscriptionEditPopUpVisible && (
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
      const [editCompanyPopUpVisible, setEditCompanyPopUpVisible] =
        useState(false);

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
                                onBtnChangeStatePress={() => {
                                  if (token)
                                    try {
                                      billingService.updateBilling(
                                        billing.billingId,
                                        {
                                          paymentReceived: true,
                                        },
                                        token
                                      );
                                      notify({
                                        title: "Facture marquée comme payée",
                                        type: "success",
                                      });
                                    } catch (error) {
                                      notify({
                                        title:
                                          "Erreur lors de la mise à jour de la facture",
                                        type: "error",
                                      });
                                      console.log(error);
                                    }
                                }}
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
                          onPress={() =>
                            handleRemoveMedicFromSportsman(medic.id, true)
                          }
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
                            notify({
                              title: "Utilisateur archivé",
                              type: "information",
                            });
                            setArchiveUserPopupVisible(false);
                          } catch (error) {
                            notify({
                              title: "Impossible d'archiver l'utilisateur",
                              type: "error",
                            });
                            console.error(
                              "Erreur lors de l'archivage :",
                              error
                            );
                          }
                        }}
                        paragraph="Êtes-vous sûr de vouloir archiver cet utilisateur ?"
                      />
                    </Pressable>
                  </Modal>
                )}
              </View>
            </>
          );
        case "medic":
          const { medicClients, patientsLoading } = useMedicClients(
            client.id,
            token as string
          );
          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email || ""}
                  phone={client.phone || ""}
                  sport={getCategoryLabel()}
                  age={getAge(client.birthDate)}
                  profilePictureUrl={
                    client.filePicture ? client.filePicture.url : ""
                  }
                />
                {(client.facebookLink ||
                  client.instagramLink ||
                  client.linkedinLink) && (
                  <>
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
                            style={{ height: "100%" }}
                          />
                        </View>
                      )}
                    </View>
                  </>
                )}
                <AppText>
                  {client.description || "Aucune description renseignée."}
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES SPORTIFS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    {patientsLoading ? (
                      <AppText>Chargement...</AppText>
                    ) : medicClients.length > 0 ? (
                      medicClients.map((user: User) => (
                        <ItemUser key={user.id} user={user} isCompany={false} />
                      ))
                    ) : (
                      <AppText>Aucun client</AppText>
                    )}
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton
                      type="add"
                      iconName="plus"
                      onPress={() => {
                        setAddMedicToSportsmanPopUpVisible(true);
                      }}
                    />
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
                      onPress={() => setArchiveUserPopupVisible(true)}
                    />
                  </View>
                </View>
                {addMedicToSportsmanPopUpVisible && (
                  <AddContacts
                    visible={addMedicToSportsmanPopUpVisible}
                    onClose={() => setAddMedicToSportsmanPopUpVisible(false)}
                    onSubmit={async (users) => {
                      for (const user of users) {
                        console.log(user.id, client.id);
                        await addMedicToSportsman(user.id, client.id, token!);
                      }
                      setAddMedicToSportsmanPopUpVisible(false);
                    }}
                    token={token!}
                  />
                )}
              </View>
            </>
          );
        case "coach":
          const { coachClients, loading } = useCoachClients(
            client.id,
            token as string
          );
          const [coachClientsList, setCoachClientsList] =
            useState<User[]>(coachClients);

          useEffect(() => {
            setCoachClientsList(coachClients);
          }, [coachClients]);

          const addClientSportsmanToCoach = (selectedSportsman: User) => {
            if (selectedSportsman) {
              handleAddSportsmanToCoach(selectedSportsman, formData);
              setCoachClientsList((prev) => [...prev, selectedSportsman]);
              notify({
                title: "Client ajouté avec succès",
                type: "success",
              });
              setAddObjectivePopUpVisible(false);
            } else {
              notify({
                title: "Aucun sportif sélectionné",
                type: "error",
              });
            }
          };

          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email || ""}
                  phone={client.phone || ""}
                  sport={getCategoryLabel()}
                  age={getAge(client.birthDate)}
                  profilePictureUrl={
                    client.filePicture ? client.filePicture.url : ""
                  }
                />
                {(client.facebookLink ||
                  client.instagramLink ||
                  client.linkedinLink) && (
                  <>
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
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
                            source={{
                              uri: "https://reactnative.dev/img/tiny_logo.png",
                            }}
                            style={{ height: "100%" }}
                          />
                        </View>
                      )}
                    </View>
                  </>
                )}
                <AppText>
                  {client.description || "Aucune description renseignée."}
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES SPORTIFS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    {loading ? (
                      <AppText>Chargement...</AppText>
                    ) : coachClientsList.length > 0 ? (
                      coachClientsList.map((user: User) => (
                        <ItemUser key={user.id} user={user} isCompany={false} />
                      ))
                    ) : (
                      <AppText>Aucun client</AppText>
                    )}
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton
                      type="add"
                      iconName="plus"
                      onPress={() => setAddObjectivePopUpVisible(true)}
                    />
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
                      onPress={() => setArchiveUserPopupVisible(true)}
                    />
                  </View>
                </View>
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
                          if (!objectiveLoading)
                            setAddObjectivePopUpVisible(false);
                        }}
                        title="Ajouter un objectif"
                        btnType="primary"
                        btnText="Valider"
                        iconName="check"
                        closeText="Annuler"
                        onSubmit={() => {
                          if (selectedSportsman) {
                            addClientSportsmanToCoach(selectedSportsman);
                          }
                        }}
                        paragraph="Renseignez les champs ci-dessous pour ajouter un objectif à un sportif"
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
                                  handleNewObjectiveInputChange(
                                    "objectiveLabel",
                                    v
                                  )
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
                                  handleNewObjectiveInputChange(
                                    "objectiveEndDate",
                                    v
                                  )
                                }
                              />

                              <View style={{ flexDirection: "column", gap: 8 }}>
                                <AppText>
                                  Tarification complète par défaut
                                </AppText>
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
                                  formData.objectiveIsMonthly
                                    ? "XX€/mois"
                                    : "XX€"
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
                                  setSportsmanSelectorVisible(
                                    !sportsmanSelectorVisible
                                  )
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
                                {selectedSportsman ? (
                                  <AppText>
                                    {selectedSportsman.firstName}{" "}
                                    {selectedSportsman.lastName}
                                  </AppText>
                                ) : (
                                  <AppText style={{ color: Colors.grey }}>
                                    Sélectionnez un sportif à ajouter
                                  </AppText>
                                )}
                              </Pressable>
                              <AppText>
                                Le sportif sélectionné aura un nouvel objectif
                                de défini
                              </AppText>
                            </View>
                          )
                        }
                      />
                    </Pressable>
                  </Modal>
                )}
                {sportsmanSelectorVisible && (
                  <AddContacts
                    visible={sportsmanSelectorVisible}
                    onClose={() =>
                      setSportsmanSelectorVisible(!sportsmanSelectorVisible)
                    }
                    onSubmit={handleAddSportsmanSubmit}
                    token={token as string}
                  />
                )}
              </View>
            </>
          );
        case "partner":
          const { partner, company, partnerAndCompanyLoading, error } =
            usePartnerAndCompany(client.id, token!);
          const { offers, companyOffersLoading, errorCompanyOffers } =
            useCompanyOffers(company?.id, token!);

          const [newOfferType, setNewOfferType] = useState<
            OfferCategory.DISCOUNT | OfferCategory.SPONSORSHIP
          >(OfferCategory.DISCOUNT);
          const [offerForm, setOfferForm] = useState({
            title: "",
            description: "",
            conditions: "",
            startDate: "",
            endDate: "",
            discountAmount: "",
            discountLink: "",
            sponsorshipNbPersonMax: "",
            sponsorshipSportCategory: "",
          });

          const handleOfferFormChange = (field: string, value: string) => {
            setOfferForm((prev) => ({ ...prev, [field]: value }));
          };
          const handleEditNewOfferPopUp = async () => {
            try {
              await handleCreateOffer(
                company!,
                token!,
                newOfferType,
                offerForm,
                sportCategories
              );
              setEditNewOfferPopUpVisible(false);
              setOfferForm({
                title: "",
                description: "",
                conditions: "",
                startDate: "",
                endDate: "",
                discountAmount: "",
                discountLink: "",
                sponsorshipNbPersonMax: "",
                sponsorshipSportCategory: "",
              });
              // Optionally refresh offers list here
            } catch (e) {
              // Show error to user
              console.error(e);
            }
            setEditNewOfferPopUpVisible(!editNewOfferPopUpVisible);
          };

          const [companyForm, setCompanyForm] = useState({
            dateEndMembership: "",
          });

          // Sync form state when company changes
          useEffect(() => {
            if (company) {
              setCompanyForm({
                dateEndMembership: company.dateEndMembership || "",
              });
            }
          }, [company]);

          if (partnerAndCompanyLoading) return <AppText>Chargement...</AppText>;
          if (companyOffersLoading)
            return <AppText>Chargement des offres...</AppText>;
          if (error) return <AppText>{error}</AppText>;
          if (!partner) return <AppText>Partenaire introuvable</AppText>;
          if (!company) return <AppText>Entreprise introuvable</AppText>;

          return (
            <>
              <View style={{ flexDirection: "column", gap: 32 }}>
                <View style={{ flexDirection: "column", gap: 24 }}>
                  <UserCard
                    companyName={company.name}
                    companyAdress={`${company.street} ${company.postalCode} ${company.city}`}
                    profilePictureUrl={
                      company.fileImageCompany?.url || undefined
                    }
                    companyLink={company.linkWebsite}
                  />
                  <AppText>
                    Adhésion valide jusqu'au {company.dateEndMembership}
                  </AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <AppButton
                      type="primary"
                      title="Modifier"
                      iconName="pencil"
                      onPress={() => setEditCompanyPopUpVisible(true)}
                    />
                  </View>
                  {(company.linkFacebook ||
                    company.linkInstagram ||
                    company.linkLinkedin ||
                    company.linkTiktok ||
                    company.linkYoutube) && (
                    <>
                      <AppText>Réseaux sociaux entreprise</AppText>
                      <View style={{ flexDirection: "row", gap: 16 }}>
                        {company.linkFacebook && (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                        {company.linkInstagram && (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                        {company.linkLinkedin && (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                        {company.linkTiktok && (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                        {company.linkYoutube && (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                      </View>
                    </>
                  )}
                  <AppText style={GlobalStyles.h3}>REPRESENTANT</AppText>
                  <UserCard
                    detailled
                    canBeContacted
                    firstName={client.firstName}
                    lastName={client.lastName}
                    email={client.email}
                    phone={client.phone}
                    age={getAge(client.birthDate)}
                    profilePictureUrl={
                      client.filePicture ? client.filePicture.url : undefined
                    }
                  />
                  {(client.facebookLink ||
                    client.instagramLink ||
                    client.linkedinLink) && (
                    <>
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
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
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
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
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
                              source={{
                                uri: "https://reactnative.dev/img/tiny_logo.png",
                              }}
                              style={{ height: "100%" }}
                            />
                          </View>
                        )}
                      </View>
                    </>
                  )}
                  <AppText>
                    {client.description || "Aucune description renseignée."}
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
                        navigation.navigate("OffersHistory", {
                          companyId: company.id,
                        });
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    {offers.length === 0 ? (
                      <AppText>Aucune offre pour cette entreprise.</AppText>
                    ) : (
                      offers
                        .filter((o) => o.isActive)
                        .map((offer) => (
                          <OfferCard
                            key={offer.id}
                            companyName={company.name}
                            title={offer.title}
                            paragraph={offer.description}
                            companyImgUrl={company.fileImageCompany?.url || ""}
                            conditions={offer.conditions || ""}
                            startDate={new Date(offer.startDate)}
                            endDate={new Date(offer.endDate)}
                            isSponsorship={
                              offer.offerCategory === OfferCategory.SPONSORSHIP
                                ? true
                                : false
                            }
                            labelTxt={
                              offer.offerCategory === OfferCategory.DISCOUNT
                                ? `-${String(
                                    offer.discountDetails.amount
                                  ).slice(0, -3)}%`
                                : undefined
                            }
                            onPress={() => {}}
                            iconName={
                              offer.offerCategory === OfferCategory.DISCOUNT
                                ? "link"
                                : "send"
                            }
                          />
                        ))
                    )}
                    <View
                      style={{ flexDirection: "row", justifyContent: "center" }}
                    >
                      <AppButton
                        type="add"
                        iconName="plus"
                        onPress={() => setEditNewOfferPopUpVisible(true)}
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
                      onPress={() => setArchiveUserPopupVisible(true)}
                    />
                  </View>
                </View>
              </View>
              <Modal
                visible={editNewOfferPopUpVisible}
                transparent
                onRequestClose={() => setEditNewOfferPopUpVisible(false)}
                style={{ flex: 1 }}
              >
                <ScrollView>
                  <Pressable
                    onPress={() =>
                      setEditNewOfferPopUpVisible(!editNewOfferPopUpVisible)
                    }
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
                      onClose={() => setEditNewOfferPopUpVisible(false)}
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
                                  value: OfferCategory.DISCOUNT,
                                },
                                {
                                  label: "Offre de sponsoring",
                                  value: OfferCategory.SPONSORSHIP,
                                },
                              ]}
                              value={newOfferType}
                              onChangeText={(v) =>
                                setNewOfferType(v as OfferCategory)
                              }
                            />
                            {newOfferType === OfferCategory.DISCOUNT && (
                              <Input
                                type="text"
                                label="Taux de réduction"
                                placeholder="10%"
                                value={offerForm.discountAmount}
                                onChangeText={(v) =>
                                  handleOfferFormChange("discountAmount", v)
                                }
                              />
                            )}
                            {newOfferType === OfferCategory.SPONSORSHIP && (
                              <Input
                                type="selector"
                                label="Pour quelle catégorie de sport ?"
                                placeholder="Running"
                                options={sportCategories.map((cat) => ({
                                  label: cat.label,
                                  value: String(cat.id),
                                }))}
                                value={offerForm.sponsorshipSportCategory}
                                onChangeText={(v) =>
                                  handleOfferFormChange(
                                    "sponsorshipSportCategory",
                                    v
                                  )
                                }
                              />
                            )}
                          </View>
                          <View style={{ flexDirection: "column", gap: 8 }}>
                            <AppText>Détails de l'offre</AppText>
                            {newOfferType === OfferCategory.DISCOUNT && (
                              <>
                                <Input
                                  type="text"
                                  label="Libellé"
                                  placeholder="Nom du magasin, ..."
                                  value={offerForm.title}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("title", v)
                                  }
                                />
                                <Input
                                  type="textarea"
                                  label="Descritpion"
                                  placeholder="Comment fonctionne l'offre..."
                                  value={offerForm.description}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("description", v)
                                  }
                                />
                                <Input
                                  type="text"
                                  label="Conditions"
                                  placeholder="Jusqu'à quand ? Conditions d'utilistations..."
                                  value={offerForm.conditions}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("conditions", v)
                                  }
                                />
                                <Input
                                  type="text"
                                  label="Lien de l'offre"
                                  placeholder="https://www..."
                                  value={offerForm.discountLink}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("discountLink", v)
                                  }
                                />
                                <View style={{ flexDirection: "row", gap: 16 }}>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de début"
                                      placeholder="XX/XX/XXX"
                                      value={offerForm.startDate}
                                      onChangeText={(v) =>
                                        handleOfferFormChange("startDate", v)
                                      }
                                    />
                                  </View>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de fin"
                                      placeholder="XX/XX/XXX"
                                      value={offerForm.endDate}
                                      onChangeText={(v) =>
                                        handleOfferFormChange("endDate", v)
                                      }
                                    />
                                  </View>
                                </View>
                              </>
                            )}
                            {newOfferType === OfferCategory.SPONSORSHIP && (
                              <>
                                <Input
                                  type="text"
                                  label="Libellé"
                                  placeholder="Nom du contrat"
                                  value={offerForm.title}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("title", v)
                                  }
                                />
                                <Input
                                  type="textarea"
                                  label="Descritpion"
                                  placeholder="Résumé de l'offre"
                                  value={offerForm.description}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("description", v)
                                  }
                                />
                                <Input
                                  type="text"
                                  label="Conditions de l'offre"
                                  placeholder="Conditions d'utilisations, ... "
                                  value={offerForm.conditions}
                                  onChangeText={(v) =>
                                    handleOfferFormChange("conditions", v)
                                  }
                                />
                                <Input
                                  type="number"
                                  label="Nombre de personnes maximum"
                                  placeholder="10"
                                  value={offerForm.sponsorshipNbPersonMax}
                                  onChangeText={(v) =>
                                    handleOfferFormChange(
                                      "sponsorshipNbPersonMax",
                                      v
                                    )
                                  }
                                />
                                <View style={{ flexDirection: "row", gap: 16 }}>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de début"
                                      placeholder="XX/XX/XXX"
                                      value={offerForm.startDate}
                                      onChangeText={(v) =>
                                        handleOfferFormChange("startDate", v)
                                      }
                                    />
                                  </View>
                                  <View style={{ width: "48%" }}>
                                    <Input
                                      type="date"
                                      label="Date de fin"
                                      placeholder="XX/XX/XXX"
                                      value={offerForm.endDate}
                                      onChangeText={(v) =>
                                        handleOfferFormChange("endDate", v)
                                      }
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
              {editCompanyPopUpVisible && company && (
                <Modal
                  visible={editCompanyPopUpVisible}
                  transparent
                  onRequestClose={() => setEditCompanyPopUpVisible(false)}
                  style={{ flex: 1 }}
                >
                  <Pressable
                    onPress={() => setEditCompanyPopUpVisible(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <PopUp
                      title="Modifier l'entreprise"
                      paragraph={`Modifiez la date de fin d'adhésion de l'entreprise ${company.name}.`}
                      onClose={() => setEditCompanyPopUpVisible(false)}
                      closeText="Annuler"
                      onSubmit={async () => {
                        try {
                          await CompanyService.updateCompany(
                            company.id,
                            {
                              dateEndMembership: companyForm.dateEndMembership,
                            },
                            token!
                          );
                          setEditCompanyPopUpVisible(false);
                          // Optionally refresh company data here
                        } catch (e) {
                          // Handle error (show toast, etc.)
                          console.error(e);
                        }
                      }}
                      btnText="Enregistrer"
                      btnType="primary"
                      iconName="check"
                      specificBody={
                        <View style={{ flexDirection: "column", gap: 16 }}>
                          <Input
                            type="date"
                            label="Date d'expiration de l'adhésion de l'entreprise"
                            placeholder={
                              companyForm.dateEndMembership || "XX/XX/XXXX"
                            }
                            value={companyForm.dateEndMembership}
                            onChangeText={(v) =>
                              setCompanyForm((prev) => ({
                                ...prev,
                                dateEndMembership: v,
                              }))
                            }
                          />
                        </View>
                      }
                    />
                  </Pressable>
                </Modal>
              )}
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
