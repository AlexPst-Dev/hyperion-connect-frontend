import React, { JSX, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "../components/AppText";
import { LoggedUser } from "../models/auth";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import Label from "../components/Label";
import Event from "../components/Event";
import Session from "../components/Session";
import Kpi from "../components/Kpi";
import ItemClient from "../components/ItemClient";
import Objective from "../components/Objective";
import { ProfileCategory, SportsmanProfile, User } from "../models/user";
import {
  getNotificationsByCategory,
  updateNotification,
} from "../services/api/notification-service";
import { NotificationCategory, Notification } from "../models/notification";
import Input from "../components/Input";
import PopUp from "../components/PopUp";
import {
  EventCategory,
  EventCompleteResponse,
  parseIds,
} from "../models/event";
import { eventService } from "../services/api/event-service";
import { UserService } from "../services/api/user-service";
import DisplayEvent from "../components/popups/DisplayEvent";
import { notify } from "../components/NotificationContainer";
import { KpiModel, useKpis } from "../hooks/useKpis";
import { useCoachClients } from "../hooks/useCoachClients";
import {
  getMonthsBetween,
  getOngoingMonth,
  Objective as ObjectiveModel,
} from "../models/objective";
import { ObjectivesApiService } from "../services/api/objective-service";
import { useMedicClients } from "../hooks/useMedicClients";
import {
  getMinutesFromDuration,
  SessionService,
} from "../services/api/session-service";
import { Session as SessionModel } from "../models/session";

export default function HomeScreen() {
  const tempCoachUser: User = {
    id: 1,
    firstName: "Alex",
    lastName: "Martin",
    profileCategory: ProfileCategory.COACH,
    email: "alex.martin@mail.com",
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
  };
  const tempAdminUser: User = {
    id: 2,
    firstName: "k",
    lastName: "Marchegay",
    profileCategory: ProfileCategory.ADMIN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
    email: "chloé.marchegay@mail.com",
  };

  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);

  const [editNewsVisible, setEditNewsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  /*
   * Fetching the next event for admin profile
   */
  const [userEvents, setUserEvents] = useState<EventCompleteResponse[]>([]);
  const [closestEvent, setClosestEvent] =
    useState<EventCompleteResponse | null>(null);
  const [eventUsers, setEventUsers] = useState<User[]>([]);
  const [eventPopupVisible, setEventPopupVisible] = useState(false);

  const { user, token } = useAuth();
  const { kpis, kpisLoading, kpisError } = useKpis(
    user?.profileCategory as ProfileCategory,
    token!
  );

  const { coachClients } = useCoachClients(user?.id!, token as string);
  const { medicClients } = useMedicClients(user?.id!, token as string);

  const [lastClientsObjectives, setLastClientsObjectives] = useState<
    { client: User; objectives: ObjectiveModel[] }[]
  >([]);

  const [lastSession, setLastSession] = useState<SessionModel | null>(null);

  // Fetch last session only for sportsman
  useEffect(() => {
    const fetchLastSession = async () => {
      if (!user || !token || user.profileCategory !== "sportsman") return;
      try {
        const linkedSessions = await SessionService.getSessionsByUser(
          user.id,
          token
        );
        if (linkedSessions.length > 0) {
          const lastLinked = linkedSessions[linkedSessions.length - 1];
          const sessionWithFile = await SessionService.getSessionById(
            lastLinked.sessionId,
            token
          );
          setLastSession(sessionWithFile.session);
        } else {
          setLastSession(null);
        }
      } catch (error) {
        console.error("Error fetching last session:", error);
        setLastSession(null);
      }
    };
    fetchLastSession();
  }, [user, token]);

  // Fetch the latest notification
  useEffect(() => {
    if (!token) return;
    async function fetchNotification() {
      try {
        const notifications = await getNotificationsByCategory(
          NotificationCategory.NEWS,
          token as string
        );
        if (notifications && notifications.length > 0) {
          setNotification(notifications[notifications.length - 1]);
          setNewsTitle(notifications[notifications.length - 1].title || "");
          setNewsText(notifications[notifications.length - 1].text || "");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotification();
  }, [token]);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchEventsAndUsers() {
      try {
        if (!user) return;
        const { events } = await eventService.getEventsByUserId(
          user.id as number,
          token as string
        );
        setUserEvents(events);

        // Find the closest event
        const now = new Date();
        const sorted = events
          .filter((e) => e.date && new Date(e.date) >= now)
          .sort(
            (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
          );
        const closest = sorted[0] || null;
        setClosestEvent(closest);

        // Fetch event users if closest event exists
        if (closest && token) {
          let idsToParse: string = "";
          if (
            closest.eventCategory === EventCategory.HYPERION ||
            closest.eventCategory === EventCategory.HYPERLINK
          ) {
            idsToParse = closest.responsibleIds as string;
          } else {
            idsToParse = closest.personOngoingIds as string;
          }
          if (idsToParse) {
            let ids = parseIds(idsToParse);
            // Ensure ids is always an array
            if (!Array.isArray(ids)) {
              ids = [ids];
            }
            let users: User[] = [];
            if (ids.length > 0) {
              users = await Promise.all(
                ids.map((id) =>
                  UserService.getUserById(id, token).then((res) => res.user)
                )
              );
            }
            setEventUsers(users);
          } else {
            setEventUsers([]);
          }
        } else {
          setEventUsers([]);
        }
      } catch (error) {
        console.error("Error fetching events or users:", error);
        setEventUsers([]);
      }
    }

    fetchEventsAndUsers();
  }, [user, token]);

  useEffect(() => {
    let isMounted = true;
    async function fetchObjectives() {
      if (!coachClients || coachClients.length === 0 || !token) {
        if (isMounted) setLastClientsObjectives([]);
        return;
      }
      const lastTwo = coachClients.slice(-2);
      const data = await Promise.all(
        lastTwo.map(async (client) => {
          const objectives =
            await ObjectivesApiService.getObjectivesBySportsman(
              client.id,
              token
            );
          return { client, objectives };
        })
      );
      if (isMounted) setLastClientsObjectives(data);
    }
    fetchObjectives();
    return () => {
      isMounted = false;
    };
  }, [coachClients, token]);
  useEffect(() => {
    let isMounted = true;
    async function fetchObjectives() {
      if (!medicClients || medicClients.length === 0 || !token) {
        if (isMounted) setLastClientsObjectives([]);
        return;
      }
      const lastTwo = medicClients.slice(-2);
      const data = await Promise.all(
        lastTwo.map(async (client) => {
          const objectives =
            await ObjectivesApiService.getObjectivesBySportsman(
              client.id,
              token
            );
          return { client, objectives };
        })
      );
      if (isMounted) setLastClientsObjectives(data);
    }
    fetchObjectives();
    return () => {
      isMounted = false;
    };
  }, [medicClients, token]);

  if (!user || !token) {
    return (
      <View style={GlobalStyles.pageStyle}>
        <AppText style={GlobalStyles.h3}>Veuillez vous connecter</AppText>
      </View>
    );
  }

  // Function to update the latest notification
  const handleUpdateNotification = async (title: string, text: string) => {
    if (!notification || !token) return;
    try {
      await updateNotification(
        notification.id, // Use the id of the latest notification
        {
          title,
          text,
          notificationCategory: NotificationCategory.NEWS,
        },
        token
      );
      // Optionally, refetch or update local state
      setNotification({
        ...notification,
        title,
        text,
      });
      setNewsTitle(title);
      setNewsText(text);
      setEditNewsVisible(false);
      notify({ title: "Section mise à jour avec succès", type: "success" });
    } catch (error) {
      notify({
        title: "Une erreur est survenue lors de la modification",
        type: "error",
      });
      console.error("Error updating notification:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator color={Colors.orange} />;
  }

  type HomePageRenderer = (user: LoggedUser) => JSX.Element;

  function BlurredSessionWrapper({ children }: { children: React.ReactNode }) {
    return (
      <View
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        {children}
        <BlurView intensity={64} tint="light" style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  const HomePageByProfile: Record<string, HomePageRenderer> = {
    sportsman: (user) => {
      const refreshClosestEvent = async () => {
        if (!closestEvent || !token) return;
        try {
          const { event } = await eventService.getEventById(
            closestEvent.id,
            token
          );
          setClosestEvent(event); // This will trigger a re-render and update DisplayEvent
        } catch (error) {
          console.error("Error refreshing event:", error);
        }
      };

      return (
        <View style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOTRE PROGRAMME DU JOUR</AppText>
              <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
            </View>
            {lastSession ? (
              <Session
                title={lastSession.label}
                durationTime={getMinutesFromDuration(lastSession.durationTime)}
                nbExercises={lastSession.numberOfExercises}
                imageUrl={
                  lastSession.filePicture
                    ? lastSession.filePicture.url
                    : undefined
                }
              />
            ) : (
              <AppText>Aucune séance trouvée.</AppText>
            )}
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOTRE PROCHAIN RDV</AppText>
              <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
            </View>
            {closestEvent && (
              <>
                <Event
                  title={closestEvent.title || "Événement"}
                  type={closestEvent.eventCategory as EventCategory}
                  personsInvolved={eventUsers}
                  location={closestEvent.location || ""}
                  date={
                    closestEvent.date ? new Date(closestEvent.date) : new Date()
                  }
                  hour={closestEvent.time || ""}
                  isInPerson={true}
                  infoDescription={closestEvent.description || ""}
                  onPress={() => setEventPopupVisible(true)}
                />
                {eventPopupVisible && (
                  <DisplayEvent
                    visible={eventPopupVisible}
                    event={closestEvent}
                    hyperlinkProps={
                      closestEvent.eventCategory === EventCategory.HYPERLINK
                        ? closestEvent.specificEvent
                        : undefined
                    }
                    userConnected={user}
                    token={token as string}
                    listOfUser={eventUsers}
                    onClose={() => setEventPopupVisible(false)}
                    onSubmit={refreshClosestEvent}
                  />
                )}
              </>
            )}
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <AppText style={{ fontWeight: "bold" }}>
              {notification?.title}
            </AppText>
            <AppText>{notification?.text}</AppText>
          </View>
        </View>
      );
    },
    coach: (user) => {
      const refreshClosestEvent = async () => {
        if (!closestEvent || !token) return;
        try {
          const { event } = await eventService.getEventById(
            closestEvent.id,
            token
          );
          console.log(event);
          setClosestEvent(event); // This will trigger a re-render and update DisplayEvent
        } catch (error) {
          console.error("Error refreshing event:", error);
        }
      };

      return (
        <View style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText>Votre résumé</AppText>
            {kpisError && (
              <AppText style={{ color: Colors.red }}>
                Indicateurs indisponibles pour le moment
              </AppText>
            )}
            {kpisLoading && <ActivityIndicator />}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
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
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOS SPORTIFS</AppText>
              <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
            </View>
            <View style={{ flexDirection: "column", gap: 8 }}>
              {coachClients.length === 0 ? (
                <AppText>Aucun sportif suivi actuellement.</AppText>
              ) : (
                lastClientsObjectives.map(({ client, objectives }) => (
                  <ItemClient
                    key={client.id}
                    user={client}
                    objectives={
                      objectives.length > 0 ? (
                        <Objective
                          duration={getMonthsBetween(
                            objectives.slice(-1)[0].startDate,
                            objectives.slice(-1)[0].endDate
                          )}
                          onGoingNumber={getOngoingMonth(
                            objectives.slice(-1)[0].startDate,
                            objectives.slice(-1)[0].endDate
                          )}
                          label={objectives.slice(-1)[0].label}
                        />
                      ) : (
                        <AppText>Aucun objectif en cours</AppText>
                      )
                    }
                  />
                ))
              )}
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOTRE PROCHAINE SÉANCE</AppText>
              <AppButton
                type="linkSmall"
                title="Voir planning"
                iconName="eye"
              />
            </View>
            {closestEvent ? (
              <>
                <Event
                  title={closestEvent.title || "Événement"}
                  type={closestEvent.eventCategory as EventCategory}
                  personsInvolved={eventUsers}
                  location={closestEvent.location || ""}
                  date={
                    closestEvent.date ? new Date(closestEvent.date) : new Date()
                  }
                  hour={closestEvent.time || ""}
                  isInPerson={true}
                  infoDescription={closestEvent.description || ""}
                  onPress={() => setEventPopupVisible(true)}
                />
                {eventPopupVisible && (
                  <DisplayEvent
                    visible={eventPopupVisible}
                    event={closestEvent}
                    hyperlinkProps={
                      closestEvent.eventCategory === EventCategory.HYPERLINK
                        ? closestEvent.specificEvent
                        : undefined
                    }
                    userConnected={user}
                    token={token as string}
                    listOfUser={eventUsers}
                    onClose={() => setEventPopupVisible(false)}
                    onSubmit={refreshClosestEvent}
                  />
                )}
              </>
            ) : (
              <AppText>Aucun événement à venir.</AppText>
            )}
          </View>
        </View>
      );
    },
    medic: (user) => {
      const refreshClosestEvent = async () => {
        if (!closestEvent || !token) return;
        try {
          const { event } = await eventService.getEventById(
            closestEvent.id,
            token
          );
          console.log(event);
          setClosestEvent(event); // This will trigger a re-render and update DisplayEvent
        } catch (error) {
          console.error("Error refreshing event:", error);
        }
      };
      return (
        <View style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText>Votre résumé</AppText>
            {kpisError && (
              <AppText style={{ color: Colors.red }}>
                Indicateurs indisponibles pour le moment
              </AppText>
            )}
            {kpisLoading && <ActivityIndicator />}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
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
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOS SPORTIFS</AppText>
              <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
            </View>
            <View style={{ flexDirection: "column", gap: 8 }}>
              {medicClients.length === 0 ? (
                <AppText>Aucun sportif suivi actuellement.</AppText>
              ) : (
                lastClientsObjectives.map(({ client, objectives }) => (
                  <ItemClient
                    key={client.id}
                    user={client}
                    objectives={
                      objectives.length > 0 ? (
                        <Objective
                          duration={getMonthsBetween(
                            objectives.slice(-1)[0].startDate,
                            objectives.slice(-1)[0].endDate
                          )}
                          onGoingNumber={getOngoingMonth(
                            objectives.slice(-1)[0].startDate,
                            objectives.slice(-1)[0].endDate
                          )}
                          label={objectives.slice(-1)[0].label}
                        />
                      ) : (
                        <AppText>Aucun objectif en cours</AppText>
                      )
                    }
                  />
                ))
              )}
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>VOTRE PROCHAIN RDV</AppText>
              <AppButton
                type="linkSmall"
                title="Voir planning"
                iconName="eye"
              />
            </View>
            {closestEvent ? (
              <>
                <Event
                  title={closestEvent.title || "Événement"}
                  type={closestEvent.eventCategory as EventCategory}
                  personsInvolved={eventUsers}
                  location={closestEvent.location || ""}
                  date={
                    closestEvent.date ? new Date(closestEvent.date) : new Date()
                  }
                  hour={closestEvent.time || ""}
                  isInPerson={true}
                  infoDescription={closestEvent.description || ""}
                  onPress={() => setEventPopupVisible(true)}
                />
                {eventPopupVisible && (
                  <DisplayEvent
                    visible={eventPopupVisible}
                    event={closestEvent}
                    hyperlinkProps={
                      closestEvent.eventCategory === EventCategory.HYPERLINK
                        ? closestEvent.specificEvent
                        : undefined
                    }
                    userConnected={user}
                    token={token as string}
                    listOfUser={eventUsers}
                    onClose={() => setEventPopupVisible(false)}
                    onSubmit={refreshClosestEvent}
                  />
                )}
              </>
            ) : (
              <AppText>Aucun événement à venir.</AppText>
            )}
          </View>
        </View>
      );
    },
    free: (user) => (
      <View style={{ flexDirection: "column", gap: 24 }}>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText style={GlobalStyles.h3}>PROCHAIN ÉVÉNEMENT</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <Event
            title="Évenement Hyperion Vannes"
            type={EventCategory.HYPERION}
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-05-08")}
            hour="16h00"
            isInPerson
            infoDescription="Lorem ipsum dolore sit amet"
          />
        </View>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText style={[GlobalStyles.h3, { maxWidth: "70%" }]}>
              PLANS DE PERFORMANCES À LA UNE
            </AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View
            style={{ flexDirection: "column", gap: 8, position: "relative" }}
          >
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
        <View style={{ flexDirection: "column", gap: 8 }}>
          <AppText style={{ fontWeight: "bold" }}>
            {notification?.title}
          </AppText>
          <AppText>{notification?.text}</AppText>
        </View>
      </View>
    ),
    partner: (user) => (
      <View style={{ flexDirection: "column", gap: 24 }}>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText style={GlobalStyles.h3}>PROCHAINS ÉVÉNEMENTS</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Event
              title="Evenement Hyperlink Vannes"
              type={EventCategory.HYPERLINK}
              personsInvolved={tempAdminUser}
              location="Parc de Vannes"
              date={new Date("2025-05-17")}
              hour="14h00"
              isInPerson
              infoDescription="Lorem ipsum dolore sit amet"
              theme="Soirée de lancement"
            />
            <Event
              title="Evenement Hyperion Vannes"
              type={EventCategory.HYPERION}
              personsInvolved={tempAdminUser}
              location="Parc de Vannes"
              date={new Date("2025-05-23")}
              hour="15h00"
              isInPerson
              infoDescription="Lorem ipsum dolore sit amet"
            />
          </View>
        </View>
      </View>
    ),
    admin: (user) => {
      const refreshClosestEvent = async () => {
        if (!closestEvent || !token) return;
        try {
          const { event } = await eventService.getEventById(
            closestEvent.id,
            token
          );
          setClosestEvent(event); // This will trigger a re-render and update DisplayEvent
        } catch (error) {
          console.error("Error refreshing event:", error);
        }
      };

      return (
        <View style={{ flexDirection: "column", gap: 24 }}>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText style={GlobalStyles.h3}>PROCHAIN ÉVÉNEMENT</AppText>
              <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
            </View>
            {closestEvent && (
              <>
                <Event
                  title={closestEvent.title || "Événement"}
                  type={closestEvent.eventCategory as EventCategory}
                  personsInvolved={eventUsers}
                  location={closestEvent.location || ""}
                  date={
                    closestEvent.date ? new Date(closestEvent.date) : new Date()
                  }
                  hour={closestEvent.time || ""}
                  isInPerson={true}
                  infoDescription={closestEvent.description || ""}
                  onPress={() => setEventPopupVisible(true)}
                />
                {eventPopupVisible && (
                  <DisplayEvent
                    visible={eventPopupVisible}
                    event={closestEvent}
                    hyperlinkProps={
                      closestEvent.eventCategory === EventCategory.HYPERLINK
                        ? closestEvent.specificEvent
                        : undefined
                    }
                    userConnected={user}
                    token={token as string}
                    listOfUser={eventUsers}
                    onClose={() => setEventPopupVisible(false)}
                    onSubmit={refreshClosestEvent}
                  />
                )}
              </>
            )}
          </View>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText>
              Retrouvez ici les statistiques globales de l'application.
            </AppText>
            {kpisLoading && <ActivityIndicator />}
            {kpisError && (
              <AppText style={{ color: Colors.red }}>{kpisError}</AppText>
            )}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
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
          <View style={{ flexDirection: "column", gap: 8 }}>
            <AppText style={{ fontWeight: "bold" }}>
              {notification?.title}
            </AppText>
            <AppText>{notification?.text}</AppText>
            <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
              <AppButton
                type="primary"
                title="Modifier"
                iconName="pencil"
                onPress={() => setEditNewsVisible(true)}
              />
            </View>
          </View>
        </View>
      );
    },
  };

  const RenderProfileComponents = HomePageByProfile[user.profileCategory];

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
        {user.profileCategory === "admin" && (
          <Modal
            visible={editNewsVisible}
            transparent
            onRequestClose={() => setEditNewsVisible(!editNewsVisible)}
          >
            <Pressable
              onPress={() => setEditNewsVisible(!editNewsVisible)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                title="Editer la notification"
                onClose={() => setEditNewsVisible(!editNewsVisible)}
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Titre"
                      placeholder={newsTitle || "ex : A la une"}
                      value={newsTitle}
                      onChangeText={setNewsTitle}
                    />
                    <Input
                      type="textarea"
                      label="Message"
                      placeholder={newsText || "Contenu du message"}
                      value={newsText}
                      onChangeText={setNewsText}
                    />
                  </>
                }
                onSubmit={() => handleUpdateNotification(newsTitle, newsText)}
                btnText="Modifier"
                iconName="pencil"
                btnType="primary"
                closeText="Annuler"
              />
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
