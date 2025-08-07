import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import HeaderNav from "./HeaderNav";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "./Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import News from "./News";
import AppText from "./AppText";
import PopUp from "./PopUp";
import Input from "./Input";
import { useAuth } from "../hooks/useAuth";
import {
  getNotificationsByCategory,
  updateNotification,
} from "../services/api/notification-service";
import { NotificationCategory, Notification } from "../models/notification";
import { notify } from "./NotificationContainer";

interface Props {
  profilePictureUrl?: string;
  textContent?: string;
  pageTitle?: string;
  hasReturnButton?: boolean;
  onReturnButtonPress?: () => void;
  hasNewsComponent: boolean;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.deepBlue,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({
      web: 42,
      android: 0,
      ios: 0,
      default: 0,
    }),
    minHeight: 209,
  },
  whiteText: {
    color: "white",
  },
  pageTitle: {
    ...GlobalStyles.h1,
    color: "white",
    marginTop: 24,
    marginBottom: 8,
  },
  returnButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default function AppHeader({
  textContent,
  pageTitle,
  hasReturnButton,
  onReturnButtonPress,
  hasNewsComponent,
}: Props) {
  const [newsVisible, setNewsVisible] = useState(true);
  const [editNewsVisible, setEditNewsVisible] = useState(false);

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  const { token, user } = useAuth();

  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");

  // Fetch the latest notification
  useEffect(() => {
    if (!token) return;
    async function fetchNotification() {
      try {
        const notifications = await getNotificationsByCategory(
          NotificationCategory.HOME_POPUP,
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

  // Function to update the latest notification
  const handleUpdateNotification = async (title: string, text: string) => {
    if (!notification || !token) return;
    try {
      await updateNotification(
        notification.id, // Use the id of the latest notification
        {
          title,
          text,
          notificationCategory: NotificationCategory.HOME_POPUP,
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
      notify({
        title: "PopUp d'accueil mise à jour avec succès",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Une erreur est survenue lors de la mise à jour",
        type: "error",
      });
      console.error("Error updating notification:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator color={Colors.orange} />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: Colors.deepBlue }}>
      <StatusBar backgroundColor={Colors.deepBlue} barStyle="light-content" />
      <View style={styles.container}>
        <HeaderNav />
        <View
          style={{
            marginVertical: "auto",
          }}
        >
          {pageTitle ? <Text style={styles.pageTitle}>{pageTitle}</Text> : null}
          {textContent ? (
            <AppText style={styles.whiteText}>{textContent}</AppText>
          ) : null}
        </View>
        {hasReturnButton && (
          <View style={styles.returnButtonContainer}>
            <Icon name="leftArrow" strokeWidth={1} strokeColor="white" />
            <AppText style={styles.whiteText} onPress={onReturnButtonPress}>
              Retour
            </AppText>
          </View>
        )}
        {hasNewsComponent && newsVisible && (
          <>
            <View
              style={{
                position: "absolute",
                bottom: Platform.OS === "web" ? -24 : -64,
                left: 16,
                width: Platform.OS === "web" ? "92%" : "100%",
              }}
            >
              <News
                onClose={() => {
                  setNewsVisible(!newsVisible);
                }}
                onPress={() => {
                  user?.profileCategory === "admin"
                    ? setEditNewsVisible(!editNewsVisible)
                    : {};
                }}
                title={notification?.title as string}
                text={notification?.text as string}
              />
            </View>
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
                  title="Modifier la notification"
                  onClose={() => setEditNewsVisible(!editNewsVisible)}
                  inputs={
                    <>
                      <Input
                        type="text"
                        label="Titre"
                        placeholder={
                          newsTitle || "ex : Message de l'équipe Hyperion"
                        }
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
