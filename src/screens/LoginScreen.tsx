import React, { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/api";
import { useAuth } from "../hooks/useAuth";

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
      navigation.navigate("Home" as never);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-6 text-deepBlue">Connexion</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
        placeholder="Mot de passe"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {error && <Text className="text-red-500 mt-4 text-center">{error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color="#0A84FF" />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} />
      )}
    </View>
  );
}
