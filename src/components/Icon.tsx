import React from "react";

import User from "@assets/icons/user-icon.svg";
import Chevron from "@assets/icons/chevron-down-icon.svg";

const icons = {
  user: User,
  chevron: Chevron,
};

type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  width?: number;
  height?: number;
  color?: string;
};

export default function Icon({ name, width = 24, height = 24, color }: Props) {
  const SvgIcon = icons[name];
  return <SvgIcon width={width} height={height} fill={color} />;
}
