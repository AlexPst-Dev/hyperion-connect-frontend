import React, { useState } from "react";
import { View, ActivityIndicator, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import AppText from "../components/AppText";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const token = await login(email, password);
      await authLogin(token);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <AppText className="text-2xl font-bold mb-6 text-deepBlue">
        Connexion
      </AppText>

      <Input
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        type="email"
        label="Email"
      />
      <Input
        placeholder="Mot de passe"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        type="password"
        label="Mot de passe"
      />
      {error && <AppText style={{ color: "red" }}>{error}</AppText>}
      {loading ? (
        <ActivityIndicator size="large" color="#0A84FF" />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} />
      )}
      <AppText className="text-sm text-gray-500 mt-4">
        Pas encore inscrit ?{" "}
        <AppText
          style={{ textDecorationLine: "underline", color: "#2563EB" }}
          onPress={() => navigation.navigate("Register" as never)}
        >
          Inscrivez-vous ici
        </AppText>
      </AppText>
    </View>
  );
}
