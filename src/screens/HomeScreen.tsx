import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import Input from "../components/Input";
import AppText from "../components/AppText";

export default function HomeScreen() {
  const { user } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [birthDate, setBirthDate] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="justify-center items-center bg-white mb-6">
          <Icon name="user" width={24} height={24} />
          <Text className="text-2xl font-bold text-deepBlue">
            Bienvenue {user?.firstName} {user?.lastName} 👋
          </Text>
        </View>

        <AppText style={{ fontFamily: "Montserrat-Regular", fontSize: 24 }}>
          Test composant Input
        </AppText>

        <Input
          type="checkbox"
          label="Sélectionner"
          value={isChecked}
          onChange={(val) => setIsChecked(val)}
        />
        <Text>Valeur actuelle: {isChecked ? "✅" : "❌"}</Text>

        <Input type="email" label="Email" placeholder="Entrez votre email" />
        <Input
          type="password"
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          secureTextEntry={true}
        />
        <Input
          type="textarea"
          label="Description"
          placeholder="Entrez votre description"
        />
        <Input
          type="selector"
          label="Choisissez une option"
          value={selectedOption}
          onChangeText={setSelectedOption}
        />
        <Input
          type="date"
          label="Date de naissance"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="JJ/MM/AAAA"
        />
        <Input type="number" label="Sélectionner un nombre" placeholder="XX" />
        <Input
          type="text"
          label="Entrez du texte ici"
          placeholder="Lorem ipsum dolor sit amet"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
