import React, { JSX, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import AppText from "../components/AppText";
import {
  CoachProfile,
  formatAvailableDays,
  formatAvailableTimeSlots,
  MedicProfile,
  parseAvailableDays,
  parseAvailableTimeSlots,
  ProfileCategory,
  SportsmanProfile,
} from "../models/user";
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
import AddSessions from "../components/popups/AddSession";
import * as DocumentPicker from "expo-document-picker";
import { BlurView } from "expo-blur";
import ProgressGraph from "../components/ProgressGraph";
import { LoggedUser } from "../models/auth";
import {
  getMinutesFromDuration,
  SessionService,
} from "../services/api/session-service";
import {
  CreateSessionRequest,
  Session as SessionModel,
  SessionWithFile,
} from "../models/session";
import { fileService } from "../services/api/file-service";
import { FileCategory } from "../models/file";
import { notify } from "../components/NotificationContainer";
import { UserService } from "../services/api/user-service";
import {
  getMonthsBetween,
  getOngoingMonth,
  Objective as ObjectiveModel,
} from "../models/objective";
import { ObjectivesApiService } from "../services/api/objective-service";
import { EventCategory, isCoachingEvent, parseIds } from "../models/event";
import { eventService } from "../services/api/event-service";
import { exerciseService } from "../services/api/exercise-service";
import { Category, CategoryType } from "../models/category";
import { getSessionExercisesAndStats } from "../utils/session-utils";
import {
  getCurrentMonthIndex,
  getDynamicMonthLabels,
  Graph,
} from "../models/graph";
import { GraphService } from "../services/api/graph-service";
import { useKpis } from "../hooks/useKpis";
import { ExerciseWithDetails } from "../models/exercise";
import { categoryService } from "../services/api/category-service";
import { FileUploadButton } from "../components/FileUploadButton";

export default function SessionsScreen() {
  const { user, token } = useAuth();

  type SessionPageRenderer = (user: LoggedUser) => JSX.Element;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "SessionDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const [sessionForm, setSessionForm] = useState({
    label: "",
    filePictureUrl: "",
    recommendations: "",
    contributions: "",
  });

  const [sessionEditionLoading, setSessionEditionLoading] = useState(false);
  const [sessionsComplete, setSessions] = useState<SessionWithFile[]>([]);

  const [editSessionPopUp, setEditSessionPopUp] = useState(false);

  const closeModal = () => setEditSessionPopUp(!editSessionPopUp);

  const handleSessionFormChange = (field: string, value: any) => {
    setSessionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSessionSubmit = async () => {
    setSessionEditionLoading(true);
    if (token && user && sessionForm) {
      const newSessionImageFile =
        sessionForm.filePictureUrl !== ""
          ? await fileService.createFile(
              {
                label: `${sessionForm.label.toLowerCase().trim()}-image`,
                url: sessionForm.filePictureUrl,
                fileCategory: FileCategory.IMAGE,
              },
              token
            )
          : { id: undefined };

      const baseData: CreateSessionRequest = {
        label: sessionForm.label,
        numberOfExercises: 1,
        durationTime: "00:01:00",
        filePictureId: newSessionImageFile.id,
        authorId: user.id,
        listExercises: "0;",
        recommendations: sessionForm.recommendations,
        contributions: sessionForm.contributions,
      };

      try {
        await SessionService.createSession(baseData, token).then(
          async (res) => {
            setSessions((prev) => [
              ...prev,
              { session: res.session, filePicture: null },
            ]);
            notify({ title: "Séance créée avec succès", type: "success" });
            if (
              user.profileCategory === ProfileCategory.COACH ||
              user.profileCategory === ProfileCategory.MEDIC
            ) {
              await SessionService.addSessionToUser(
                user.id,
                res.session.id,
                token
              );
            }
          }
        );
        setEditSessionPopUp(false);
      } catch (error) {
        notify({
          title: "Erreur lors de la création de la séance",
          type: "error",
        });
        console.log("Error while trying to create session : ", error);
      } finally {
        setSessionEditionLoading(false);
        closeModal();
      }
    }
  };

  const [sportsmanProfile, setSportsmanProfile] = useState<SportsmanProfile>();
  const [changeDispoPopUpVisible, setChangeDispoPopUpVisible] = useState(false);
  const [dispoForm, setDispoForm] = useState({
    days: [] as string[],
    times: [] as string[],
  });
  const [dispoLoading, setDispoLoading] = useState(false);

  // Helper arrays for options
  const DAYS_OPTIONS = [
    { label: "Lundi", value: "monday" },
    { label: "Mardi", value: "tuesday" },
    { label: "Mercredi", value: "wednesday" },
    { label: "Jeudi", value: "thursday" },
    { label: "Vendredi", value: "friday" },
    { label: "Samedi", value: "saturday" },
    { label: "Dimanche", value: "sunday" },
  ];
  const TIME_OPTIONS = [
    { label: "07:00 - 10:00", value: "0" },
    { label: "10:00 - 13:00", value: "1" },
    { label: "13:00 - 16:00", value: "2" },
    { label: "16:00 - 19:00", value: "3" },
    { label: "19:00 - 22:00", value: "4" },
  ];

  // Fetch sportsman profile on mount or after update
  async function fetchProfile() {
    if (user && token) {
      const completeProfile = await UserService.getUserById(user.id, token);
      setSportsmanProfile(completeProfile.profile as SportsmanProfile);
      // Pre-fill form with current values
      const daysParsed = parseAvailableDays(
        (completeProfile.profile as SportsmanProfile)?.availableDays
      );
      setDispoForm({
        days: DAYS_OPTIONS.filter(
          (d) => daysParsed[d.value as keyof typeof daysParsed]
        ).map((d) => d.value),
        times: parseAvailableTimeSlots(
          (completeProfile.profile as SportsmanProfile).availableTime
        )
          .map((selected, idx) => (selected ? String(idx) : null))
          .filter(Boolean) as string[],
      });
    }
  }
  useEffect(() => {
    fetchProfile();
  }, [user, token, changeDispoPopUpVisible]); // re-fetch when popup closes

  // Handlers for form
  const handleDispoChange = (field: "days" | "times", values: string[]) => {
    setDispoForm((prev) => ({ ...prev, [field]: values }));
  };

  // Submit handler
  const handleDispoSubmit = async () => {
    if (user && token) {
      setDispoLoading(true);
      // Convert days to binary string
      const daysBinary = DAYS_OPTIONS.map((d) =>
        dispoForm.days.includes(d.value) ? "1" : "0"
      ).join("");
      // Convert times to binary string
      const timesBinary = TIME_OPTIONS.map((_, idx) =>
        dispoForm.times.includes(String(idx)) ? "1" : "0"
      ).join("");
      try {
        await UserService.updateSportsman(
          user.id,
          {
            availableDays: daysBinary,
            availableTime: timesBinary,
          },
          token
        );
        notify({
          title: "Disponibilitées mises à jours",
          type: "success",
        });
        fetchProfile();
        setChangeDispoPopUpVisible(false);
        // The useEffect will re-fetch and refresh the profile
      } catch (e) {
        notify({ title: "Erreur lors de la mise à jour", type: "error" });
      } finally {
        setDispoLoading(false);
      }
    }
  };

  const SessionPageByProfile: Record<string, SessionPageRenderer> = {
    sportsman: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      const [evaluateSessionPopUpVisible, setEvaluateSessionPopUpVisible] =
        useState(false);
      const [addValueToGraphPopUpVisible, setAddValueToGraphPopUpVisible] =
        useState(false);
      const [value, setValue] = useState("");

      const [sportsmanInfoLoading, setSportsmanInfoLoading] = useState(false);
      const [currentObjectives, setCurrentObjectives] = useState<
        ObjectiveModel[]
      >([]);

      const [nextCoachingEvents, setNextCoachingEvents] = useState<any[]>([]);

      const [selectedEventId, setSelectedEventId] = useState<number | null>(
        null
      );
      const [note, setNote] = useState<string>("");
      const [comment, setComment] = useState<string>("");
      const [submitLoading, setSubmitLoading] = useState(false);

      const [allSportsmanSessions, setAllSporstmanSessions] = useState<
        SessionWithFile[]
      >([]);
      const [allInactivesSportsmanSessions, setAllInactivesSporstmanSessions] =
        useState<SessionModel[]>([]);

      const [archivedSessionsStats, setArchivedSessionsStats] = useState<
        { session: SessionModel; nbExercises: number; durationTime: number }[]
      >([]);
      const [sessionsWithMuscleGroups, setSessionsWithMuscleGroups] = useState<
        { session: SessionModel; muscleGroups: Category[] }[]
      >([]);
      const [activeSessionsStats, setActiveSessionsStats] = useState<
        { session: SessionModel; nbExercises: number; durationTime: number }[]
      >([]);
      const [sessionsWithoutExercises, setSessionsWithoutExercises] = useState<
        SessionModel[]
      >([]);

      const [graph, setGraph] = useState<Graph | null>(null);
      const [progressGraphData, setProgressGraphData] = useState<
        { month: string; value: number }[]
      >([]);

      const { kpis, kpisLoading, kpisError } = useKpis(
        user?.profileCategory as ProfileCategory,
        token!
      );

      const handleEvaluateSessionSubmit = async () => {
        if (!note) {
          notify({
            title: "Merci de donner une note à la séance.",
            type: "error",
          });
          return;
        }
        if (!selectedEventId || !user || !token) return;
        setSubmitLoading(true);
        try {
          await eventService.updateEvent(
            selectedEventId,
            {
              isDone: true,
              sportsmanNote: note,
              sportsmanComment: comment,
            },
            token
          );
          notify({ title: "Séance évaluée avec succès", type: "success" });
          setEvaluateSessionPopUpVisible(false);
          setNote("");
          setComment("");
          setSelectedEventId(null);
          fetchNextCoachingEvents();
        } catch (e) {
          notify({ title: "Erreur lors de l'évaluation", type: "error" });
        } finally {
          setSubmitLoading(false);
        }
      };

      async function fetchNextCoachingEvents() {
        if (!user || !token) return;
        try {
          // Fetch all coaching events
          const { events } = await eventService.getEventsByCategory(
            EventCategory.COACHING,
            token
          );

          // Filter events where the sportsman is in personOngoingIds
          const filtered = events
            .filter(isCoachingEvent)
            .filter((ev) => {
              const ids = parseIds(ev.personOngoingIds);
              return ids.includes(user.id);
            })
            // Only future events (date in the future)
            .filter((ev) => {
              if (!ev.date) return false;
              return new Date(ev.date) >= new Date();
            })
            // Sort by date ascending
            .sort(
              (a, b) =>
                new Date(a.date!).getTime() - new Date(b.date!).getTime()
            );

          setNextCoachingEvents(filtered);
        } catch (e) {
          setNextCoachingEvents([]);
        }
      }

      async function fetchSportsmanSessions() {
        if (!user || !token) return;
        try {
          const linkedSessions = await SessionService.getSessionsByUser(
            user.id,
            token
          );
          linkedSessions.map(async (ls) => {
            const completeSessions = await SessionService.getSessionById(
              ls.sessionId,
              token
            );
            if (completeSessions.session.isActive) {
              setAllSporstmanSessions((prev) => [...prev, completeSessions]);
            } else {
              setAllInactivesSporstmanSessions((prev) => [
                ...prev,
                completeSessions.session,
              ]);
            }
          });
        } catch (e) {
          console.log("Error while fetching sportsman sessions", e);
        }
      }

      async function fetchSporstmanGraph() {
        const graphValues = await GraphService.getGraphsByUserId(
          user.id,
          token!
        );
        setGraph(graphValues[0] || null);
        const graph = graphValues.find((g) => g.isActive) || graphValues[0];
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
            const [index, value] = entry.split(":").map((s) => s.trim());
            return {
              index: Number(index),
              month: monthLabels[idx],
              value: Number(value),
            };
          });
          setProgressGraphData(data);
          setProgressGraphData(data);
        } else {
          setProgressGraphData([]);
        }
      }

      const handleAddValueToGraph = async () => {
        if (!graph || !token) return;
        const numericValue = Number(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
          notify({
            title: "Veuillez entrer une valeur entre 0 et 100.",
            type: "error",
          });
          return;
        }

        // Parse existing entries
        const entries = graph.listMonthlyValue
          .split(";")
          .map((entry) => entry.trim())
          .filter(Boolean);

        // Build a map of index -> value
        const indexValueMap: Record<number, number> = {};
        entries.forEach((entry) => {
          const [index, val] = entry.split(":").map((s) => s.trim());
          if (index && val) indexValueMap[Number(index)] = Number(val);
        });

        // Compute the current month index
        const currentMonthIndex = getCurrentMonthIndex(graph.startDate);

        // Add or update the value for the current month
        indexValueMap[currentMonthIndex] = numericValue;

        // Rebuild the listMonthlyValue string
        const newListMonthlyValue = Object.entries(indexValueMap)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([index, val]) => `${index}: ${val}; `)
          .join("; ");

        try {
          await GraphService.updateGraph(
            graph.id,
            { listMonthlyValue: newListMonthlyValue },
            token
          );
          notify({ title: "Mesure ajoutée avec succès", type: "success" });
          setAddValueToGraphPopUpVisible(false);
          setValue("");
          fetchSporstmanGraph();
        } catch (e) {
          notify({
            title: "Erreur lors de l'ajout de la mesure",
            type: "error",
          });
        }
      };

      useEffect(() => {
        setSportsmanInfoLoading(true);
        async function fetchObjectives() {
          const objectives =
            await ObjectivesApiService.getObjectivesBySportsman(
              user.id,
              token as string
            );
          setCurrentObjectives(objectives);
        }
        try {
          fetchObjectives();
          fetchNextCoachingEvents();
          fetchSportsmanSessions();
          fetchSporstmanGraph();

          setSportsmanInfoLoading(false);
        } catch (e) {
          console.log("Error while fetching user infos", e);
        }
      }, [user, token]);

      useEffect(() => {
        if (!allSportsmanSessions.length || !token) return;
        let isMounted = true;

        async function fetchSessionsData() {
          if (!token) return;

          // Séparer les sessions avec et sans exercices
          const sessionsWithExercises = allSportsmanSessions.filter(
            (s) =>
              s.session.listExercises && s.session.listExercises.trim() !== ""
          );
          const sessionsWithoutExercises = allSportsmanSessions.filter(
            (s) =>
              !s.session.listExercises || s.session.listExercises.trim() === ""
          );

          // Stocker les sessions sans exercices
          if (isMounted)
            setSessionsWithoutExercises(
              sessionsWithoutExercises.map((s) => s.session)
            );

          // Traiter les sessions avec exercices
          const muscleGroupsResult: {
            session: SessionModel;
            muscleGroups: Category[];
          }[] = [];
          const statsResult: {
            session: SessionModel;
            nbExercises: number;
            durationTime: number;
          }[] = [];

          for (const completeSession of sessionsWithExercises) {
            // Get exercises for this session
            const exercisesResp = await SessionService.getExercisesBySessionId(
              completeSession.session.id,
              token
            );
            const exercises = exercisesResp.exercises || [];

            // Fetch all muscle groups for all exercises in parallel
            const allMuscleGroups = await Promise.all(
              exercises.map(async (ex) => {
                const mgResp = await exerciseService.getMuscleGroupsForExercise(
                  ex.id,
                  token
                );
                return mgResp.muscleGroups || [];
              })
            );

            // Flatten and deduplicate muscle groups
            const flatMuscleGroups = allMuscleGroups.flat();
            const uniqueMuscleGroups = flatMuscleGroups.filter(
              (mg, idx, arr) => arr.findIndex((m) => m.id === mg.id) === idx
            );

            muscleGroupsResult.push({
              session: completeSession.session,
              muscleGroups: uniqueMuscleGroups,
            });

            // Calculer les stats pour cette session
            const stats = await getSessionExercisesAndStats(
              completeSession.session,
              token
            );
            statsResult.push({
              session: completeSession.session,
              nbExercises: stats.nbExercises,
              durationTime: stats.durationTime,
            });
          }

          if (isMounted) {
            setSessionsWithMuscleGroups(muscleGroupsResult);
            setActiveSessionsStats(statsResult);
          }
        }

        fetchSessionsData();

        return () => {
          isMounted = false;
        };
      }, [allSportsmanSessions, token]);

      useEffect(() => {
        if (!allInactivesSportsmanSessions.length || !token) return;

        let isMounted = true;

        async function fetchStats() {
          const result = await Promise.all(
            allInactivesSportsmanSessions.map(async (session) => {
              const stats = await getSessionExercisesAndStats(session, token!);
              return {
                session,
                nbExercises: stats.nbExercises,
                durationTime: stats.durationTime,
              };
            })
          );
          if (isMounted) setArchivedSessionsStats(result);
        }

        fetchStats();
        return () => {
          isMounted = false;
        };
      }, [allInactivesSportsmanSessions, token]);

      // Fonction pour obtenir les groupes musculaires d'une session
      const getMuscleGroupsForSession = (sessionId: number) => {
        return (
          sessionsWithMuscleGroups.find((s) => s.session.id === sessionId)
            ?.muscleGroups || []
        );
      };

      // Fonction pour obtenir les stats d'une session
      const getStatsForSession = (sessionId: number) => {
        return activeSessionsStats.find((s) => s.session.id === sessionId);
      };

      const renderAllSessions = () => {
        return allSportsmanSessions.map((completeSession) => {
          const hasExercises =
            completeSession.session.listExercises &&
            completeSession.session.listExercises.trim() !== "";

          if (hasExercises) {
            // Session avec exercices - afficher avec stats et groupes musculaires
            const stats = getStatsForSession(completeSession.session.id);
            const muscleGroups = getMuscleGroupsForSession(
              completeSession.session.id
            );

            return (
              <Session
                key={completeSession.session.id}
                title={completeSession.session.label}
                nbExercises={
                  stats?.nbExercises === 0 ? undefined : stats?.nbExercises
                }
                imageUrl={
                  completeSession.filePicture
                    ? completeSession.filePicture.url
                    : ""
                }
                durationTime={
                  stats && !isNaN(stats.durationTime)
                    ? stats.durationTime
                    : undefined
                }
                onPress={() =>
                  navigation.navigate("SessionDetail", {
                    session: completeSession.session,
                  })
                }
                labels={
                  muscleGroups.length > 0
                    ? muscleGroups.map((mg) => (
                        <Label
                          key={mg.id}
                          title={mg.label}
                          textColor={mg.textColor}
                          backgroundColor={mg.backgroundColor}
                          size="small"
                        />
                      ))
                    : undefined
                }
              />
            );
          } else {
            // Session sans exercices - afficher simplement
            return (
              <Session
                key={completeSession.session.id}
                title={completeSession.session.label}
                onPress={() =>
                  navigation.navigate("SessionDetail", {
                    session: completeSession.session,
                  })
                }
                // Pas de nbExercises, durationTime, ni labels
              />
            );
          }
        });
      };

      const handleDispoPopUpVisibility = () =>
        setChangeDispoPopUpVisible(!changeDispoPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Planning
        <View key="planning" style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16, paddingBottom: 32 }}>
            <View>
              <AppText style={{ fontWeight: "bold" }}>
                Vos disponibilités
              </AppText>
              <AppText>
                {`Le ${formatAvailableDays(
                  parseAvailableDays(
                    (sportsmanProfile as SportsmanProfile)?.availableDays
                  )
                )}${
                  (sportsmanProfile as SportsmanProfile)?.availableTime
                    ? `, de ${formatAvailableTimeSlots(
                        (sportsmanProfile as SportsmanProfile)?.availableTime
                      )}`
                    : ""
                }.`}
              </AppText>
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
          <View style={{ flexDirection: "column", gap: 16, paddingBottom: 32 }}>
            <AppText style={GlobalStyles.h3}>SEANCES A FAIRE</AppText>
            {nextCoachingEvents.length === 0 ? (
              <AppText>Aucune séance à venir.</AppText>
            ) : (
              nextCoachingEvents.map((ev) => (
                <Session
                  key={ev.id}
                  title={ev.title || "Séance de coaching"}
                  nbExercises={
                    ev.specificEvent?.session?.numberOfExercises || 0
                  }
                  durationTime={
                    ev.specificEvent?.session?.durationTime
                      ? getMinutesFromDuration(
                          ev.specificEvent.session.durationTime
                        )
                      : 0
                  }
                  coachFirstName={ev.responsibleIds ? "Coach" : undefined}
                  location={ev.location || undefined}
                  date={ev.date ? new Date(ev.date) : undefined}
                  isToDo={!ev.specificEvent?.isDone}
                  isDone={ev.specificEvent?.isDone}
                  hasChangeStateBtn
                  onChangeStateBtnPress={() => {
                    setSelectedEventId(ev.id);
                    setEvaluateSessionPopUpVisible(true);
                  }}
                />
              ))
            )}
          </View>
        </View>,

        // Tab 1 : Mes séances
        <View key="seances" style={{ flexDirection: "column", gap: 24 }}>
          <AppButton
            type="linkSmall"
            title="Voir l'hsitorique"
            iconName="eye"
            onPress={() => navigation.navigate("SessionHistory")}
            buttonStyle={{ alignSelf: "flex-end" }}
          />
          <View
            style={{
              flexDirection: "column",
              gap: 16,
              paddingBottom: 32,
            }}
          >
            {renderAllSessions()}
          </View>
        </View>,

        // Tab 2 : Performances
        <View key="performances" style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View>
              {graph && graph.isActive && (
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <ProgressGraph title={graph.title} data={progressGraphData} />
                  {(() => {
                    // Compute the current month index
                    const currentMonthIndex = getCurrentMonthIndex(
                      graph.startDate
                    );
                    // Check if a value exists for the current month
                    const hasCurrentMonthValue = progressGraphData.some(
                      (point, idx) => {
                        // Try to get the index from the entry string if available
                        // Fallback: idx is the order in the array, which matches the month index if data is ordered
                        const entry = graph.listMonthlyValue
                          .split(";")
                          .map((e) => e.trim())
                          .filter(Boolean)[idx];
                        const entryIndex = entry
                          ? Number(entry.split(":")[0].trim())
                          : idx;
                        return entryIndex === currentMonthIndex;
                      }
                    );
                    if (!hasCurrentMonthValue) {
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                          }}
                        >
                          <AppButton
                            type="primary"
                            title="Ajouter une mesure"
                            iconName="plus"
                            onPress={() =>
                              setAddValueToGraphPopUpVisible(
                                !addValueToGraphPopUpVisible
                              )
                            }
                          />
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              )}
            </View>
            <AppText style={GlobalStyles.h3}>VOTRE RESUME</AppText>
            <View style={{ flexDirection: "column", gap: 8 }}>
              {kpisLoading && <ActivityIndicator />}
              {kpisError && (
                <AppText style={{ color: Colors.red }}>{kpisError}</AppText>
              )}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {kpis.length > 0 &&
                  kpis.map((kpi, index) => (
                    <View style={{ flex: 1 }} key={`view-${index}`}>
                      <Kpi
                        key={index}
                        title={kpi.title}
                        iconName={kpi.iconName}
                        value={kpi.value}
                        unit={kpi.unit}
                        fillIcon={kpi.fillIcon}
                      />
                    </View>
                  ))}
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 16, paddingBottom: 32 }}>
            <AppText style={GlobalStyles.h3}>SEANCES ARCHIVEES</AppText>
            <View style={{ flexDirection: "column", gap: 8 }}>
              {archivedSessionsStats.length === 0 ? (
                <AppText>Aucune séance archivée.</AppText>
              ) : (
                archivedSessionsStats.map(
                  ({ session, nbExercises, durationTime }) => (
                    <Session
                      key={session.id}
                      title={session.label}
                      nbExercises={nbExercises}
                      durationTime={durationTime}
                      hideIcon
                    />
                  )
                )
              )}
            </View>
          </View>
        </View>,
      ];

      return (
        <>
          {sportsmanInfoLoading ? (
            <ActivityIndicator />
          ) : (
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
                  <AppText style={GlobalStyles.h3}>
                    {currentObjectives.length > 1 ? "OBJECTIFS" : "OBJECTIF"}
                  </AppText>
                  {currentObjectives &&
                    currentObjectives.length > 0 &&
                    currentObjectives.map((objective) => (
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
                    ))}
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
                      onClose={() => setChangeDispoPopUpVisible(false)}
                      title="Changer mes disponibilités"
                      paragraph="Définissez ici vos disponibilités"
                      btnText={dispoLoading ? "Enregistrement..." : "Valider"}
                      iconName="check"
                      btnType="primary"
                      onSubmit={handleDispoSubmit}
                      closeText="Annuler"
                      inputs={[
                        <Input
                          key="jours-dispo"
                          type="multiSelector"
                          label="Jours disponibles"
                          placeholder="Tous les jours"
                          options={DAYS_OPTIONS}
                          value={dispoForm.days}
                          onChangeText={(selected: string[] | string) =>
                            handleDispoChange(
                              "days",
                              Array.isArray(selected)
                                ? selected
                                : (selected as string).split(",")
                            )
                          }
                        />,
                        <Input
                          key="creneaux-dispo"
                          type="multiSelector"
                          label="Créneaux horaires"
                          placeholder="Sélectionnez un créneau"
                          options={TIME_OPTIONS}
                          value={dispoForm.times}
                          onChangeText={(selected: string[] | string) =>
                            handleDispoChange(
                              "times",
                              Array.isArray(selected)
                                ? selected
                                : (selected as string).split(",")
                            )
                          }
                        />,
                      ]}
                    />
                  </Pressable>
                </Pressable>
              </Modal>
              <Modal
                visible={evaluateSessionPopUpVisible}
                transparent={true}
                onRequestClose={() => {
                  setEvaluateSessionPopUpVisible(false);
                  setNote("");
                  setComment("");
                  setSelectedEventId(null);
                }}
              >
                <Pressable
                  onPress={() => {
                    setEvaluateSessionPopUpVisible(false);
                    setNote("");
                    setComment("");
                    setSelectedEventId(null);
                  }}
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
                      onClose={() => {
                        setEvaluateSessionPopUpVisible(false);
                        setNote("");
                        setComment("");
                        setSelectedEventId(null);
                      }}
                      title="Evaluer la séance"
                      paragraph="Comment estimeriez-vous votre motivation à cette séance ?"
                      btnText={submitLoading ? "Enregistrement..." : "Valider"}
                      iconName="check"
                      btnType="primary"
                      onSubmit={handleEvaluateSessionSubmit}
                      closeText="Annuler"
                      inputs={[
                        <Input
                          key="note"
                          type="selector"
                          label="Note"
                          placeholder="5"
                          options={[
                            { label: "1", value: "1" },
                            { label: "2", value: "2" },
                            { label: "3", value: "3" },
                            { label: "4", value: "4" },
                            { label: "5", value: "5" },
                          ]}
                          value={note}
                          onChangeText={setNote}
                        />,
                      ]}
                      specificBody={
                        <>
                          <AppText>
                            Souhaitez-vous ajouter un commentaire ?
                          </AppText>
                          <Input
                            type="textarea"
                            label="Commentaire"
                            placeholder="douleur, fatigue, progression..."
                            value={comment}
                            onChangeText={setComment}
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
                onRequestClose={() => setAddValueToGraphPopUpVisible(false)}
              >
                <Pressable
                  onPress={() => setAddValueToGraphPopUpVisible(false)}
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
                      onClose={() => {
                        setAddValueToGraphPopUpVisible(false);
                        setValue("");
                      }}
                      title="Ajouter une mesure"
                      paragraph="Indiquez ici une nouvelle mesure pour votre graph sur “Evolution de la VMA”"
                      btnText="Enregistrer"
                      iconName="pencil"
                      btnType="primary"
                      onSubmit={handleAddValueToGraph}
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
          )}
        </>
      );
    },
    coach: (user) => {
      type ModalStep = "selector" | "catalog" | "custom" | "import";

      const [modalStep, setModalStep] = useState<ModalStep | null>(null);
      const [allExercises, setAllExercises] = useState<ExerciseWithDetails[]>(
        []
      );
      const [allCategories, setAllCategories] = useState<Category[]>([]);
      const [completeUserProfile, setCompleteUserProfile] =
        useState<CoachProfile>();

      const [loading, setLoading] = useState(true);

      const { token } = useAuth();

      const closeModal = () => setModalStep(null);

      const [catalogSessions, setCatalogSessions] = useState<SessionWithFile[]>(
        []
      );

      useEffect(() => {
        let isMounted = true;
        async function fetchSessionsAndCatalog() {
          setLoading(true);
          try {
            // Fetch both in parallel
            const [allLinkedSessions, allCatalogSessions] = await Promise.all([
              SessionService.getSessionsByUser(user.id, token!),
              SessionService.getAllSessions(token!),
            ]);

            // Fetch full session details for linked sessions
            const linkedSessionsDetails = await Promise.all(
              allLinkedSessions.map(async (linkedSession) => {
                const sessionWithFile = await SessionService.getSessionById(
                  linkedSession.sessionId,
                  token!
                );
                return sessionWithFile;
              })
            );

            // Fetch file for each catalog session to build SessionWithFile[]
            const catalogSessionsWithFiles = await Promise.all(
              allCatalogSessions.map(async (session) => {
                let filePicture: any = null;
                if (session.filePictureId) {
                  try {
                    filePicture = await fileService.getFileById(
                      session.filePictureId,
                      token!
                    );
                  } catch {
                    filePicture = null;
                  }
                }
                return {
                  session,
                  filePicture,
                };
              })
            );

            if (isMounted) {
              setSessions(linkedSessionsDetails); // Coach's own sessions
              setCatalogSessions(catalogSessionsWithFiles); // All catalog sessions with files
            }
          } catch (e) {
            if (isMounted) {
              setSessions([]);
              setCatalogSessions([]);
            }
          } finally {
            if (isMounted) setLoading(false);
          }
        }
        async function fetchUserProfile() {
          if (token) {
            try {
              const profileConnected = await UserService.getUserById(
                user.id,
                token
              );
              if (isMounted)
                setCompleteUserProfile(
                  profileConnected.profile as CoachProfile
                );
            } catch (error) {
              console.error(
                "Erreur lors de la récupération du profil :",
                error
              );
            }
          }
        }
        fetchSessionsAndCatalog();
        fetchUserProfile();
        return () => {
          isMounted = false;
        };
      }, [token]);
      useEffect(() => {
        let isMounted = true;
        async function fetchExercisesAndCategories() {
          try {
            const [exercises, categories] = await Promise.all([
              exerciseService.getAllExercises(token!),
              categoryService.getCategoriesByType(
                CategoryType.MUSCLE_GROUP,
                token!
              ),
            ]);
            if (isMounted) {
              setAllExercises(exercises);
              setAllCategories(categories);
            }
          } catch (e) {
            if (isMounted) {
              setAllExercises([]);
              setAllCategories([]);
            }
          }
        }
        fetchExercisesAndCategories();
        return () => {
          isMounted = false;
        };
      }, [token]);

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
              {loading ? (
                <ActivityIndicator size="large" color={Colors.deepBlue} />
              ) : (
                <ScrollView
                  style={{
                    maxHeight: Platform.OS === "web" ? 325 : 250,
                  }}
                >
                  {sessionsComplete.length > 0 ? (
                    sessionsComplete
                      .filter((s) => s.session.isActive)
                      .map((completeSession, index) => (
                        <View key={index} style={{ marginTop: 16 }}>
                          <Session
                            key={completeSession.session.id}
                            title={completeSession.session.label}
                            imageUrl={
                              completeSession.filePicture &&
                              completeSession.filePicture.fileCategory ===
                                FileCategory.IMAGE
                                ? completeSession.filePicture.url
                                : undefined
                            }
                            isImportedFile={
                              completeSession.filePicture &&
                              completeSession.filePicture.fileCategory ===
                                FileCategory.SESSION_IMPORTED
                                ? true
                                : false
                            }
                            onPress={() => {
                              navigation.navigate("SessionDetail", {
                                session: completeSession.session,
                              });
                            }}
                          />
                        </View>
                      ))
                  ) : (
                    <AppText>Aucune séance trouvée.</AppText>
                  )}
                </ScrollView>
              )}
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
                        {completeUserProfile?.canImportSessions && (
                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <AppText>
                              Vous pouvez aussi importer un programme depuis
                              votre appareil (format PDF) :
                            </AppText>
                            <View style={{ alignSelf: "center" }}>
                              <FileUploadButton
                                fileCategory={FileCategory.SESSION_IMPORTED}
                                label="Importer une session"
                                authToken={token!}
                                authUser={user}
                                onUploadSuccess={(file, newSession) => {
                                  setSessions((prev) => [
                                    ...prev,
                                    {
                                      session: newSession.session,
                                      filePicture: file,
                                    },
                                  ]);
                                  closeModal();
                                }}
                                onUploadError={(error) => {
                                  console.error("Erreur:", error);
                                  closeModal();
                                }}
                              />
                            </View>
                          </View>
                        )}
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
                    listOfSession={catalogSessions}
                    onClose={closeModal}
                    onSubmit={(completeSession) => {
                      completeSession.map(async (sessionWithFile) => {
                        await SessionService.addSessionToUser(
                          user.id,
                          sessionWithFile.session.id,
                          token!
                        );
                      });
                      setSessions((prev) => [...prev, ...completeSession]);
                      closeModal();
                    }}
                    exercises={allExercises}
                    categories={allCategories}
                  />
                )}

                {modalStep === "custom" && (
                  <PopUp
                    title="Editer une séance"
                    paragraph="Créez une nouvelle séance d'entrainement pour un sportif en remplissant les champs ci-dessous."
                    btnText="Editer"
                    iconName="pencil"
                    closeText="Annuler"
                    onSubmit={() => {
                      handleEditSessionSubmit();
                      setEditSessionPopUp(false);
                    }}
                    btnType="primary"
                    inputs={
                      sessionEditionLoading ? (
                        <ActivityIndicator />
                      ) : (
                        <>
                          <Input
                            type="text"
                            placeholder="Nom du plan d'entrainement"
                            label="Label"
                            value={sessionForm.label}
                            onChangeText={(v) =>
                              handleSessionFormChange("label", v)
                            }
                          />
                          <Input
                            type="text"
                            placeholder="https://"
                            label="Lien image"
                            value={sessionForm.filePictureUrl}
                            onChangeText={(v) =>
                              handleSessionFormChange("filePictureUrl", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder="Conseils, mises en garde..."
                            label="Recommandations"
                            value={sessionForm.recommendations}
                            onChangeText={(v) =>
                              handleSessionFormChange("recommendations", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder="Apports et intérêts du programme"
                            label="Contributions"
                            value={sessionForm.contributions}
                            onChangeText={(v) =>
                              handleSessionFormChange("contributions", v)
                            }
                          />
                        </>
                      )
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
      type ModalStep = "selector" | "catalog" | "custom" | "import";

      const [modalStep, setModalStep] = useState<ModalStep | null>(null);

      const [completeUserProfile, setCompleteUserProfile] =
        useState<MedicProfile>();

      const [loading, setLoading] = useState(true);

      const { token } = useAuth();

      const closeModal = () => setModalStep(null);

      const [catalogSessions, setCatalogSessions] = useState<SessionWithFile[]>(
        []
      );

      useEffect(() => {
        let isMounted = true;
        async function fetchSessionsAndCatalog() {
          setLoading(true);
          try {
            // Fetch both in parallel
            const [allLinkedSessions, allCatalogSessions] = await Promise.all([
              SessionService.getSessionsByUser(user.id, token!),
              SessionService.getAllSessions(token!),
            ]);

            // Fetch full session details for linked sessions
            const linkedSessionsDetails = await Promise.all(
              allLinkedSessions.map(async (linkedSession) => {
                const sessionWithFile = await SessionService.getSessionById(
                  linkedSession.sessionId,
                  token!
                );
                return sessionWithFile;
              })
            );

            // Fetch file for each catalog session to build SessionWithFile[]
            const catalogSessionsWithFiles = await Promise.all(
              allCatalogSessions.map(async (session) => {
                let filePicture: any = null;
                if (session.filePictureId) {
                  try {
                    filePicture = await fileService.getFileById(
                      session.filePictureId,
                      token!
                    );
                  } catch {
                    filePicture = null;
                  }
                }
                return {
                  session,
                  filePicture,
                };
              })
            );

            if (isMounted) {
              setSessions(linkedSessionsDetails); // Coach's own sessions
              setCatalogSessions(catalogSessionsWithFiles); // All catalog sessions with files
            }
          } catch (e) {
            if (isMounted) {
              setSessions([]);
              setCatalogSessions([]);
            }
          } finally {
            if (isMounted) setLoading(false);
          }
        }
        async function fetchUserProfile() {
          if (token) {
            try {
              const profileConnected = await UserService.getUserById(
                user.id,
                token
              );
              if (isMounted)
                setCompleteUserProfile(
                  profileConnected.profile as MedicProfile
                );
            } catch (error) {
              console.error(
                "Erreur lors de la récupération du profil :",
                error
              );
            }
          }
        }
        fetchSessionsAndCatalog();
        fetchUserProfile();
        return () => {
          isMounted = false;
        };
      }, [token]);

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
              {loading ? (
                <ActivityIndicator size="large" color={Colors.deepBlue} />
              ) : (
                <ScrollView
                  style={{
                    maxHeight: Platform.OS === "web" ? 325 : 250,
                  }}
                >
                  {sessionsComplete.length > 0 ? (
                    sessionsComplete
                      .filter((s) => s.session.isActive)
                      .map((completeSession, index) => (
                        <View key={index} style={{ marginTop: 16 }}>
                          <Session
                            key={completeSession.session.id}
                            title={completeSession.session.label}
                            imageUrl={
                              completeSession.filePicture &&
                              completeSession.filePicture.fileCategory ===
                                FileCategory.IMAGE
                                ? completeSession.filePicture.url
                                : undefined
                            }
                            isImportedFile={
                              completeSession.filePicture &&
                              completeSession.filePicture.fileCategory ===
                                FileCategory.SESSION_IMPORTED
                                ? true
                                : false
                            }
                            onPress={() => {
                              navigation.navigate("SessionDetail", {
                                session: completeSession.session,
                              });
                            }}
                          />
                        </View>
                      ))
                  ) : (
                    <AppText>Aucune séance trouvée.</AppText>
                  )}
                </ScrollView>
              )}
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
                        {completeUserProfile?.canImportSessions && (
                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <AppText>
                              Vous pouvez aussi importer un programme depuis
                              votre appareil (format PDF) :
                            </AppText>
                            <View style={{ alignSelf: "center" }}>
                              <FileUploadButton
                                fileCategory={FileCategory.SESSION_IMPORTED}
                                label="Importer une session"
                                authToken={token!}
                                authUser={user}
                                onUploadSuccess={(file, newSession) => {
                                  setSessions((prev) => [
                                    ...prev,
                                    {
                                      session: newSession.session,
                                      filePicture: file,
                                    },
                                  ]);
                                  closeModal();
                                }}
                                onUploadError={(error) => {
                                  console.error("Erreur:", error);
                                  closeModal();
                                }}
                              />
                            </View>
                          </View>
                        )}
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
                    listOfSession={catalogSessions}
                    onClose={closeModal}
                    onSubmit={(completeSession) => {
                      completeSession.map(async (sessionWithFile) => {
                        await SessionService.addSessionToUser(
                          user.id,
                          sessionWithFile.session.id,
                          token!
                        );
                      });
                      setSessions((prev) => [...prev, ...completeSession]);
                      closeModal();
                    }}
                    exercises={[]}
                    categories={[]}
                  />
                )}

                {modalStep === "custom" && (
                  <PopUp
                    title="Editer une séance"
                    paragraph="Créez une nouvelle séance d'entrainement pour un sportif en remplissant les champs ci-dessous."
                    btnText="Editer"
                    iconName="pencil"
                    closeText="Annuler"
                    onSubmit={() => {
                      handleEditSessionSubmit();
                      setEditSessionPopUp(false);
                    }}
                    btnType="primary"
                    inputs={
                      sessionEditionLoading ? (
                        <ActivityIndicator />
                      ) : (
                        <>
                          <Input
                            type="text"
                            placeholder="Nom du plan d'entrainement"
                            label="Label"
                            value={sessionForm.label}
                            onChangeText={(v) =>
                              handleSessionFormChange("label", v)
                            }
                          />
                          <Input
                            type="text"
                            placeholder="https://"
                            label="Lien image"
                            value={sessionForm.filePictureUrl}
                            onChangeText={(v) =>
                              handleSessionFormChange("filePictureUrl", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder="Conseils, mises en garde..."
                            label="Recommandations"
                            value={sessionForm.recommendations}
                            onChangeText={(v) =>
                              handleSessionFormChange("recommendations", v)
                            }
                          />
                          <Input
                            type="textarea"
                            placeholder="Apports et intérêts du programme"
                            label="Contributions"
                            value={sessionForm.contributions}
                            onChangeText={(v) =>
                              handleSessionFormChange("contributions", v)
                            }
                          />
                        </>
                      )
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
                title="Entrainement course à pieds"
                nbExercises={3}
                durationTime={40}
                labels={[
                  <Label
                    key={"lower-limbs"}
                    title="Membres inférieurs"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"body"}
                    title="Tronc"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                ]}
              />
              <Session
                title="Séance de musculation corps entier maison"
                nbExercises={5}
                durationTime={30}
                labels={[
                  <Label
                    key={"lower-limbs"}
                    title="Membres inférieurs"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"body"}
                    title="Tronc"
                    textColor="#1E3A8A"
                    backgroundColor="#D6EBFF"
                    size="small"
                  />,
                  <Label
                    key={"upper-limbs"}
                    title="Membres supérieurs"
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
      const [loading, setLoading] = useState(true);
      const [filter, setFilter] = useState("");

      useEffect(() => {
        let isMounted = true;
        async function fetchSessions() {
          setLoading(true);
          try {
            const all = await SessionService.getAllSessions(token!);
            if (isMounted)
              setSessions(
                all.map((session) => ({
                  session,
                  filePicture: session.filePicture ?? null,
                }))
              );
          } catch (e) {
            if (isMounted) setSessions([]);
          } finally {
            if (isMounted) setLoading(false);
          }
        }
        fetchSessions();
        return () => {
          isMounted = false;
        };
      }, [token]);

      // Filter sessions by label (case-insensitive)
      const filteredSessions = sessionsComplete.filter((s) =>
        s.session.label.toLowerCase().includes(filter.toLowerCase())
      );

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
              <Input
                type="text"
                label="Filtrer par nom de séance"
                placeholder="Nom de la séance..."
                value={filter}
                onChangeText={setFilter}
              />
              {loading ? (
                <ActivityIndicator size="large" />
              ) : (
                <ScrollView style={{ maxHeight: 250 }}>
                  {filteredSessions.length === 0 ? (
                    <AppText>Aucune séance trouvée.</AppText>
                  ) : (
                    filteredSessions.map((completeSession) => {
                      return (
                        <View
                          style={{ marginBottom: 8 }}
                          key={completeSession.session.id}
                        >
                          <Session
                            key={completeSession.session.id}
                            title={completeSession.session.label}
                            imageUrl={
                              completeSession.filePicture
                                ? completeSession.filePicture.url
                                : undefined
                            }
                            labels={[]}
                            onPress={() => {
                              navigation.navigate("SessionDetail", {
                                session: completeSession.session,
                              });
                            }}
                          />
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              )}
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
                  onSubmit={() => {
                    handleEditSessionSubmit();
                    setEditSessionPopUp(false);
                  }}
                  btnType="primary"
                  inputs={
                    sessionEditionLoading ? (
                      <ActivityIndicator />
                    ) : (
                      <>
                        <Input
                          type="text"
                          placeholder="Nom du plan d'entrainement"
                          label="Label"
                          value={sessionForm.label}
                          onChangeText={(v) =>
                            handleSessionFormChange("label", v)
                          }
                        />
                        <Input
                          type="text"
                          placeholder="https://"
                          label="Lien image"
                          value={sessionForm.filePictureUrl}
                          onChangeText={(v) =>
                            handleSessionFormChange("filePictureUrl", v)
                          }
                        />
                        <Input
                          type="textarea"
                          placeholder="Conseils, mises en garde..."
                          label="Recommandations"
                          value={sessionForm.recommendations}
                          onChangeText={(v) =>
                            handleSessionFormChange("recommendations", v)
                          }
                        />
                        <Input
                          type="textarea"
                          placeholder="Apports et intérêts du programme"
                          label="Contributions"
                          value={sessionForm.contributions}
                          onChangeText={(v) =>
                            handleSessionFormChange("contributions", v)
                          }
                        />
                      </>
                    )
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

  // const { user } = useAuth();

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
