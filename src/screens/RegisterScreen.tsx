import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerFreeAccount } from "../services/api";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { firstName, lastName, email, password, confirmPassword } = form;
    setError("");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await registerFreeAccount(form);
      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.goBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-deepBlue text-center mb-6">
        Inscription
      </Text>

      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Prénom"
        value={form.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
      />
      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Nom"
        value={form.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
      />
      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Téléphone (optionnel)"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
        keyboardType="phone-pad"
      />
      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Mot de passe"
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
      />
      <TextInput
        className="border px-4 py-2 rounded-xl mb-3"
        placeholder="Confirmer mot de passe"
        value={form.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
        secureTextEntry
      />

      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0A84FF" />
      ) : (
        <Button title="S'inscrire" onPress={handleSubmit} />
      )}
    </View>
  );
}
