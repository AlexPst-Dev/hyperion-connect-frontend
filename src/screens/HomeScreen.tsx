import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import AppText from "../components/AppText";
import { notify } from "../components/NotificationContainer";
import GlobalStyles from "../styles/styles";
import styles from "../styles/styles";

export default function HomeScreen() {
  const { user } = useAuth();

  const handleNotificationInfo = () => {
    notify({
      title: "Voici une info dynamique !",
      type: "information",
    });
  };
  const handleNotificationSuccess = () => {
    notify({
      title: "Voici une notif de succes",
      type: "success",
    });
  };
  const handleNotificationError = () => {
    notify({
      title: "Voici une grosse erreur",
      type: "error",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="justify-center items-center bg-white mb-6">
          <Icon name="user" width={24} height={24} />
          <Text className="text-2xl font-bold text-deepBlue">
            Bienvenue {user?.firstName} {user?.lastName} 👋
          </Text>
        </View>

        <AppText style={GlobalStyles.h1}>Test composant Notifications</AppText>

        <Pressable
          style={GlobalStyles.button_primary}
          onPress={handleNotificationInfo}
        >
          <Text style={styles.buttonText}>Afficher une notification</Text>
        </Pressable>
        <View style={{ marginBottom: 24 }}></View>
        <Pressable
          style={GlobalStyles.button_primary}
          onPress={handleNotificationSuccess}
        >
          <Text style={styles.buttonText}>Afficher une notification</Text>
        </Pressable>
        <View style={{ marginBottom: 24 }}></View>
        <Pressable
          style={GlobalStyles.button_primary}
          onPress={handleNotificationError}
        >
          <Text style={styles.buttonText}>Afficher une notification</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
