import React, { useRef, useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Input from "../../components/Input";
import AppText from "../../components/AppText";
import GlobalStyles, { Colors } from "../../styles/styles";
import AppButton from "../../components/AppButton";
import { getImageSource } from "../../utils/imgSrcHandler";
import { notify } from "../../components/NotificationContainer";
import env from "@/env";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute<any>();
  const token = route.params?.token;

  const handleReset = async () => {
    if (!password || !confirm) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${env.API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Erreur lors de la réinitialisation");

      notify({ title: "Mot de passe réinitialisé ✅", type: "success" });
      navigation.navigate("Login" as never);
    } catch (err: any) {
      notify({ title: `Erreur: ${err.message}`, type: "error" });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation handler
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const screenWidth = Dimensions.get("window").width;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[GlobalStyles.pageStyle, { backgroundColor: Colors.deepBlue }]}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim, paddingTop: 32 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={Platform.OS === "web" ? { maxHeight: screenWidth + 180 } : {}}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 32,
            }}
          >
            <Image
              source={getImageSource("white-logo")}
              style={{ width: 92, height: 87 }}
            />
            <View style={{ flexDirection: "column" }}>
              <AppText style={[GlobalStyles.h1, { color: "white" }]}>
                HYPERION
              </AppText>
              <AppText style={[GlobalStyles.h1, { color: "white" }]}>
                CONNECT
              </AppText>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 32,
              borderRadius: 16,
              flexDirection: "column",
              gap: 24,
            }}
          >
            <View style={{ flexDirection: "column", gap: 8 }}>
              <AppText style={[GlobalStyles.h2]}>
                Réinitialiser le mot de passe
              </AppText>
              <AppText>Entrez votre nouveau mot de passe ci-dessous.</AppText>
            </View>

            <View style={{ flexDirection: "column", gap: 16 }}>
              <Input
                placeholder="Nouveau mot de passe"
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                value={password}
                type="password"
                label="Nouveau mot de passe"
              />

              <Input
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                onChangeText={(text) => {
                  setConfirm(text);
                  if (error) setError(null);
                }}
                value={confirm}
                type="password"
                label="Confirmer"
              />
            </View>

            {error && (
              <View
                style={{
                  width: "100%",
                  marginTop: 10,
                  marginBottom: 16,
                  paddingHorizontal: 16,
                  backgroundColor: "#FEF2F2",
                  borderRadius: 8,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#EF4444",
                }}
              >
                <AppText
                  style={{
                    color: "#DC2626",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </AppText>
              </View>
            )}

            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#0A84FF"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <AppButton
                title="Valider"
                iconName="check"
                type="primary"
                buttonStyle={{ alignSelf: "flex-end" }}
                onPress={handleReset}
                disabled={!password.trim() || !confirm.trim()}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
