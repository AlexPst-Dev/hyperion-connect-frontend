import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal, Image } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/models/user";
import { ScrollView } from "react-native-gesture-handler";
import AppButton from "../AppButton";
import AppText from "../AppText";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { LoggedUser } from "@/src/models/auth";
import {
  Event,
  EventCategory,
  HyperlinkEventResponse,
} from "@/src/models/event";
import { getImageSource } from "@/src/utils/imgSrcHandler";
import EditEvent from "./EditEvent";

interface Props {
  visible: boolean;
  event: Event;
  hyperlinkProps?: HyperlinkEventResponse;
  userConnected: LoggedUser;
  listOfUser: User[];
  onClose: () => void;
  onSubmit?: () => void;
  token?: string;
}

export default function DisplayEvent({
  visible,
  event,
  hyperlinkProps,
  userConnected,
  listOfUser,
  onClose,
  onSubmit,
  token,
}: Props) {
  /*
   * Form for editing an event
   */
  const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);
  const handleSubmit = () => {
    onClose();
  };

  if (!event) return null;

  type EventActionType =
    | "editable"
    | "addToCalendar"
    | "applyToSportingActivity"
    | "closeOnly";

  function getEventActionType(
    eventOwnerId: number,
    eventType: string
  ): EventActionType {
    if (
      userConnected.id === eventOwnerId ||
      userConnected.profileCategory === "admin"
    ) {
      return "editable";
    }
    if (
      eventType === "sportingActivity" &&
      userConnected.profileCategory === "sportsman" &&
      eventOwnerId !== userConnected.id
    ) {
      return "applyToSportingActivity";
    }
    return "addToCalendar";
  }

  const firstResponsibleId =
    event.responsibleIds && typeof event.responsibleIds === "string"
      ? parseInt(event.responsibleIds.split(";")[0], 10)
      : undefined;

  const actionType = userConnected
    ? getEventActionType(firstResponsibleId as number, event.eventCategory)
    : "closeOnly";

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
              title={event.title ?? ""}
              specificBody={
                <>
                  <View style={styles.eventContent}>
                    <View style={styles.personsOnGoingContainer}>
                      <AppText>
                        {event.eventCategory === EventCategory.MEDICAL
                          ? "Soignant"
                          : event.eventCategory ===
                            EventCategory.SPORTING_ACTIVITY
                          ? "Sportif"
                          : "Intervenants"}
                      </AppText>
                      <View style={styles.userList}>
                        {listOfUser.length > 0 ? (
                          listOfUser.map((user, index) => {
                            return (
                              <Image
                                key={index}
                                source={getImageSource(user.image)}
                                style={styles.profilePicture}
                                id={index.toString()}
                                alt={user.email}
                              />
                            );
                          })
                        ) : (
                          <AppText>Aucun utilisateur trouvé.</AppText>
                        )}
                      </View>
                    </View>

                    <View style={styles.dateAndPlaceContainer}>
                      <View style={styles.eventInfo}>
                        <Icon
                          name="mapAdd"
                          fillColor="white"
                          strokeColor={Colors.deepBlue}
                          strokeWidth={2}
                        />
                        <AppText>{event.location}</AppText>
                      </View>
                      <View style={styles.eventInfo}>
                        <Icon
                          name="calendarAdd"
                          fillColor="white"
                          strokeColor={Colors.deepBlue}
                          strokeWidth={2}
                        />
                        <AppText>
                          {event.date
                            ? new Date(event.date).toLocaleDateString("fr-FR")
                            : ""}
                        </AppText>
                      </View>
                      {EventCategory.SPORTING_ACTIVITY && event.link && (
                        <View style={styles.eventInfo}>
                          <Icon
                            name="link"
                            fillColor="white"
                            strokeColor={Colors.deepBlue}
                            strokeWidth={2}
                          />
                          <AppText>{event.link}</AppText>
                        </View>
                      )}
                    </View>

                    <View style={styles.descriptionContainer}>
                      <AppText style={{ fontWeight: "bold" }}>
                        Informations
                      </AppText>
                      {event.eventCategory === EventCategory.HYPERLINK &&
                        hyperlinkProps &&
                        hyperlinkProps.theme && (
                          <AppText>Thème : {hyperlinkProps.theme}</AppText>
                        )}
                      <AppText>Description : {event.description}</AppText>
                    </View>
                  </View>

                  <View style={styles.controllers}>
                    {actionType === "editable" && (
                      <>
                        <AppButton
                          type="secondary"
                          title="Modifier"
                          iconName="pencil"
                          onPress={() => setEditEventPopUpVisible(true)}
                        />
                        <Pressable onPress={onClose}>
                          <AppText>OK</AppText>
                        </Pressable>
                      </>
                    )}

                    {actionType === "addToCalendar" && (
                      <>
                        <Pressable onPress={onClose}>
                          <AppText>Fermer</AppText>
                        </Pressable>
                        <AppButton
                          type="secondary"
                          title="Ajouter au calendrier"
                          iconName="calendarAdd"
                        />
                      </>
                    )}

                    {actionType === "applyToSportingActivity" && (
                      <>
                        <Pressable onPress={onClose}>
                          <AppText>Fermer</AppText>
                        </Pressable>
                        <AppButton
                          type="primary"
                          title="Postuler"
                          iconName="plus"
                          onPress={() => {
                            console.log("Postulation envoyée !");
                            handleSubmit();
                          }}
                        />
                      </>
                    )}

                    {actionType === "closeOnly" && (
                      <Pressable onPress={onClose}>
                        <AppText>Fermer</AppText>
                      </Pressable>
                    )}
                  </View>
                </>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
      {editEventPopUpVisible && (
        <EditEvent
          visible={editEventPopUpVisible}
          token={token as string}
          onClose={() => {
            setEditEventPopUpVisible(false);
            if (onSubmit) onSubmit();
          }}
          existingEvent={event}
          title="Editer l'évenement"
          eventType={event.eventCategory}
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
  eventContent: {
    flexDirection: "column",
    gap: 24,
  },
  personsOnGoingContainer: {
    flexDirection: "column",
    gap: 16,
  },
  userList: {
    flexDirection: "row",
    gap: 16,
  },
  profilePicture: {
    width: 64,
    height: 64,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  dateAndPlaceContainer: {
    flexDirection: "column",
    gap: 8,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  descriptionContainer: {
    flexDirection: "column",
  },
  controllers: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  },
});
