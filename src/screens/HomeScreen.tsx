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
import { ProfileCategory, User } from "../models/user";
import {
  getNotificationsByCategory,
  updateNotification,
} from "../services/api/notification-service";
import { NotificationCategory, Notification } from "../models/notification";
import Input from "../components/Input";
import PopUp from "../components/PopUp";

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
    firstName: "Chloé",
    lastName: "Marchegay",
    profileCategory: ProfileCategory.ADMIN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
    email: "chloé.marchegay@mail.com",
  };
  const tempSporstmanUser1: User = {
    id: 3,
    firstName: "Antoine",
    lastName: "Martin",
    email: "antoine.martin@mail.com",
    profileCategory: ProfileCategory.SPORTSMAN,
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
  };
  const tempSporstmanUser2: User = {
    id: 4,
    firstName: "Lisa",
    lastName: "Dupont",
    profileCategory: ProfileCategory.SPORTSMAN,
    email: "lisa.dupont@mail.com",
    isActive: true,
    createdAt: "2025-05-05",
    updatedAt: "2025-05-05",
  };

  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const [editNewsVisible, setEditNewsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, token } = useAuth();

  if (!user) return null;

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
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotification();
  }, [token]);

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
    } catch (error) {
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
    sportsman: (user) => (
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
          <Session
            title="Séance de Tempo Run"
            durationTime={50}
            nbExercises={3}
            labels={
              <>
                <Label title="Cardio" type="blue" size="small" />
                <Label title="Jambes" type="orange" size="small" />
              </>
            }
            imageUrl="sessions/img-running"
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
            <AppText style={GlobalStyles.h3}>VOTRE PROCHAIN RDV</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <Event
            title="Séance de fractionné"
            type="session"
            personsInvolved={tempCoachUser}
            location="Parc de Vannes"
            date={new Date("2025-05-17")}
            hour="14h00"
            isInPerson
            infoDescription="Lorem ipsum dolore sit amet"
          />
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <AppText style={{ fontWeight: "bold" }}>
            {notification?.title}
          </AppText>
          <AppText>{notification?.text}</AppText>
        </View>
      </View>
    ),
    coach: (user) => (
      <View style={{ flexDirection: "column", gap: 24 }}>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText>Votre résumé</AppText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Sportifs Coachés"
                iconName="user"
                fillIcon
                value="4"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Séances réalisées"
                iconName="dumbell"
                fillIcon
                value="30"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Motivaiton moyenne"
                iconName="star"
                fillIcon
                value="3.9"
              />
            </View>
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
            <AppText style={GlobalStyles.h3}>VOS CLIENTS</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <ItemClient
              user={tempSporstmanUser1}
              objectives={
                <Objective
                  duration={10}
                  onGoingNumber={4}
                  label="Suivi par un coach de running pour un marathon"
                />
              }
            />
            <ItemClient
              user={tempSporstmanUser2}
              objectives={
                <Objective
                  duration={10}
                  onGoingNumber={4}
                  label="Suivi par un coach de running pour un marathon"
                />
              }
            />
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
            <AppButton type="linkSmall" title="Voir planning" iconName="eye" />
          </View>
          <Event
            title="Séance de fractionné"
            type="session"
            personsInvolved={tempSporstmanUser1}
            location="Parc de Vannes"
            date={new Date("2025-05-17")}
            hour="14h00"
            isInPerson
            infoDescription="Lorem ipsum dolore sit amet"
          />
        </View>
      </View>
    ),
    medic: (user) => (
      <View style={{ flexDirection: "column", gap: 24 }}>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText>Votre résumé</AppText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Kpi title="Patients suivi" iconName="user" fillIcon value="4" />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi title="Rdv réalisées" iconName="calendar" value="30" />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Motivaiton moyenne"
                iconName="star"
                fillIcon
                value="3.9"
              />
            </View>
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
            <AppText style={GlobalStyles.h3}>VOS PATIENTS</AppText>
            <AppButton type="linkSmall" title="Voir plus" iconName="eye" />
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <ItemClient
              user={tempSporstmanUser1}
              objectives={
                <Objective
                  duration={10}
                  onGoingNumber={4}
                  label="Suivi par un coach de running pour un marathon"
                />
              }
            />
            <ItemClient
              user={tempSporstmanUser2}
              objectives={
                <Objective
                  duration={10}
                  onGoingNumber={4}
                  label="Suivi par un coach de running pour un marathon"
                />
              }
            />
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
            <AppButton type="linkSmall" title="Voir planning" iconName="eye" />
          </View>
          <Event
            title="Analyse sanguine"
            type="medical"
            personsInvolved={tempSporstmanUser2}
            location="Centre d'analyse de Vannes"
            date={new Date("2025-05-17")}
            hour="14h00"
            isInPerson
            infoDescription="Lorem ipsum dolore sit amet"
          />
        </View>
      </View>
    ),
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
            type="hyperion"
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
                  <Label title="Cardio" type="blue" size="small" />
                  <Label title="Jambes" type="orange" size="small" />
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
                  <Label title="Cardio" type="blue" size="small" />
                  <Label title="Jambes" type="orange" size="small" />
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
                    <Label title="Cardio" type="blue" size="small" />
                    <Label title="Jambes" type="orange" size="small" />
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
              type="hyperlink"
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
              type="hyperion"
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
    admin: (user) => (
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
            title="Evenement Hyperion Vannes"
            type="hyperion"
            personsInvolved={tempAdminUser}
            location="Parc de Vannes"
            date={new Date("2025-05-17")}
            hour="14h00"
            isInPerson
            infoDescription="Lorem ipsum dolore sit amet"
          />
        </View>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText>
            Retrouvez ici les statistiques globales de l'application.
          </AppText>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
            <View style={{ flex: 1 }}>
              <Kpi
                title="Title of the KPI"
                iconName="run"
                value="XXX"
                unit="yyy"
                fillIcon
              />
            </View>
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
    ),
  };

  const RenderProfileComponents = HomePageByProfile[user.profileCategory];

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
        {(user.profileCategory === "admin" ||
          user.profileCategory === "free" ||
          user.profileCategory === "sporstman") && (
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
                      placeholder="ex : A la une"
                      value={newsTitle}
                      onChangeText={setNewsTitle}
                    />
                    <Input
                      type="text"
                      label="Message"
                      placeholder="Contenu du message"
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
