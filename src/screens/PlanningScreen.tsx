import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "../components/AppText";
import Event from "../components/Event";
import { ProfileCategory, User } from "../models/user";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/AppButton";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import AddContacts from "../components/popups/AddContacts";
import DisplayEvent from "../components/popups/DisplayEvent";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { RootStackParamList } from "../navigation/types";
import ViewController from "../components/ViewController";
import { LoggedUser } from "../models/auth";
import {
  Event as EventModel,
  EventCategory,
  EventWithHyperlinkResponse,
  EventCompleteResponse,
  EventWithSportingActivityResponse,
} from "../models/event";
import { eventService } from "../services/api/event-service";
import {
  useEventPersons,
  useEventsByCategories,
} from "../hooks/useEventsByCategories";
import EditEvent from "../components/popups/EditEvent";

export default function PlanningScreen() {
  type PlanningPageRenderer = (user: LoggedUser) => JSX.Element;
  const { token, user } = useAuth();

  const tempAdminUser: User = {
    id: 1,
    firstName: "Chloé",
    lastName: "Marchegay",
    email: "chloe.marchegay@hyperion.com",
    profileCategory: ProfileCategory.ADMIN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
  };

  const PlanningPageByProfile: Record<string, PlanningPageRenderer> = {
    sportsman: (user) => <></>,
    coach: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      type NavigationProp = NativeStackNavigationProp<
        RootStackParamList,
        "PlanningHistory"
      >;
      const navigation = useNavigation<NavigationProp>();

      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const [eventSelected, setEventSelected] = useState<EventModel>();
      const [personOnGoingOfSelectedEvent, setPersonOnGoingOfSelectedEvent] =
        useState<any[]>([]);
      const [eventDetailsPopUpVisible, setEventDetailsPopUpVisible] =
        useState(false);

      const [events, setEvents] = useState<EventCompleteResponse[] | null>(
        null
      );
      const { eventsByCategory, eventsByCategoriesLoading, error } =
        useEventsByCategories(
          [EventCategory.COACHING, EventCategory.HYPERION],
          token!
        );

      const allPersonIds = useMemo(() => {
        const coachingEvents = eventsByCategory[EventCategory.COACHING] || [];
        const allIds = coachingEvents
          .map((event) => event.personOngoingIds)
          .filter(Boolean)
          .join(";");
        return allIds;
      }, [eventsByCategory]);

      const { users: allUsers } = useEventPersons(allPersonIds, token!);

      const usersMap = useMemo(() => {
        const map = new Map();
        allUsers.forEach((user) => {
          map.set(user.id.toString(), user);
        });
        return map;
      }, [allUsers]);

      const getUsersForEvent = (ids: string | null) => {
        if (!ids) return [];

        return ids
          .split("; ")
          .filter(Boolean)
          .map((id) => usersMap.get(id))
          .filter(Boolean);
      };

      async function fetchEventsByCategory(category: EventCategory) {
        if (token) {
          switch (category) {
            case EventCategory.COACHING:
              setEvents(
                eventsByCategory[EventCategory.COACHING].filter(
                  (e) =>
                    (e.responsibleIds || "")
                      .split(";")
                      .map((id) => id.trim())
                      .includes(user.id.toString()) &&
                    (!e.date ||
                      new Date(e.date).setHours(0, 0, 0, 0) >=
                        new Date().setHours(0, 0, 0, 0))
                )
              );
            case EventCategory.HYPERION:
              setEvents(
                eventsByCategory[EventCategory.HYPERION].filter(
                  (e) =>
                    !e.date ||
                    new Date(e.date).setHours(0, 0, 0, 0) >=
                      new Date().setHours(0, 0, 0, 0)
                )
              );
            default:
              setEvents([]);
          }
        }
      }

      useEffect(() => {
        fetchEventsByCategory(EventCategory.COACHING);
      }, [token]);

      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Coaching Events
        <View key="meetings" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS RENDEZ-VOUS</AppText>
          <AppText>
            Préparez-vous pour vos prochains rendez-vous sportifs.
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton
              type="linkNormal"
              title="Voir historique"
              iconName="eye"
              onPress={() => {
                navigation.navigate("PlanningHistory");
              }}
            />
          </View>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : eventsByCategory[EventCategory.COACHING] &&
            eventsByCategory[EventCategory.COACHING].length > 0 ? (
            eventsByCategory[EventCategory.COACHING]
              .filter(
                (e) =>
                  (e.responsibleIds || "")
                    .split(";")
                    .map((id) => id.trim())
                    .includes(user.id.toString()) &&
                  (!e.date ||
                    new Date(e.date).setHours(0, 0, 0, 0) >=
                      new Date().setHours(0, 0, 0, 0))
              )
              .map((e) => {
                const personsInvolved = getUsersForEvent(e.personOngoingIds);

                return (
                  <Event
                    key={e.id}
                    title={e.title ? e.title : "Séance"}
                    personsInvolved={personsInvolved}
                    location={e.location || ""}
                    date={new Date(e.date || "")}
                    isInPerson
                    hour={e.time || ""}
                    type={EventCategory.COACHING}
                    onPress={() => {
                      setEventSelected(e);
                      setPersonOnGoingOfSelectedEvent(personsInvolved);
                      setEventDetailsPopUpVisible(true);
                    }}
                  />
                );
              })
          ) : (
            <AppText>Aucune séance n'est prévue actuellement</AppText>
          )}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={handleEditEventModal}
            />
          </View>
        </View>,

        // Tab 1 : Company Events
        <View key="events" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS EVENEMENTS</AppText>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : eventsByCategory[EventCategory.HYPERION] &&
            eventsByCategory[EventCategory.HYPERION].length > 0 ? (
            eventsByCategory[EventCategory.HYPERION]
              .filter(
                (e) =>
                  !e.date ||
                  new Date(e.date).setHours(0, 0, 0, 0) >=
                    new Date().setHours(0, 0, 0, 0)
              )
              .map((e) => {
                const personsInvolved = getUsersForEvent(e.responsibleIds);

                return (
                  <Event
                    key={e.id}
                    title={e.title ? e.title : "Evénement"}
                    personsInvolved={personsInvolved}
                    location={e.location || ""}
                    date={new Date(e.date || "")}
                    hour={e.time || ""}
                    type={EventCategory.HYPERION}
                    onPress={() => {
                      setEventSelected(e);
                      setPersonOnGoingOfSelectedEvent(personsInvolved);
                      setEventDetailsPopUpVisible(true);
                    }}
                  />
                );
              })
          ) : (
            <AppText>Aucun événement n'est prévu actuellement</AppText>
          )}
        </View>,
      ];

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <ViewController
              tabs={[
                { title: "Seances", icon: "dumbell" },
                { title: "Evenements", icon: "calendar" },
              ]}
              onTabChange={setActiveTabIndex}
            />
            {tabViews[activeTabIndex]}
          </View>
          {editEventPopUpVisible && token && (
            <EditEvent
              visible={editEventPopUpVisible}
              token={token}
              onClose={() => setEditEventPopUpVisible(false)}
              title={"Créer une nouvelle séance"}
              eventType={EventCategory.COACHING}
            />
          )}
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
            />
          )}
          {eventDetailsPopUpVisible && eventSelected && (
            <DisplayEvent
              visible={eventDetailsPopUpVisible}
              event={eventSelected}
              userConnected={user}
              listOfUser={personOnGoingOfSelectedEvent}
              onClose={() => {
                setEventDetailsPopUpVisible(false);
              }}
              token={token!}
            />
          )}
        </>
      );
    },
    medic: (user) => {
      const [activeTabIndex, setActiveTabIndex] = useState(0);
      type NavigationProp = NativeStackNavigationProp<
        RootStackParamList,
        "PlanningHistory"
      >;
      const navigation = useNavigation<NavigationProp>();

      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const [eventSelected, setEventSelected] = useState<EventModel>();
      const [personOnGoingOfSelectedEvent, setPersonOnGoingOfSelectedEvent] =
        useState<any[]>([]);
      const [eventDetailsPopUpVisible, setEventDetailsPopUpVisible] =
        useState(false);

      const [events, setEvents] = useState<EventCompleteResponse[] | null>(
        null
      );
      const { eventsByCategory, eventsByCategoriesLoading, error } =
        useEventsByCategories(
          [
            EventCategory.MEDICAL,
            EventCategory.HYPERION,
            EventCategory.HYPERLINK,
          ],
          token!
        );

      const allPersonIds = useMemo(() => {
        const medicEvents = eventsByCategory[EventCategory.MEDICAL] || [];
        const allIds = medicEvents
          .map((event) => event.personOngoingIds)
          .filter(Boolean)
          .join(";");
        return allIds;
      }, [eventsByCategory]);

      const { users: allUsers } = useEventPersons(allPersonIds, token!);

      const usersMap = useMemo(() => {
        const map = new Map();
        allUsers.forEach((user) => {
          map.set(user.id.toString(), user);
        });
        return map;
      }, [allUsers]);

      const getUsersForEvent = (ids: string | null) => {
        if (!ids) return [];

        return ids
          .split("; ")
          .filter(Boolean)
          .map((id) => usersMap.get(id))
          .filter(Boolean);
      };

      async function fetchEventsByCategory(category: EventCategory) {
        if (token) {
          switch (category) {
            case EventCategory.MEDICAL:
              setEvents(
                eventsByCategory[EventCategory.MEDICAL].filter(
                  (e) =>
                    (e.responsibleIds || "")
                      .split(";")
                      .map((id) => id.trim())
                      .includes(user.id.toString()) &&
                    (!e.date ||
                      new Date(e.date).setHours(0, 0, 0, 0) >=
                        new Date().setHours(0, 0, 0, 0))
                )
              );
            case EventCategory.HYPERION:
              setEvents([
                ...(eventsByCategory[EventCategory.HYPERION].filter(
                  (e) =>
                    !e.date ||
                    new Date(e.date).setHours(0, 0, 0, 0) >=
                      new Date().setHours(0, 0, 0, 0)
                ) || []),
                ...(eventsByCategory[EventCategory.HYPERLINK].filter(
                  (e) =>
                    !e.date ||
                    new Date(e.date).setHours(0, 0, 0, 0) >=
                      new Date().setHours(0, 0, 0, 0)
                ) || []),
              ]);
            default:
              setEvents([]);
          }
        }
      }

      useEffect(() => {
        fetchEventsByCategory(EventCategory.MEDICAL);
      }, [token]);

      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);

      const tabViews: JSX.Element[] = [
        // Tab 0 : Coaching Events
        <View key="meetings" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS RENDEZ-VOUS</AppText>
          <AppText>
            Préparez-vous pour vos prochains rendez-vous médicaux.
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton
              type="linkNormal"
              title="Voir historique"
              iconName="eye"
              onPress={() => {
                navigation.navigate("PlanningHistory");
              }}
            />
          </View>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : eventsByCategory[EventCategory.MEDICAL] &&
            eventsByCategory[EventCategory.MEDICAL].length > 0 ? (
            eventsByCategory[EventCategory.MEDICAL]
              .filter(
                (e) =>
                  (e.responsibleIds || "")
                    .split(";")
                    .map((id) => id.trim())
                    .includes(user.id.toString()) &&
                  (!e.date ||
                    new Date(e.date).setHours(0, 0, 0, 0) >=
                      new Date().setHours(0, 0, 0, 0))
              )
              .map((e) => {
                const personsInvolved = getUsersForEvent(e.personOngoingIds);

                return (
                  <Event
                    key={e.id}
                    title={e.title ? e.title : "Séance"}
                    personsInvolved={personsInvolved}
                    location={e.location || ""}
                    date={new Date(e.date || "")}
                    isInPerson
                    hour={e.time || ""}
                    type={EventCategory.MEDICAL}
                    onPress={() => {
                      setEventSelected(e);
                      setPersonOnGoingOfSelectedEvent(personsInvolved);
                      setEventDetailsPopUpVisible(true);
                    }}
                  />
                );
              })
          ) : (
            <AppText>Aucun rendez-vous n'est prévu actuellement</AppText>
          )}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <AppButton
              type="add"
              iconName="plus"
              onPress={handleEditEventModal}
            />
          </View>
        </View>,

        // Tab 1 : Company Events
        <View key="events" style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>PROCHAINS EVENEMENTS</AppText>
          <AppText style={GlobalStyles.h3}>HYPERION</AppText>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : eventsByCategory[EventCategory.HYPERION] &&
            eventsByCategory[EventCategory.HYPERION].length > 0 ? (
            eventsByCategory[EventCategory.HYPERION]
              .filter(
                (e) =>
                  !e.date ||
                  new Date(e.date).setHours(0, 0, 0, 0) >=
                    new Date().setHours(0, 0, 0, 0)
              )
              .map((e) => {
                const personsInvolved = getUsersForEvent(e.responsibleIds);

                return (
                  <Event
                    key={e.id}
                    title={e.title ? e.title : "Evénement"}
                    personsInvolved={personsInvolved}
                    location={e.location || ""}
                    date={new Date(e.date || "")}
                    hour={e.time || ""}
                    type={EventCategory.HYPERION}
                    onPress={() => {
                      setEventSelected(e);
                      setPersonOnGoingOfSelectedEvent(personsInvolved);
                      setEventDetailsPopUpVisible(true);
                    }}
                  />
                );
              })
          ) : (
            <AppText>Aucun événement n'est prévu actuellement</AppText>
          )}
          <AppText style={[GlobalStyles.h3, { marginTop: 16 }]}>
            HYPERLINK
          </AppText>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : eventsByCategory[EventCategory.HYPERLINK] &&
            eventsByCategory[EventCategory.HYPERLINK].length > 0 ? (
            eventsByCategory[EventCategory.HYPERLINK]
              .filter(
                (e) =>
                  !e.date ||
                  new Date(e.date).setHours(0, 0, 0, 0) >=
                    new Date().setHours(0, 0, 0, 0)
              )
              .map((e) => {
                const personsInvolved = getUsersForEvent(e.responsibleIds);

                return (
                  <Event
                    key={e.id}
                    title={e.title ? e.title : "Evénement"}
                    personsInvolved={personsInvolved}
                    location={e.location || ""}
                    date={new Date(e.date || "")}
                    hour={e.time || ""}
                    type={EventCategory.HYPERLINK}
                    onPress={() => {
                      setEventSelected(e);
                      setPersonOnGoingOfSelectedEvent(personsInvolved);
                      setEventDetailsPopUpVisible(true);
                    }}
                  />
                );
              })
          ) : (
            <AppText>Aucun événement n'est prévu actuellement</AppText>
          )}
        </View>,
      ];

      return (
        <>
          <View style={{ flexDirection: "column", gap: 24 }}>
            <ViewController
              tabs={[
                { title: "Seances", icon: "dumbell" },
                { title: "Evenements", icon: "calendar" },
              ]}
              onTabChange={setActiveTabIndex}
            />
            {tabViews[activeTabIndex]}
          </View>
          {editEventPopUpVisible && token && (
            <EditEvent
              visible={editEventPopUpVisible}
              token={token}
              onClose={() => setEditEventPopUpVisible(false)}
              title={"Créer un nouveau rendez-vous"}
              eventType={EventCategory.MEDICAL}
            />
          )}
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
            />
          )}
          {eventDetailsPopUpVisible && eventSelected && (
            <DisplayEvent
              visible={eventDetailsPopUpVisible}
              event={eventSelected}
              userConnected={user}
              listOfUser={personOnGoingOfSelectedEvent}
              onClose={() => {
                setEventDetailsPopUpVisible(false);
              }}
              token={token!}
            />
          )}
        </>
      );
    },
    free: (user) => {
      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <Event
                  title="Evénement Hyperion Vannes"
                  type={EventCategory.HYPERION}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <Event
                  title="Evénement Hyperion Vannes"
                  type={EventCategory.HYPERION}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
              </View>
            </View>
          </View>
        </>
      );
    },
    partner: (user) => {
      const [eventTypeLabel, setEventTypeLabel] = useState("");

      const [eventDetailVisible, setDisplayEvent] = useState<
        EventModel | false
      >(false);

      const displayEventDetailPopup = (event?: EventModel) =>
        setDisplayEvent(event ? event : false);

      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>RENDEZ-VOUS HYPERLINK</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <Event
                  title="Evénement Hyperlink Vannes"
                  type={EventCategory.HYPERLINK}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                  infoDescription="Lorem ipsum dolore sit amet"
                  theme="Soiree de lancement"
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type={EventCategory.HYPERLINK}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <Event
                  title="Evénement Hyperlink Vannes"
                  type={EventCategory.HYPERLINK}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <Event
                  title="Evénement Hyperion Vannes"
                  type={EventCategory.HYPERION}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
                <Event
                  title="Evénement Hyperion Vannes"
                  type={EventCategory.HYPERION}
                  personsInvolved={tempAdminUser}
                  location="Parc de Vannes"
                  date={new Date("2025-10-10")}
                  hour="14h00"
                />
              </View>
            </View>
          </View>
          {eventDetailVisible && (
            <DisplayEvent
              visible={!!eventDetailVisible}
              userConnected={user}
              event={eventDetailVisible}
              listOfUser={[]}
              onClose={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          )}
        </>
      );
    },
    admin: (user) => {
      const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);
      const [eventTypeLabel, setEventTypeLabel] = useState<EventCategory>();

      const [addContactPopUpVisible, setAddContactPopUpVisible] =
        useState(false);

      const [eventDetailVisible, setDisplayEvent] = useState<
        EventCompleteResponse | undefined
      >(undefined);

      const [eventDetailPersonsInvolved, setEventDetailPersonsInvolved] =
        useState<User[]>([]);

      const handleEditEventModal = () =>
        setEditEventPopUpVisible(!editEventPopUpVisible);
      const displayAddContactPopUp = () =>
        setAddContactPopUpVisible(!addContactPopUpVisible);
      const displayEventDetailPopup = (event?: EventCompleteResponse) =>
        setDisplayEvent(event);

      const [selectedUsers, setSelectedUser] = useState<User[] | []>([]);

      const handleAddContactsSubmit = (selectedUsers: User[]) => {
        setEventForm((prev) => ({ ...prev, selectedUsers }));
        setAddContactPopUpVisible(false);
      };

      const [eventForm, setEventForm] = useState({
        title: "",
        location: "",
        startTime: "",
        endTime: "",
        date: "",
        selectedUsers: [] as User[],
      });

      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleEventFormChange = (field: string, value: any) => {
        setEventForm((prev) => ({ ...prev, [field]: value }));
      };

      const handleEventSubmit = async () => {
        setIsSubmitting(true);
        try {
          const payload = {
            eventCategory:
              eventTypeLabel === EventCategory.HYPERLINK
                ? EventCategory.HYPERLINK
                : EventCategory.HYPERION,
            title: eventForm.title,
            location: eventForm.location,
            date: eventForm.date,
            time: eventForm.startTime,
            responsibleIds: eventForm.selectedUsers.map((u) => u.id).join(";"),
            isActive: true,
            // Add more fields as needed
          };
          await eventService.createEvent(payload, token!);
          setEditEventPopUpVisible(false);
          // Optionally: refresh events list here
        } catch (err) {
          // Handle error (show toast, etc)
          console.error(err);
        } finally {
          setIsSubmitting(false);
        }
      };
      // Fetch events by category using the hook at the top level
      const { eventsByCategory, eventsByCategoriesLoading, error } =
        useEventsByCategories(
          [
            EventCategory.HYPERLINK,
            EventCategory.HYPERION,
            EventCategory.SPORTING_ACTIVITY,
          ],
          token!
        );

      // Extraire tous les personOngoingIds des événements HYPERLINK
      const allPersonIds = useMemo(() => {
        const hyperlinkEvents = eventsByCategory[EventCategory.HYPERLINK] || [];
        const allIds = hyperlinkEvents
          .map((event) => event.responsibleIds)
          .filter(Boolean)
          .join(";");
        return allIds;
      }, [eventsByCategory]);

      // Charger tous les utilisateurs en une seule fois
      const { users: allUsers } = useEventPersons(allPersonIds, token!);

      // Créer un map pour un accès rapide aux utilisateurs
      const usersMap = useMemo(() => {
        const map = new Map();
        allUsers.forEach((user) => {
          map.set(user.id.toString(), user);
        });
        return map;
      }, [allUsers]);

      // Fonction pour récupérer les utilisateurs d'un événement
      const getUsersForEvent = (personOngoingIds: string | null) => {
        if (!personOngoingIds) return [];

        return personOngoingIds
          .split(";")
          .filter(Boolean)
          .map((id) => usersMap.get(id))
          .filter(Boolean);
      };

      return (
        <>
          <View style={{ flexDirection: "column", gap: 32 }}>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>RENDEZ-VOUS HYPERLINK</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                {(eventsByCategory[EventCategory.HYPERLINK] || []).map(
                  (hyperlinkEvent) => {
                    const personsInvolved = getUsersForEvent(
                      hyperlinkEvent.responsibleIds
                    );

                    return (
                      <Event
                        key={hyperlinkEvent.id}
                        title={hyperlinkEvent.title || "Evénement Hyperlink"}
                        type={EventCategory.HYPERLINK}
                        personsInvolved={personsInvolved}
                        location={
                          hyperlinkEvent.location || "Lieu non spécifié"
                        }
                        date={new Date(hyperlinkEvent.date || "")}
                        hour={hyperlinkEvent.time || "Heure non spécifiée"}
                        isInPerson={true}
                        // Only pass theme if it exists
                        {...((hyperlinkEvent as EventWithHyperlinkResponse)
                          .specificEvent?.theme != null
                          ? {
                              theme:
                                (hyperlinkEvent as EventWithHyperlinkResponse)
                                  .specificEvent.theme ?? undefined,
                            }
                          : {})}
                        infoDescription={
                          hyperlinkEvent.description ||
                          "Aucune description fournie"
                        }
                        link={hyperlinkEvent.link || "Lien non spécifié"}
                        onPress={() => {
                          setEventDetailPersonsInvolved(personsInvolved);
                          displayEventDetailPopup(hyperlinkEvent);
                        }}
                      />
                    );
                  }
                )}
                {eventsByCategory[EventCategory.HYPERLINK]?.length === 0 && (
                  <AppText>Aucun événement HYPERLINK trouvé</AppText>
                )}
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <AppButton
                    type="add"
                    iconName="plus"
                    onPress={() => {
                      setEventTypeLabel(EventCategory.HYPERLINK);
                      handleEditEventModal();
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>EVENEMENTS HYPERION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                {(eventsByCategory[EventCategory.HYPERION] || []).map(
                  (hyperionEvent) => {
                    const personsInvolved = getUsersForEvent(
                      hyperionEvent.responsibleIds
                    );

                    return (
                      <Event
                        key={hyperionEvent.id}
                        title={hyperionEvent.title || "Evénement Hyperlink"}
                        type={EventCategory.HYPERION}
                        personsInvolved={personsInvolved}
                        location={hyperionEvent.location || "Lieu non spécifié"}
                        date={new Date(hyperionEvent.date || "")}
                        hour={hyperionEvent.time || "Heure non spécifiée"}
                        isInPerson={true}
                        infoDescription={
                          hyperionEvent.description ||
                          "Aucune description fournie"
                        }
                        link={hyperionEvent.link || "Lien non spécifié"}
                        onPress={() => {
                          setEventDetailPersonsInvolved(personsInvolved);
                          displayEventDetailPopup(hyperionEvent);
                        }}
                      />
                    );
                  }
                )}
                {eventsByCategory[EventCategory.HYPERION]?.length === 0 && (
                  <AppText>Aucun événement HYPERION trouvé</AppText>
                )}
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <AppButton
                    type="add"
                    iconName="plus"
                    onPress={() => {
                      setEventTypeLabel(EventCategory.HYPERION);
                      handleEditEventModal();
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>
                SORTIES SPORTIVES A VALIDER
              </AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  {(
                    eventsByCategory[EventCategory.SPORTING_ACTIVITY] || []
                  ).map((sportingActivityEvent) => {
                    const personsInvolved = getUsersForEvent(
                      sportingActivityEvent.responsibleIds
                    );

                    return (
                      <Event
                        key={sportingActivityEvent.id}
                        title={
                          sportingActivityEvent.title || "Activité sportive"
                        }
                        type={EventCategory.SPORTING_ACTIVITY}
                        personsInvolved={personsInvolved}
                        location={
                          sportingActivityEvent.location || "Lieu non spécifié"
                        }
                        date={new Date(sportingActivityEvent.date || "")}
                        hour={
                          sportingActivityEvent.time || "Heure non spécifiée"
                        }
                        isInPerson={true}
                        infoDescription={
                          sportingActivityEvent.description ||
                          "Aucune description fournie"
                        }
                        link={sportingActivityEvent.link || "Lien non spécifié"}
                        onPress={() => {
                          setEventDetailPersonsInvolved(personsInvolved);
                          displayEventDetailPopup(sportingActivityEvent);
                        }}
                      />
                    );
                  })}
                  {eventsByCategory[EventCategory.SPORTING_ACTIVITY]?.length ===
                    0 && (
                    <AppText>
                      Aucun événement de sortie sportive trouvées
                    </AppText>
                  )}
                </View>
              </View>
            </View>
          </View>
          {editEventPopUpVisible && eventTypeLabel && (
            <EditEvent
              visible={editEventPopUpVisible}
              token={token ? token : ""}
              onClose={() => setEditEventPopUpVisible(false)}
              title={"Editer un nouvel évenement "}
              eventType={eventTypeLabel}
            />
          )}
          {addContactPopUpVisible && (
            <AddContacts
              visible={addContactPopUpVisible}
              token={token ? token : ""}
              onClose={displayAddContactPopUp}
              onSubmit={handleAddContactsSubmit}
            />
          )}
          {eventDetailVisible && (
            <DisplayEvent
              visible={!!eventDetailVisible}
              userConnected={user}
              event={eventDetailVisible}
              token={token!}
              listOfUser={eventDetailPersonsInvolved}
              onClose={() => setDisplayEvent(undefined)}
              {...((eventDetailVisible as EventWithHyperlinkResponse)
                .specificEvent != null
                ? {
                    hyperlinkProps:
                      (eventDetailVisible as EventWithHyperlinkResponse)
                        .specificEvent ?? undefined,
                  }
                : {})}
              {...((eventDetailVisible as EventWithSportingActivityResponse)
                .specificEvent != null
                ? {
                    sportingActivityProps:
                      (eventDetailVisible as EventWithSportingActivityResponse)
                        .specificEvent ?? undefined,
                  }
                : {})}
            />
          )}
        </>
      );
    },
  };

  if (!user) return null;

  const RenderProfileComponents = PlanningPageByProfile[user.profileCategory];

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
