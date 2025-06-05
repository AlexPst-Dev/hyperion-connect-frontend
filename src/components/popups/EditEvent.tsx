import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/models/user";
import AppText from "../AppText";
import { Colors } from "@/src/styles/styles";
import {
  Event,
  EventCategory,
  parseIds,
  UpdateEvent,
} from "@/src/models/event";
import AddContacts from "./AddContacts";
import { eventService } from "@/src/services/api/event-service";
import { UserService } from "@/src/services/api/user-service";

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
  const [selectedUsers, setSelectedUser] = useState<User[] | []>([]);

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
      (existingEvent as any)?.hyperlinkDetails?.theme
      ? (existingEvent as any).hyperlinkDetails.theme
      : ""
  );

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
    fetchResponsibleUsers();
  }, [existingEvent, token]);

  useEffect(() => {
    setEventTitle(existingEvent?.title ?? "");
    setEventLocation(existingEvent?.location ?? "");
    setEventTime(existingEvent?.time ? existingEvent.time.slice(0, 5) : "");
    setEventDate(existingEvent?.date ?? "");
    setEventTheme(
      eventType === EventCategory.HYPERLINK &&
        (existingEvent as any)?.hyperlinkDetails?.theme
        ? (existingEvent as any).hyperlinkDetails.theme
        : ""
    );
  }, [existingEvent, eventType]);

  const handleAddContactsSubmit = (selectedUsers: User[]) => {
    setSelectedUser(selectedUsers);
    setAddContactPopUpVisible(false);
  };

  const responsibleIds =
    selectedUsers.length > 0
      ? selectedUsers.map((u) => u.id).join(";")
      : undefined;
  const formattedTime = eventTime.length === 5 ? `${eventTime}:00` : eventTime;

  const handleSubmit = async () => {
    if (!existingEvent) return;
    const updateData: UpdateEvent & { hyperlinkDetails?: { theme: string } } = {
      title: eventTitle,
      description: eventDescription,
      link: eventLink,
      location: eventLocation,
      time: formattedTime,
      date: eventDate,
      ...(responsibleIds && { responsibleIds }),
    };

    // Add theme if it's a hyperlink event
    if (eventType === EventCategory.HYPERLINK) {
      updateData.theme = eventTheme;
    }

    try {
      await eventService.updateEvent(existingEvent.id, updateData, token);
      if (onSubmit) onSubmit([existingEvent]);
      onClose();
    } catch (error) {
      console.error("Failed to update event", error);
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
                  {eventType === EventCategory.HYPERION && (
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
          onClose={() => setAddContactPopUpVisible(!addContactPopUpVisible)}
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
