import React, { useState } from "react";
import { View, Button, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerFreeAccount } from "../services/api";
import AppText from "../components/AppText";
import Input from "../components/Input";

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
      <AppText className="text-2xl font-bold text-deepBlue text-center mb-6">
        Inscription
      </AppText>

      <Input
        placeholder="Prénom"
        value={form.firstName}
        label="Prénom"
        type="text"
        onChangeText={(text) => handleChange("firstName", text)}
      />
      <Input
        placeholder="Nom"
        value={form.lastName}
        label="Nom"
        type="text"
        onChangeText={(text) => handleChange("lastName", text)}
      />
      <Input
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        label="Email"
        type="email"
      />
      <Input
        placeholder="Téléphone (optionnel)"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
        label="Téléphone"
        type="phone"
      />
      <Input
        placeholder="Mot de passe"
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
        label="Mot de passe"
        type="password"
      />
      <Input
        placeholder="Confirmer mot de passe"
        value={form.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
        label="Confirmer mot de passe"
        type="password"
      />

      {error ? <AppText style={{ color: "red" }}>{error}</AppText> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0A84FF" />
      ) : (
        <Button title="S'inscrire" onPress={handleSubmit} />
      )}
    </View>
  );
}
