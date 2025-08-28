import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";
import PopUp from "../PopUp";
import { User, UserResponse } from "@/src/models/user";
import AppButton from "../AppButton";
import AppText from "../AppText";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { LoggedUser } from "@/src/models/auth";
import {
  CoachingEventResponse,
  Event,
  EventCategory,
  HyperionEventResponse,
  HyperlinkEventResponse,
  MedicalEventResponse,
  parseIds,
  SportingActivityEvent,
} from "@/src/models/event";
import EditEvent from "./EditEvent";
import { eventService } from "@/src/services/api/event-service";
import { notify } from "../NotificationContainer";
import { getLocationUrl } from "@/src/utils/urlHandler";
import { handleAddToCalendar } from "@/src/utils/calendar-utils";
import { UserService } from "@/src/services/api/user-service";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { useMultipleUserProfileImages } from "@/src/hooks/useImageProfilePicture";
import { ScrollView } from "react-native-gesture-handler";

interface Props {
  visible: boolean;
  event: Event;
  hyperlinkProps?: HyperlinkEventResponse;
  hyperionProps?: HyperionEventResponse;
  sportingActivityProps?: SportingActivityEvent;
  coachingProps?: CoachingEventResponse;
  medicalProps?: MedicalEventResponse;
  userConnected: LoggedUser;
  listOfUser: UserResponse[];
  onClose: () => void;
  onSubmit?: () => void;
  onRefused?: () => void;
  token?: string;
}

const ProfilePictureWithLoading: React.FC<{
  user: User;
  style: any;
  imageBase64: string;
  isLoading: boolean;
  onPress?: () => void;
}> = ({ user, style, imageBase64, isLoading, onPress }) => {
  const content = (
    <View style={[style, { position: "relative" }]}>
      {isLoading ? (
        <View
          style={[
            style,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
            },
          ]}
        >
          <ActivityIndicator size="small" color="#666" />
        </View>
      ) : (
        <Image
          source={imageBase64 ? { uri: imageBase64 } : undefined}
          style={style}
          alt={user.email}
        />
      )}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
};

