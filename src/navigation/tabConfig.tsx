import Icon, { IconName } from "@/src/components/Icon";
import React from "react";
import { Colors } from "../styles/styles";

export const tabIcons: Record<string, IconName> = {
  Accueil: "home",
  Utilisateurs: "user",
  Planning: "calendar",
  Programmes: "dumbell",
  Stats: "stats",
  Statistiques: "stats",
  Santé: "health",
  Communauté: "network",
  Offres: "store",
  Clients: "userFind",
  Sportifs: "userFind",
  Vous: "store",
};

export function getTabBarIcon(routeName: string, focused: boolean) {
  const iconName: IconName = tabIcons[routeName] || "eye";

  return (
    <Icon
      name={iconName}
      width={24}
      height={24}
      strokeWidth={2}
      fillColor={focused ? Colors.deepBlue : "transparent"}
      strokeColor={Colors.deepBlue}
    />
  );
}
