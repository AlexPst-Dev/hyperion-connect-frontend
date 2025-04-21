import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    try {
      const token = await login(email, password);
      await authLogin(token);
      navigation.navigate("Home" as never);
    } catch (error) {
      Alert.alert("Erreur", "Échec de la connexion");
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
      <TouchableOpacity
        className="w-full bg-deepBlue py-3 rounded-lg"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-semibold">
          Se connecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}
