// LogoutButton.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <TouchableOpacity onPress={handleLogout} className="px-4">
      <Text className="text-red-500 font-semibold">Déconnexion</Text>
    </TouchableOpacity>
  );
}
