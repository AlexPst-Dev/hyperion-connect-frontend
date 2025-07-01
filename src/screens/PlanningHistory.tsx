import React, { useMemo, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";
import AppText from "../components/AppText";
import Event from "../components/Event";
import { ProfileCategory, User } from "../models/user";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { Event as EventModel, EventCategory } from "../models/event";
import {
  useEventPersons,
  useEventsByCategories,
} from "../hooks/useEventsByCategories";
import { useAuth } from "../hooks/useAuth";
import DisplayEvent from "../components/popups/DisplayEvent";

type PlanningHistoryRouteProp = RouteProp<
  RootStackParamList,
  "PlanningHistory"
>;

export default function PlanningHistoryScreen() {
  const route = useRoute<PlanningHistoryRouteProp>();
  const screenWidth = Dimensions.get("window").width;

  const { user, token } = useAuth();

  if (!user || !token) return;

  let eventCategories: EventCategory[] = [];
  let specificEventByProfile: EventCategory;
  if (user.profileCategory === ProfileCategory.COACH) {
    eventCategories = [EventCategory.COACHING, EventCategory.HYPERION];
    specificEventByProfile = EventCategory.COACHING;
  } else if (user.profileCategory === ProfileCategory.MEDIC) {
    eventCategories = [
      EventCategory.MEDICAL,
      EventCategory.HYPERION,
      EventCategory.HYPERLINK,
    ];
    specificEventByProfile = EventCategory.MEDICAL;
  }

  const { eventsByCategory, eventsByCategoriesLoading, error } =
    useEventsByCategories(eventCategories, token);
  const [eventSelected, setEventSelected] = useState<EventModel>();
  const [personOnGoingOfSelectedEvent, setPersonOnGoingOfSelectedEvent] =
    useState<any[]>([]);
  const [eventDetailsPopUpVisible, setEventDetailsPopUpVisible] =
    useState(false);

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
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>HISTORIQUE</AppText>
          {eventsByCategoriesLoading ? (
            <AppText>Chargement...</AppText>
          ) : (
            eventCategories.map((category) => {
              const events = eventsByCategory[category] || [];
              if (events.length === 0) return null;

              // Optional: Display a section title for each category
              let sectionTitle = "";
              switch (category) {
                case EventCategory.COACHING:
                  sectionTitle = "Séances de coaching";
                  break;
                case EventCategory.MEDICAL:
                  sectionTitle = "Rendez-vous";
                  break;
                case EventCategory.HYPERION:
                  sectionTitle = "Événements Hyperion";
                  break;
                case EventCategory.HYPERLINK:
                  sectionTitle = "Événements Hyperlink";
                  break;
                default:
                  sectionTitle = "Autres événements";
              }

              return (
                <View key={category} style={{ marginBottom: 16 }}>
                  <AppText style={{ fontWeight: "bold", marginBottom: 8 }}>
                    {sectionTitle}
                  </AppText>
                  {events
                    .filter(
                      (e) =>
                        !e.date ||
                        new Date(e.date).setHours(0, 0, 0, 0) <
                          new Date().setHours(0, 0, 0, 0)
                    )
                    .map((e) => {
                      const personsInvolved = getUsersForEvent(
                        e.personOngoingIds
                      );

                      return (
                        <Event
                          key={e.id}
                          title={e.title ? e.title : "Séance"}
                          personsInvolved={personsInvolved}
                          location={e.location || ""}
                          date={new Date(e.date || "")}
                          hour={e.time || ""}
                          type={category}
                          onPress={() => {
                            setEventSelected(e);
                            setPersonOnGoingOfSelectedEvent(personsInvolved);
                            setEventDetailsPopUpVisible(true);
                          }}
                        />
                      );
                    })}
                </View>
              );
            })
          )}
          {/* If no events at all */}
          {!eventsByCategoriesLoading &&
            eventCategories.every(
              (cat) =>
                !eventsByCategory[cat] || eventsByCategory[cat].length === 0
            ) && <AppText>Aucune séance n'est passée actuellement</AppText>}
        </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