export default function DisplayEvent({
  visible,
  event,
  hyperlinkProps,
  sportingActivityProps,
  userConnected,
  listOfUser,
  onClose,
  onSubmit,
  onRefused,
  token,
}: Props) {
  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ContactDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  /*
   * Form for editing an event
   */
  const [editEventPopUpVisible, setEditEventPopUpVisible] = useState(false);
  const [
    sportingActivityValidationLoading,
    setSportingActivityValidationLoading,
  ] = useState(false);

  // Handler for refusing (deleting) the event
  const handleRefuse = async () => {
    if (!event?.id || !token) return;
    setSportingActivityValidationLoading(true);
    try {
      await eventService.deleteEvent(event.id, token);
      if (onRefused) onRefused();
      onClose();
    } catch (err) {
      // Optionally show an error message
      console.error("Failed to delete event", err);
    } finally {
      setSportingActivityValidationLoading(false);
    }
  };

  // Handler for validating (activating) the event
  const handleValidate = async () => {
    if (!event?.id || !token) return;
    setSportingActivityValidationLoading(true);
    try {
      await eventService.updateEvent(event.id, { isActive: true }, token);
      await eventService.notifyValidationEvent(event.id, token);
      if (onSubmit) onSubmit();
      notify({
        title: "Activitée sportive validée avec succès",
        type: "success",
      });
      onClose();
    } catch (err) {
      // Optionally show an error message
      console.error("Failed to validate event", err);
      notify({
        title: "Une erreur est survenue lors de la validation",
        type: "error",
      });
    } finally {
      setSportingActivityValidationLoading(false);
    }
  };

  if (!event) return null;

  type EventActionType =
    | "editable"
    | "addToCalendar"
    | "applyToSportingActivity"
    | "validateSportingActivity"
    | "closeOnly";

  function getEventActionType(
    eventOwnerId: number,
    eventType: string
  ): EventActionType {
    if (
      eventType === EventCategory.SPORTING_ACTIVITY &&
      userConnected.profileCategory === "admin" &&
      eventOwnerId !== userConnected.id
    ) {
      return "validateSportingActivity";
    }
    if (
      userConnected.id === eventOwnerId ||
      userConnected.profileCategory === "admin"
    ) {
      return "editable";
    }
    if (
      eventType === EventCategory.SPORTING_ACTIVITY &&
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

  const isPlanningHistoryEvent: boolean =
    event.isActive === false &&
    (event.eventCategory === EventCategory.COACHING ||
      event.eventCategory === EventCategory.MEDICAL);
  const actionType =
    userConnected && isPlanningHistoryEvent === false
      ? getEventActionType(firstResponsibleId as number, event.eventCategory)
      : "closeOnly";

  const handleDeleteEvent = async () => {
    if (!event?.id || !token) return;
    try {
      await eventService.deleteEvent(event.id, token);
      notify({ title: "Événement supprimé", type: "success" });
      onClose();
    } catch (err) {
      notify({ title: "L'événement n'a pas pu être supprimé", type: "error" });
      console.error("Failed to delete event", err);
    }
  };

  const handleSportingActivitySubmit = async () => {
    if (!event?.id || !token) return;
    try {
      // Parse the existing ids
      const existingIds = parseIds(event.personOngoingIds);
      // Only add if not already present
      if (!existingIds.includes(userConnected.id)) {
        existingIds.push(userConnected.id);
      }
      // Join back to string with "; " separator
      const updatedIds =
        existingIds.join("; ") + (existingIds.length > 0 ? ";" : "");
      await eventService.updateEvent(
        event.id,
        {
          personOngoingIds: updatedIds,
        },
        token
      );
      await eventService.notifySportingActivityParticipation(
        event.id,
        userConnected.id,
        token
      );
      onClose();
      notify({
        title: "Votre participation a bien été enregistrée",
        type: "success",
      });
    } catch (e) {
      console.log("Error while applying to the sporting activity", e);
      notify({
        title: "Une erreur est survenue lors de la postulation",
        type: "error",
      });
    }
  };
  const handleCancelParticipation = async () => {
    if (!event?.id || !token) return;
    try {
      const existingIds = parseIds(event.personOngoingIds);
      const filteredIds = existingIds.filter((id) => id !== userConnected.id);
      const updatedIds =
        filteredIds.length > 0 ? filteredIds.join("; ") + ";" : "";
      await eventService.updateEvent(
        event.id,
        { personOngoingIds: updatedIds },
        token
      );
      onClose();
      notify({
        title: "Votre participation a bien été annulée",
        type: "success",
      });
    } catch (e) {
      console.log("Error while cancelling participation", e);
      notify({
        title: "Une erreur est survenue lors de l'annulation",
        type: "error",
      });
    }
  };

  const currentParticipantsCount = parseIds(event.personOngoingIds).length;
  const maxParticipants =
    sportingActivityProps && sportingActivityProps.maxParticipants
      ? sportingActivityProps.maxParticipants
      : Infinity;
  const hasJoined = parseIds(event.personOngoingIds).includes(userConnected.id);
  const canJoin = currentParticipantsCount < maxParticipants && !hasJoined;

  const [listParticipants, setListParticipants] = useState<UserResponse[]>([]);
  useEffect(() => {
    async function fetchSportsmansOfSportingEvent() {
      if (
        token &&
        event.eventCategory === EventCategory.SPORTING_ACTIVITY &&
        sportingActivityProps
      ) {
        try {
          const currentParticipantUsers = await Promise.all(
            parseIds(event.personOngoingIds).map((id) =>
              UserService.getUserById(id, token)
            )
          );
          setListParticipants(currentParticipantUsers);
        } catch (e) {
          console.log("Error while fetching list of participants : ", e);
        }
      } else {
        setListParticipants([]);
      }
    }
    fetchSportsmansOfSportingEvent();
  }, [token]);

  // Combiner tous les utilisateurs dont on a besoin des images
  const allUsers = useMemo(() => {
    const users = [...listOfUser];
    if (listParticipants) {
      users.push(...listParticipants.map((p) => p));
    }
    // Dédupliquer par ID
    const uniqueUsers = users.filter(
      (uniqueUser, index, self) =>
        index === self.findIndex((u) => u.user.id === uniqueUser.user.id)
    );
    return uniqueUsers;
  }, [listOfUser, listParticipants]);

  // Utiliser le hook pour charger toutes les images
  const { getImageForUser, isUserImageLoading } =
    useMultipleUserProfileImages(allUsers);

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.inner}>
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
                          : event.eventCategory === EventCategory.COACHING
                          ? "Sportif(s)"
                          : "Intervenants"}
                      </AppText>
                      {listOfUser.length > 4 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.longUserList}
                        >
                          {listOfUser.map((completeUser, index) => (
                            <ProfilePictureWithLoading
                              key={index}
                              user={completeUser.user}
                              style={styles.profilePicture}
                              imageBase64={getImageForUser(
                                completeUser.user.id
                              )}
                              isLoading={isUserImageLoading(
                                completeUser.user.id
                              )}
                            />
                          ))}
                        </ScrollView>
                      ) : listOfUser.length > 0 ? (
                        <View style={styles.userList}>
                          {listOfUser.map((completeUser, index) => (
                            <ProfilePictureWithLoading
                              key={index}
                              user={completeUser.user}
                              style={styles.profilePicture}
                              imageBase64={getImageForUser(
                                completeUser.user.id
                              )}
                              isLoading={isUserImageLoading(
                                completeUser.user.id
                              )}
                            />
                          ))}
                        </View>
                      ) : (
                        <AppText>Aucun utilisateur trouvé.</AppText>
                      )}
                      {listParticipants && listParticipants.length > 0 && (
                        <View style={{ flexDirection: "column", gap: 8 }}>
                          <AppText>{`Participants (${currentParticipantsCount}/${maxParticipants})`}</AppText>
                          <View style={styles.participantList}>
                            {listParticipants.map((participant, index) => (
                              <ProfilePictureWithLoading
                                key={participant.user.id}
                                user={participant.user}
                                style={styles.participantProfilePicture}
                                imageBase64={getImageForUser(
                                  participant.user.id
                                )}
                                isLoading={isUserImageLoading(
                                  participant.user.id
                                )}
                                onPress={() => {
                                  navigation.navigate("ContactDetail", {
                                    contact: participant.user,
                                  });
                                  onClose();
                                }}
                              />
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.dateAndPlaceContainer}>
                      <Pressable
                        style={styles.eventInfo}
                        onPress={() => {
                          if (event.location)
                            Linking.openURL(getLocationUrl(event.location));
                        }}
                      >
                        <Icon
                          name="mapAdd"
                          fillColor="white"
                          strokeColor={Colors.deepBlue}
                          strokeWidth={2}
                        />
                        <AppText>{event.location}</AppText>
                      </Pressable>
                      <Pressable
                        style={styles.eventInfo}
                        onPress={() => handleAddToCalendar(event)}
                      >
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
                      </Pressable>
                      {event.link && (
                        <>
                          <Pressable
                            style={styles.eventInfo}
                            onPress={() => {
                              if (event.link) Linking.openURL(event.link);
                            }}
                          >
                            <Icon
                              name="link"
                              fillColor="white"
                              strokeColor={Colors.deepBlue}
                              strokeWidth={2}
                            />
                            <AppText>{event.link}</AppText>
                          </Pressable>
                        </>
                      )}
                      {EventCategory.SPORTING_ACTIVITY &&
                        sportingActivityProps &&
                        sportingActivityProps.maxParticipants && (
                          <View style={styles.eventInfo}>
                            <Icon
                              name="user"
                              fillColor="white"
                              strokeColor={Colors.deepBlue}
                              strokeWidth={2}
                            />
                            <AppText>
                              {sportingActivityProps.maxParticipants}{" "}
                              participants maximum
                            </AppText>
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
                      <View
                        style={{ flexDirection: "column", gap: 32, flex: 1 }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <AppButton
                            type="secondary"
                            title="Modifier"
                            iconName="pencil"
                            onPress={() => setEditEventPopUpVisible(true)}
                          />
                          <Pressable onPress={onClose}>
                            <AppText>OK</AppText>
                          </Pressable>
                        </View>
                        <View style={{ alignSelf: "flex-start" }}>
                          <Pressable
                            onPress={handleDeleteEvent}
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              paddingBottom: 1,
                              borderBottomWidth: 1,
                              borderBottomColor: "#C61010",
                            }}
                          >
                            <AppText style={{ color: "#C61010" }}>
                              Supprimer
                            </AppText>
                            <Icon
                              name="trash"
                              strokeColor="#C61010"
                              fillColor="transparent"
                              strokeWidth={1}
                            />
                          </Pressable>
                        </View>
                      </View>
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
                          onPress={() => handleAddToCalendar(event)}
                        />
                      </>
                    )}
                    {actionType === "applyToSportingActivity" && (
                      <>
                        {!canJoin && !hasJoined ? (
                          <View style={{ flexDirection: "column" }}>
                            <AppText style={{ color: Colors.red }}>
                              Nombre maximum de participants atteint
                            </AppText>
                            <Pressable onPress={onClose}>
                              <AppText>Fermer</AppText>
                            </Pressable>
                          </View>
                        ) : (
                          <>
                            <Pressable onPress={onClose}>
                              <AppText>Fermer</AppText>
                            </Pressable>
                            {canJoin && (
                              <AppButton
                                type="primary"
                                title="Participer"
                                iconName="plus"
                                onPress={handleSportingActivitySubmit}
                              />
                            )}
                            {hasJoined && (
                              <AppButton
                                type="secondary"
                                title="Annuler ma participation"
                                iconName="close"
                                onPress={handleCancelParticipation}
                                buttonStyle={{ backgroundColor: Colors.red }}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                    {actionType === "validateSportingActivity" && (
                      <View
                        style={{ flexDirection: "column", gap: 8, flex: 1 }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <AppButton
                            type="primary"
                            title="Refuser"
                            iconName="close"
                            buttonStyle={{ backgroundColor: Colors.red }}
                            onPress={() => handleRefuse()}
                            disabled={sportingActivityValidationLoading}
                          />
                          <AppButton
                            type="primary"
                            title="Valider"
                            iconName="check"
                            onPress={() => handleValidate()}
                            disabled={sportingActivityValidationLoading}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                          }}
                        >
                          <Pressable onPress={onClose}>
                            <AppText>Fermer</AppText>
                          </Pressable>
                        </View>
                      </View>
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
          </View>
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
          title="Modifier l'évenement"
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
  longUserList: {
    flexDirection: "row",
    gap: 8,
  },
  participantList: {
    flexDirection: "row",
    gap: 4,
  },
  profilePicture: {
    width: 64,
    height: 64,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  participantProfilePicture: {
    width: 48,
    height: 48,
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
