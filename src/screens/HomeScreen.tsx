import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Icon name="user" width={24} height={24} />
      <Text className="text-2xl font-bold text-deepBlue">
        Bienvenue {user?.firstName} {user?.lastName} 👋
      </Text>
    </View>
  );
}
