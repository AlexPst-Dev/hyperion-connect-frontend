import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import AppText from "../components/AppText";
import GlobalStyles, { Colors } from "../styles/styles";
import AppButton from "../components/AppButton";
import { getImageSource } from "../utils/imgSrcHandler";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    // Validation basique
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format d'email invalide");
      return;
    }

    try {
      console.log("Tentative de connexion avec:", email.trim());
      await login({ email: email.trim(), password });
      console.log("Connexion réussie !");
      // La navigation sera gérée automatiquement par AppNavigator
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      // Afficher le message d'erreur sur l'interface
      setError(error.message || "Une erreur est survenue lors de la connexion");
    }
  };

  // Animation handler
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450, // duration in ms
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
              <AppText style={[GlobalStyles.h2]}>SE CONNECTER</AppText>
              <AppText>Vous avez déjà un compte ?</AppText>
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

              <Input
                placeholder="Mot de passe"
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                value={password}
                type="password"
                label="Mot de passe"
              />
            </View>

            {/* Message d'erreur affiché sous les champs */}
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
                title="Se connecter"
                iconName="login"
                type="primary"
                buttonStyle={{ alignSelf: "flex-end" }}
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim()}
              />
            )}

            <AppText>
              Pas encore inscrit ?{" "}
              <AppText
                style={{
                  textDecorationLine: "underline",
                  color: "#2563EB",
                }}
                onPress={() => {
                  if (!isLoading) {
                    navigation.navigate("Register" as never);
                  }
                }}
              >
                Inscrivez-vous ici
              </AppText>
            </AppText>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
