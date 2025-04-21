// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { RootStackParamList } from "../navigation/types";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = () => {
    console.log("Login with", email, password);
    // Redirect to home
    navigation.navigate("Home");
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-6 text-deepBlue">Connexion</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
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
