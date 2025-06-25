import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/models/user";
import AppText from "../AppText";
import { Colors } from "@/src/styles/styles";
import {
  CreateEventWithCoaching,
  CreateEventWithHyperion,
  CreateEventWithHyperlink,
  CreateEventWithMedical,
  CreateEventWithSportingActivity,
  Event,
  EventCategory,
  parseIds,
  UpdateEvent,
} from "@/src/models/event";
import AddContacts from "./AddContacts";
import { eventService } from "@/src/services/api/event-service";
import { UserService } from "@/src/services/api/user-service";
import AddSessions from "./AddSession";
import { Session, SessionWithFile } from "@/src/models/session";
import { SessionService } from "@/src/services/api/session-service";
import { fileService } from "@/src/services/api/file-service";
import { useAuth } from "@/src/hooks/useAuth";
import { notify } from "../NotificationContainer";

interface Props {
  visible: boolean;
  token: string;
  existingEvent?: Event;
  onClose: () => void;
  onSubmit?: (event: Event[]) => void;
  title: string;
  eventType: EventCategory;
}

export default function EditEvent({
  visible,
  token,
  onClose,
  onSubmit,
  title,
  eventType,
  existingEvent,
}: Props) {
  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);
  const [selectedUsers, setSelectedUser] = useState<User[]>([]);

  const [addSessionPopUpVisible, setAddSessionPopUpVisible] = useState(false);
  const [sessionsCatalog, setSessionsCatalog] = useState<SessionWithFile[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session>();

  const { user } = useAuth();

  // Form states
  const [eventTitle, setEventTitle] = useState(existingEvent?.title ?? "");
  const [eventDescription, setEventDescription] = useState(
    existingEvent?.description ?? ""
  );
  const [eventLink, setEventLink] = useState(existingEvent?.link ?? "");
  const [eventLocation, setEventLocation] = useState(
    existingEvent?.location ?? ""
  );
  const [eventTime, setEventTime] = useState(
    existingEvent?.time ? existingEvent.time.slice(0, 5) : ""
  );
  const [eventDate, setEventDate] = useState(existingEvent?.date ?? "");
  const [eventTheme, setEventTheme] = useState(
    eventType === EventCategory.HYPERLINK &&
      (existingEvent as any)?.specificEvent?.theme
      ? (existingEvent as any).specificEvent.theme
      : ""
  );
  const [eventMaxParticipants, setEventMaxParticipants] = useState(
    eventType === EventCategory.SPORTING_ACTIVITY &&
      (existingEvent as any)?.specificEvent?.maxParticipants
      ? (existingEvent as any).specificEvent.maxParticipants
      : 0
  );
  // Coaching event specific props
  const [eventSessionId, setEventSessionId] = useState(
    eventType === EventCategory.COACHING &&
      (existingEvent as any)?.specificEvent?.sessionId
      ? (existingEvent as any).specificEvent.sessionId
      : null
  );

  // Fetch responsible users when the popup opens or event changes
  useEffect(() => {
    async function fetchResponsibleUsers() {
      if (!existingEvent?.responsibleIds || !token) {
        setSelectedUser([]);
        return;
      }
      const ids = parseIds(existingEvent.responsibleIds);
      try {
        const users = await Promise.all(
          ids.map((id) =>
            UserService.getUserById(id, token).then((res) => res.user)
          )
        );
        setSelectedUser(users);
      } catch {
        setSelectedUser([]);
      }
    }
    async function fetchSessionsCatalog() {
      try {
        const allSessions = await SessionService.getAllSessions(token);
        const catalogSessionsWithFiles = await Promise.all(
          allSessions.map(async (session) => {
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
        setSessionsCatalog(catalogSessionsWithFiles);
      } catch (e) {
        console.log(
          "Error while fetching all the sessions for the catalog : ",
          e
        );
      }
    }
    if (visible && existingEvent) {
      fetchResponsibleUsers();
    } else if (visible) {
      fetchSessionsCatalog();
    }
  }, [existingEvent, token, visible]);

  // Reset form fields when event changes
  useEffect(() => {
    setEventTitle(existingEvent?.title ?? "");
    setEventLocation(existingEvent?.location ?? "");
    setEventTime(existingEvent?.time ? existingEvent.time.slice(0, 5) : "");
    setEventDate(existingEvent?.date ?? "");
    setEventDescription(existingEvent?.description ?? "");
    setEventLink(existingEvent?.link ?? "");
    setEventTheme(
      eventType === EventCategory.HYPERLINK &&
        (existingEvent as any)?.specificEvent?.theme
        ? (existingEvent as any).specificEvent.theme
        : ""
    );
    setEventTheme(
      eventType === EventCategory.SPORTING_ACTIVITY &&
        (existingEvent as any)?.specificEvent?.maxParticipants
        ? (existingEvent as any).specificEvent.maxParticipants
        : ""
    );
    setEventSessionId(
      eventType === EventCategory.COACHING &&
        (existingEvent as any)?.specificEvent?.sessionId
        ? (existingEvent as any).specificEvent.sessionId
        : null
    );
  }, [existingEvent, eventType]);

  const handleAddContactsSubmit = (users: User[]) => {
    setSelectedUser(users);
    setAddContactPopUpVisible(false);
  };

  const responsibleIds =
    selectedUsers.length > 0
      ? selectedUsers.map((u) => u.id).join("; ")
      : undefined;

  const formattedTime = eventTime.length === 5 ? `${eventTime}:00` : eventTime;

  const handleSubmit = async () => {
    const baseData: any = {
      title: eventTitle,
      description: eventDescription,
      link: eventLink,
      location: eventLocation,
      time: formattedTime,
      date: eventDate,
    };

    if (
      (eventType === EventCategory.COACHING ||
        eventType === EventCategory.MEDICAL) &&
      user &&
      user.id
    ) {
      baseData.responsibleIds = user.id.toString();
      baseData.personOngoingIds =
        selectedUsers.length > 0
          ? selectedUsers.map((u) => u.id).join("; ")
          : undefined;
    } else if (responsibleIds) {
      baseData.responsibleIds = responsibleIds;
    }

    try {
      if (existingEvent) {
        // UPDATE
        const updateData: UpdateEvent & {
          theme?: string;
          maxParticipants?: string;
          sessionId?: number;
          personOngoingIds?: string;
        } = {
          ...baseData,
        };
        if (eventType === EventCategory.HYPERLINK) {
          updateData.theme = eventTheme;
        }
        if (eventType === EventCategory.SPORTING_ACTIVITY) {
          updateData.maxParticipants = eventMaxParticipants;
        }
        if (eventType === EventCategory.COACHING) {
          updateData.sessionId = eventSessionId;
          updateData.personOngoingIds =
            selectedUsers.length > 0
              ? selectedUsers.map((u) => u.id).join("; ")
              : undefined;
        }
        await eventService.updateEvent(existingEvent.id, updateData, token);
        if (onSubmit) onSubmit([existingEvent]);
        onClose();
      } else {
        // CREATE
        let createData: any = {
          eventCategory: eventType,
          ...baseData,
        };
        if (eventType === EventCategory.HYPERLINK) {
          createData.theme = eventTheme;
        }
        if (eventType === EventCategory.SPORTING_ACTIVITY) {
          createData.maxParticipants = Number(eventMaxParticipants);
        }
        if (eventType === EventCategory.COACHING) {
          createData.isDone = false;
          createData.sessionId = eventSessionId;
        }

        const res = await eventService.createEvent(createData, token);
        notify({
          title: "Evenement créé avec succès",
          type: "success",
        });
        if (onSubmit) onSubmit([res.specificEvent]);
        onClose();
      }
    } catch (error) {
      notify({
        title: "L'évènement n'a pas pu être créé",
        type: "error",
      });
      console.error("Failed to submit event", error);
    }
  };

  return (
    <>
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
              title={title}
              closeText="Annuler"
              onSubmit={handleSubmit}
              btnType="primary"
              btnText="Editer"
              iconName="pencil"
              inputs={
                <View style={styles.eventFormContent}>
                  <Input
                    type="text"
                    label="Nom"
                    placeholder="Nom de l'évenement"
                    value={eventTitle}
                    onChangeText={setEventTitle}
                  />
                  <Input
                    type="text"
                    label="Lieu"
                    placeholder="Adresse"
                    value={eventLocation}
                    onChangeText={setEventLocation}
                  />
                  <Input
                    type="text"
                    label="Heure de début"
                    placeholder="08:00"
                    value={eventTime}
                    onChangeText={setEventTime}
                  />
                  <Input
                    type="date"
                    label="Date"
                    placeholder="XX/XX/XXXX"
                    value={eventDate}
                    onChangeText={setEventDate}
                  />
                  <Input
                    type="text"
                    label="Lien"
                    placeholder="https://www..."
                    value={eventLink}
                    onChangeText={setEventLink}
                  />
                  <Input
                    type="textarea"
                    label="Description"
                    placeholder="Décrivez l'évènement ici..."
                    value={eventDescription}
                    onChangeText={setEventDescription}
                  />
                  {/* Allow adding contacts */}
                  {(eventType === EventCategory.HYPERION ||
                    eventType === EventCategory.HYPERLINK ||
                    eventType === EventCategory.COACHING ||
                    eventType === EventCategory.MEDICAL) && (
                    <Pressable
                      onPress={() =>
                        setAddContactPopUpVisible(!addContactPopUpVisible)
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
                      {selectedUsers.length !== 0 ? (
                        selectedUsers.map((user) => (
                          <AppText key={user.id}>
                            {user.firstName} {user.lastName}
                          </AppText>
                        ))
                      ) : (
                        <AppText style={{ color: Colors.grey }}>
                          Selectionnez une personne à ajouter à l'évenement
                        </AppText>
                      )}
                    </Pressable>
                  )}
                  {eventType === EventCategory.HYPERLINK && (
                    <Input
                      type="text"
                      label="Thème"
                      placeholder="Thème de l'évènement"
                      value={eventTheme}
                      onChangeText={setEventTheme}
                    />
                  )}
                  {eventType === EventCategory.SPORTING_ACTIVITY && (
                    <Input
                      type="text"
                      label="Nombre maximum de participants"
                      placeholder="10"
                      value={eventMaxParticipants}
                      onChangeText={setEventMaxParticipants}
                    />
                  )}
                  {eventType == EventCategory.COACHING && (
                    <>
                      <Pressable
                        onPress={() => setAddSessionPopUpVisible(true)}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: Colors.deepBlue,
                          marginTop: 8,
                        }}
                      >
                        {selectedSession ? (
                          <AppText>{selectedSession.label}</AppText>
                        ) : (
                          <AppText style={{ color: Colors.grey }}>
                            Selectionnez une session à ajouter à l'évenement
                          </AppText>
                        )}
                      </Pressable>
                      {addSessionPopUpVisible && (
                        <AddSessions
                          visible={addSessionPopUpVisible}
                          listOfSession={sessionsCatalog}
                          onClose={() => setAddSessionPopUpVisible(false)}
                          onSubmit={(selectedSession) => {
                            setSelectedSession(selectedSession[0].session);
                            setEventSessionId(selectedSession[0].session.id);
                          }}
                          exercises={[]}
                          categories={[]}
                        />
                      )}
                    </>
                  )}
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
      {addContactPopUpVisible && (
        <AddContacts
          visible={addContactPopUpVisible}
          token={token}
          onClose={() => setAddContactPopUpVisible(false)}
          onSubmit={handleAddContactsSubmit}
          initialSelectedUserIds={selectedUsers.map((u) => u.id)}
        />
      )}
    </>
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
  eventFormContent: {
    flexDirection: "column",
    gap: 8,
  },
});
