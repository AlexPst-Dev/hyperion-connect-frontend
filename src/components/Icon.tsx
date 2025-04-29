import React from "react";
import { Platform } from "react-native";
import User from "@assets/icons/user-icon.svg";
import Chevron from "@assets/icons/chevron-down-icon.svg";
import Login from "@assets/icons/login-icon.svg";
import Pencil from "@assets/icons/pencil-icon.svg";
import Send from "@assets/icons/send-icon.svg";
import Plus from "@assets/icons/plus-icon.svg";
import Check from "@assets/icons/check-icon.svg";
import Eye from "@assets/icons/eye-icon.svg";
import Message from "@assets/icons/message-icon.svg";
import Mail from "@assets/icons/mail-icon.svg";
import Phone from "@assets/icons/phone-icon.svg";
import Link from "@assets/icons/link-icon.svg";
import QrCode from "@assets/icons/qr-code-icon.svg";
import LeftArrow from "@assets/icons/left-arrow-icon.svg";
import Settings from "@assets/icons/settings-icon.svg";
import Legals from "@assets/icons/legals-icon.svg";
import Subscription from "@assets/icons/subscription-icon.svg";

const icons = {
  user: User,
  chevron: Chevron,
  login: Login,
  pencil: Pencil,
  send: Send,
  plus: Plus,
  check: Check,
  eye: Eye,
  message: Message,
  mail: Mail,
  phone: Phone,
  link: Link,
  qrCode: QrCode,
  leftArrow: LeftArrow,
  settings: Settings,
  legals: Legals,
  subscription: Subscription,
};

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
};

export default function Icon({
  name,
  width = 24,
  height = 24,
  strokeColor,
  fillColor,
  strokeWidth = 2,
}: Props) {
  const webColorStyle: boolean = Platform.OS === "web" ? true : false;
  const SvgIcon = icons[name];
  return (
    <SvgIcon
      width={width}
      height={height}
      stroke={strokeColor}
      fill={fillColor}
      style={webColorStyle ? { color: "transparent" } : ("" as any)}
      strokeWidth={strokeWidth}
    />
  );
}
