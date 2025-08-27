import React, { useState } from "react";
import {
  View,
  Button,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerFreeAccount } from "../services/api";
import AppText from "../components/AppText";
import Input from "../components/Input";
import GlobalStyles, { Colors } from "../styles/styles";
import { getImageSource } from "../utils/imgSrcHandler";
import AppButton from "../components/AppButton";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        GlobalStyles.pageStyle,
        { backgroundColor: Colors.deepBlue, paddingTop: 32 },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
            <AppText style={[GlobalStyles.h2]}>REJOIGNEZ HYPERION</AppText>
            <AppText>
              Inscrivez-vous et boostez votre performance sportive avec nos
              experts !
            </AppText>
          </View>
          <ScrollView
            style={{
              flexDirection: "column",
              gap: 16,
            }}
          >
            <Input
              placeholder="Prénom"
              value={form.firstName}
              label="Prénom *"
              type="text"
              onChangeText={(text) => handleChange("firstName", text)}
            />
            <Input
              placeholder="Nom"
              value={form.lastName}
              label="Nom *"
              type="text"
              onChangeText={(text) => handleChange("lastName", text)}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              label="Email *"
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
              label="Mot de passe *"
              type="password"
            />
            <Input
              placeholder="Confirmer mot de passe"
              value={form.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              label="Confirmer mot de passe  *"
              type="password"
            />
          </ScrollView>

          {error ? <AppText style={{ color: "red" }}>{error}</AppText> : null}

          {loading ? (
            <ActivityIndicator size="large" color="#0A84FF" />
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppText
                onPress={() => {
                  if (!loading) {
                    navigation.navigate("Login" as never);
                  }
                }}
              >
                Annuler
              </AppText>
              <AppButton
                type="primary"
                iconName="check"
                title="Valider"
                onPress={handleSubmit}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
