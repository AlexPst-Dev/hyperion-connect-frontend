import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-deepBlue">
        Bienvenue {user?.firstName} {user?.lastName} 👋
      </Text>
    </View>
  );
}
