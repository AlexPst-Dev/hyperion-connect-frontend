import React from "react";
import { Platform, Pressable } from "react-native";
// Import SVGs
import User from "@assets/icons/user-icon.svg";
import ChevronDown from "@assets/icons/chevron-down-icon.svg";
import ChevronUp from "@assets/icons/chevron-up-icon.svg";
import ChevronRight from "@assets/icons/chevron-right-icon.svg";
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
import Close from "@assets/icons/close-icon.svg";
import Objective from "@assets/icons/objective-icon.svg";
import Calendar from "@assets/icons/calendar-icon.svg";
import CalendarAdd from "@assets/icons/calendar-add-icon.svg";
import Information from "@assets/icons/information-icon.svg";
import Dumbell from "@assets/icons/dumbell-icon.svg";
import Timer from "@assets/icons/timer-icon.svg";
import Circle from "@assets/icons/circle-icon.svg";
import CircleChecked from "@assets/icons/circle-checked-icon.svg";
import MapAdd from "@assets/icons/map-add-icon.svg";
import Home from "@assets/icons/home-icon.svg";
import Stats from "@assets/icons/stats-icon.svg";
import Health from "@assets/icons/health-icon.svg";
import Store from "@assets/icons/store-icon.svg";
import Network from "@assets/icons/network-icon.svg";
import UserFind from "@assets/icons/user-find-icon.svg";
import Handshake from "@assets/icons/handshake-icon.svg";
import Medal from "@assets/icons/medal-icon.svg";
import Medic from "@assets/icons/medic-icon.svg";
import Run from "@assets/icons/run-icon.svg";
import Star from "@assets/icons/star-icon.svg";
import Download from "@assets/icons/download-icon.svg";
import Trash from "@assets/icons/trash-icon.svg";
import LinkDenied from "@assets/icons/link-denied-icon.svg";
import Billing from "@assets/icons/billing-icon.svg";
import Archive from "@assets/icons/archive-icon.svg";
import Ticket from "@assets/icons/ticket-icon.svg";
import Hearth from "@assets/icons/hearth-icon.svg";
import Image from "@assets/icons/image-icon.svg";
import Paperclip from "@assets/icons/paperclip-icon.svg";

const icons = {
  user: User,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
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
  close: Close,
  objective: Objective,
  calendar: Calendar,
  information: Information,
  dumbell: Dumbell,
  timer: Timer,
  circle: Circle,
  circleChecked: CircleChecked,
  mapAdd: MapAdd,
  calendarAdd: CalendarAdd,
  home: Home,
  stats: Stats,
  health: Health,
  store: Store,
  network: Network,
  userFind: UserFind,
  handshake: Handshake,
  medal: Medal,
  medic: Medic,
  run: Run,
  star: Star,
  download: Download,
  trash: Trash,
  linkDenied: LinkDenied,
  billing: Billing,
  archive: Archive,
  ticket: Ticket,
  hearth: Hearth,
  image: Image,
  paperclip: Paperclip,
};

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  onPress?: () => void;
};

export default function Icon({
  name,
  width = 24,
  height = 24,
  strokeColor,
  fillColor,
  strokeWidth = 2,
  onPress,
}: Props) {
  const SvgIcon = icons[name];
  const webColorStyle: boolean = Platform.OS === "web" ? true : false;

  const svg = (
    <SvgIcon
      width={width}
      height={height}
      stroke={strokeColor}
      fill={fillColor}
      strokeWidth={strokeWidth}
      style={webColorStyle ? { color: "transparent" } : ("" as any)}
    />
  );

  // Wrap only if onPress is defined
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
        })}
      >
        {svg}
      </Pressable>
    );
  }

  return svg;
}
