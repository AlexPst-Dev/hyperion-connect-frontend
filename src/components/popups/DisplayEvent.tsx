import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal, Image } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import ItemUser from "../ItemUser";
import AppButton from "../AppButton";
import AppText from "../AppText";
import Icon from "../Icon";
import { Colors } from "@/src/styles/styles";
import { useAuth } from "@/src/hooks/useAuth";

interface Props {
  visible: boolean;
  userConnected: number;
  listOfUser: User[];
  onClose: () => void;
  onSubmit?: (selectedUsers: User[]) => void;
  title: string;
  eventType:
    | "medical"
    | "hyperlink"
    | "hyperion"
    | "session"
    | "sportingActivity";
  location: string;
  date: Date;
  hour: string;
  isInPerson?: boolean;
  theme?: string;
  link?: string;
  infoDescription: string;
  createdBy: number;
}

export default function DisplayEvent({
  visible,
  userConnected,
  listOfUser,
  onClose,
  onSubmit,
  title,
  eventType,
  location,
  date,
  hour,
  isInPerson,
  theme,
  link,
  infoDescription,
  createdBy,
}: Props) {
  const { user } = useAuth();

  const handleSubmit = () => {
    onClose();
  };

  type EventActionType =
    | "editable"
    | "addToCalendar"
    | "applyToSportingActivity"
    | "closeOnly";

  function getEventActionType(
    user: User,
    eventOwnerId: number,
    eventType: string
  ): EventActionType {
    if (user.id === eventOwnerId) {
      return "editable";
    }
    if (
      eventType === "sportingActivity" &&
      user.profileCategory === "sportsman"
    ) {
      return "applyToSportingActivity";
    }
    return "addToCalendar";
  }

  const actionType = user
    ? getEventActionType(user, createdBy, eventType)
    : "closeOnly";

  return (
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
            specificBody={
              <>
                <View style={styles.eventContent}>
                  <View style={styles.personsOnGoingContainer}>
                    <AppText>
                      {eventType === "medical"
                        ? "Soignant"
                        : eventType === "sportingActivity"
                        ? "Sportif"
                        : "Intervenants"}
                    </AppText>
                    <View style={styles.userList}>
                      {listOfUser.length > 0 ? (
                        listOfUser.map((user, index) => {
                          return (
                            <Image
                              key={index}
                              source={
                                {
                                  uri: "https://reactnative.dev/img/tiny_logo.png",
                                } // fallback
                              }
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
                      <AppText>{location}</AppText>
                    </View>
                    <View style={styles.eventInfo}>
                      <Icon
                        name="calendarAdd"
                        fillColor="white"
                        strokeColor={Colors.deepBlue}
                        strokeWidth={2}
                      />
                      <AppText>{date.toLocaleDateString("fr-FR")}</AppText>
                    </View>
                    {eventType === "sportingActivity" && (
                      <View style={styles.eventInfo}>
                        <Icon
                          name="link"
                          fillColor="white"
                          strokeColor={Colors.deepBlue}
                          strokeWidth={2}
                        />
                        <AppText>{link}</AppText>
                      </View>
                    )}
                  </View>

                  <View style={styles.descriptionContainer}>
                    <AppText style={{ fontWeight: "bold" }}>
                      Informations :
                    </AppText>
                    <AppText>{infoDescription}</AppText>
                  </View>
                </View>

                <View style={styles.controllers}>
                  {actionType === "editable" && (
                    <>
                      <AppButton
                        type="secondary"
                        title="Modifier"
                        iconName="pencil"
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
