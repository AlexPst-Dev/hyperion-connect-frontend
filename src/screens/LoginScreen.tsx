import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import AppText from "../components/AppText";

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

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <AppText className="text-2xl font-bold mb-6 text-deepBlue">
        Connexion
      </AppText>

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
        <Button
          title="Se connecter"
          onPress={handleLogin}
          disabled={!email.trim() || !password.trim()}
        />
      )}

      <AppText className="text-sm text-gray-500 mt-4">
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
  );
}
