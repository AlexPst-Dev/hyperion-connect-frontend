import { Category } from "./category";
import { Company } from "./company";
import { Graph } from "./graph";
import { Subscription } from "./subscription";

// types/enums.ts
export enum ProfileCategory {
  SPORTSMAN = "sportsman",
  COACH = "coach",
  MEDIC = "medic",
  FREE = "free",
  PARTNER = "partner",
  ADMIN = "admin",
}

// models/User.ts
export interface BaseUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  description?: string;
  image?: string;
  birthDate?: string;
  stravaLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  linkedinLink?: string;
  tiktokLink?: string;
  youtubeLink?: string;
  isActive: boolean;
  profileCategory: ProfileCategory;
  createdAt: string;
  updatedAt: string;
}

export interface SportsmanProfile {
  id: number;
  user: BaseUser;
  sportCategory?: Category;
  sportCategoryId?: number;
  availableDays?: string; // Format: "1010100" (7 caractersfor the days of the week)
  availableTime?: string;
  listMedicNotes?: string;
  listMedicFiles?: string;
  listMedicsIds?: string;
  graph?: Graph;
  graphId?: number;
  subscription?: Subscription;
  subscriptionId?: number;
}

export interface CoachProfile {
  id: number;
  user: BaseUser;
  sportCategory?: Category;
  sportCategoryId?: number;
  canImportSessions: boolean;
}

export interface MedicProfile {
  id: number;
  user: BaseUser;
  medicCategory?: Category;
  medicCategoryId?: number;
  canImportSessions: boolean;
}

export interface FreeProfile {
  id: number;
  user: BaseUser;
}

export interface PartnerProfile {
  id: number;
  user: BaseUser;
  company?: Company;
  companyId?: number;
}

export interface AdminProfile {
  id: number;
  user: BaseUser;
}

// Union type pour tous les profils possibles
export type UserProfile =
  | SportsmanProfile
  | CoachProfile
  | MedicProfile
  | FreeProfile
  | PartnerProfile
  | AdminProfile;

// Type principal User avec profil intégré
export interface User extends BaseUser {
  profile?: UserProfile;
}

// Types pour les différents utilisateurs avec profil spécifique
export interface SportsmanUser extends BaseUser {
  profileCategory: ProfileCategory.SPORTSMAN;
  profile: SportsmanProfile;
}

export interface CoachUser extends BaseUser {
  profileCategory: ProfileCategory.COACH;
  profile: CoachProfile;
}

export interface MedicUser extends BaseUser {
  profileCategory: ProfileCategory.MEDIC;
  profile: MedicProfile;
}

export interface FreeUser extends BaseUser {
  profileCategory: ProfileCategory.FREE;
  profile: FreeProfile;
}

export interface PartnerUser extends BaseUser {
  profileCategory: ProfileCategory.PARTNER;
  profile: PartnerProfile;
}

export interface AdminUser extends BaseUser {
  profileCategory: ProfileCategory.ADMIN;
  profile: AdminProfile;
}

// Type guard functions pour vérifier le type d'utilisateur
export const isSportsmanUser = (user: User): user is SportsmanUser => {
  return user.profileCategory === ProfileCategory.SPORTSMAN;
};

export const isCoachUser = (user: User): user is CoachUser => {
  return user.profileCategory === ProfileCategory.COACH;
};

export const isMedicUser = (user: User): user is MedicUser => {
  return user.profileCategory === ProfileCategory.MEDIC;
};

export const isFreeUser = (user: User): user is FreeUser => {
  return user.profileCategory === ProfileCategory.FREE;
};

export const isPartnerUser = (user: User): user is PartnerUser => {
  return user.profileCategory === ProfileCategory.PARTNER;
};

export const isAdminUser = (user: User): user is AdminUser => {
  return user.profileCategory === ProfileCategory.ADMIN;
};

// Types pour les payloads de création/mise à jour
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  description?: string;
  birthDate?: string;
  stravaLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  linkedinLink?: string;
  tiktokLink?: string;
  profileCategory: ProfileCategory;
}

export interface CreateSportsmanPayload extends CreateUserPayload {
  profileCategory: ProfileCategory.SPORTSMAN;
  sportCategoryId?: number;
  availableDays?: string;
  availableTime?: string;
  subscriptionId?: number;
}

export interface CreateCoachPayload extends CreateUserPayload {
  profileCategory: ProfileCategory.COACH;
  sportCategoryId?: number;
  canImportSessions?: boolean;
}

export interface CreateMedicPayload extends CreateUserPayload {
  profileCategory: ProfileCategory.MEDIC;
  medicCategoryId?: number;
  canImportSessions?: boolean;
}

export interface CreatePartnerPayload extends CreateUserPayload {
  profileCategory: ProfileCategory.PARTNER;
  companyId?: number;
}

// Type union pour tous les payloads de création
export type CreateUserProfilePayload =
  | CreateUserPayload
  | CreateSportsmanPayload
  | CreateCoachPayload
  | CreateMedicPayload
  | CreatePartnerPayload;

// Types pour les réponses API
export interface UserResponse {
  user: User;
  profile?: UserProfile;
}

// Utilitaires pour les jours disponibles (pour les sportifs)
export interface AvailableDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export const parseAvailableDays = (daysString?: string): AvailableDays => {
  if (!daysString || daysString.length !== 7) {
    return {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
  }

  return {
    monday: daysString[0] === "1",
    tuesday: daysString[1] === "1",
    wednesday: daysString[2] === "1",
    thursday: daysString[3] === "1",
    friday: daysString[4] === "1",
    saturday: daysString[5] === "1",
    sunday: daysString[6] === "1",
  };
};

export const stringifyAvailableDays = (days: AvailableDays): string => {
  return [
    days.monday ? "1" : "0",
    days.tuesday ? "1" : "0",
    days.wednesday ? "1" : "0",
    days.thursday ? "1" : "0",
    days.friday ? "1" : "0",
    days.saturday ? "1" : "0",
    days.sunday ? "1" : "0",
  ].join("");
};

export function formatAvailableDays(days: AvailableDays): string {
  const dayNames = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];
  return dayNames
    .filter((d) => days[d.key as keyof AvailableDays])
    .map((d) => d.label)
    .join(", ");
}

const TIME_SLOTS = [
  "07h00 - 10h00",
  "10h00 - 13h00",
  "13h00 - 16h00",
  "16h00 - 19h00",
  "19h00 - 22h00",
];

// Parse a binary string like "10100" into an array of booleans
export function parseAvailableTimeSlots(slotsString?: string): boolean[] {
  if (!slotsString || slotsString.length !== TIME_SLOTS.length) {
    return Array(TIME_SLOTS.length).fill(false);
  }
  return slotsString.split("").map((c) => c === "1");
}

// Format the selected slots into a readable string
export function formatAvailableTimeSlots(slotsString?: string): string {
  const selected = parseAvailableTimeSlots(slotsString)
    .map((selected, idx) => (selected ? TIME_SLOTS[idx] : null))
    .filter(Boolean);
  return selected.length > 0 ? selected.join(", ") : "Aucun créneau";
}

export function getMonthStartDates(start: string, end: string): string[] {
  const result: string[] = [];
  let current = new Date(start);
  const endDate = new Date(end);

  // Always use the first day of the month for billing
  current.setDate(1);

  while (current <= endDate) {
    result.push(current.toISOString().slice(0, 10));
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}
