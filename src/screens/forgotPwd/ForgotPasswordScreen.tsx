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
import { useNavigation } from "@react-navigation/native";
import Input from "../../components/Input";
import AppText from "../../components/AppText";
import GlobalStyles, { Colors } from "../../styles/styles";
import AppButton from "../../components/AppButton";
import { getImageSource } from "../../utils/imgSrcHandler";
import { notify } from "../../components/NotificationContainer";
import env from "@/env";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Veuillez saisir votre email");
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format d'email invalide");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${env.API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Erreur lors de l'envoi du mail");

      notify({
        title: "📩 Vérifiez votre boîte mail",
        type: "success",
      });
      navigation.goBack();
    } catch (err: any) {
      notify({
        title: `Erreur: ${err.message}`,
        type: "error",
      });
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
          {/* Logo & titre */}
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

          {/* Card */}
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
              <AppText style={[GlobalStyles.h2]}>Mot de passe oublié</AppText>
              <AppText>
                Entrez votre adresse e-mail pour recevoir un lien de
                réinitialisation.
              </AppText>
            </View>

            <View style={{ flexDirection: "column", gap: 16 }}>
              <Input
                placeholder="Email"
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                value={email}
                type="email"
                label="Email"
              />
            </View>

            {/* Message d'erreur */}
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

            {/* Bouton */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#0A84FF"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <AppButton
                title="Envoyer le lien"
                iconName="send"
                type="primary"
                buttonStyle={{ alignSelf: "flex-end" }}
                onPress={handleForgotPassword}
                disabled={!email.trim()}
              />
            )}

            <AppText
              style={{
                textDecorationLine: "underline",
                color: "#2563EB",
              }}
              onPress={() => {
                if (!isLoading) {
                  navigation.goBack();
                }
              }}
            >
              Retour à la connexion
            </AppText>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
