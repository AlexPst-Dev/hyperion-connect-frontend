import { Session } from "./session";

export enum EventCategory {
  HYPERION = "hyperion_event",
  HYPERLINK = "hyperlink_event",
  MEDICAL = "medical_event",
  COACHING = "coaching_event",
  SPORTING_ACTIVITY = "sporting_activity",
}

export interface Event {
  id: number;
  eventCategory: EventCategory;
  responsibleIds: string | null;
  personOngoingIds: string | null;
  title: string | null;
  location: string | null;
  date: string | null;
  time: string | null;
  description: string | null;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HyperionEvent {
  id: number;
  event: Event;
}

export interface HyperlinkEvent {
  id: number;
  event: Event;
  theme: string | null;
}

export interface CoachingEvent {
  id: number;
  event: Event;
  session: Session | null;
  sessionId: number | null;
  isDone: boolean;
  sportsmanComment: string | null;
  sportsmanNote: string | null;
  coachComment: string | null;
  coachNote: string | null;
}

export interface MedicalEvent {
  id: number;
  event: Event;
}

export interface SportingActivityEvent {
  id: number;
  event: Event;
  maxParticipants: number | null;
}

export type EventWithDetails =
  | (Event & { hyperionDetails: HyperionEvent })
  | (Event & { hyperlinkDetails: HyperlinkEvent })
  | (Event & { coachingDetails: CoachingEvent })
  | (Event & { medicalDetails: MedicalEvent })
  | (Event & { sportingActivityDetails: SportingActivityEvent });

export interface CreateEvent {
  eventCategory: EventCategory;
  responsibleIds?: string;
  personOngoingIds?: string;
  location?: string;
  title?: string;
  date?: string;
  time?: string;
  description?: string;
  link?: string;
  isActive?: boolean;
}

export interface CreateHyperionEvent {
  // No specific props
}

export interface CreateHyperlinkEvent {
  theme?: string;
}

export interface CreateCoachingEvent {
  sessionId?: number;
  isDone?: boolean;
  sportsmanComment?: string;
  sportsmanNote?: string;
  coachComment?: string;
  coachNote?: string;
}

export interface CreateMedicalEvent {
  // No specific props
}

export interface CreateSportingActivityEvent {
  maxParticipants?: number;
}

export interface CreateEventWithHyperion extends CreateEvent {
  eventCategory: EventCategory.HYPERION;
  hyperionDetails?: CreateHyperionEvent;
}

export interface CreateEventWithHyperlink extends CreateEvent {
  eventCategory: EventCategory.HYPERLINK;
  hyperlinkDetails?: CreateHyperlinkEvent;
}

export interface CreateEventWithCoaching extends CreateEvent {
  eventCategory: EventCategory.COACHING;
  coachingDetails?: CreateCoachingEvent;
}

export interface CreateEventWithMedical extends CreateEvent {
  eventCategory: EventCategory.MEDICAL;
  medicalDetails?: CreateMedicalEvent;
}

export interface CreateEventWithSportingActivity extends CreateEvent {
  eventCategory: EventCategory.SPORTING_ACTIVITY;
  sportingActivityDetails?: CreateSportingActivityEvent;
}

export type CreateEventComplete =
  | CreateEventWithHyperion
  | CreateEventWithHyperlink
  | CreateEventWithCoaching
  | CreateEventWithMedical
  | CreateEventWithSportingActivity;

export interface UpdateEvent {
  responsibleIds?: string | null;
  personOngoingIds?: string | null;
  title?: string;
  location?: string | null;
  date?: string | null;
  time?: string | null;
  description?: string | null;
  link?: string | null;
  isActive?: boolean;
  theme?: string | null;
}

export interface UpdateHyperionEvent {
  id: number;
  // No specific props to update
}

export interface UpdateHyperlinkEvent {
  id: number;
  theme?: string | null;
}

export interface UpdateCoachingEvent {
  id: number;
  sessionId?: number | null;
  isDone?: boolean;
  sportsmanComment?: string | null;
  sportsmanNote?: string | null;
  coachComment?: string | null;
  coachNote?: string | null;
}

export interface UpdateMedicalEvent {
  id: number;
  // No specific props to update
}

export interface UpdateSportingActivityEvent {
  id: number;
  maxParticipants?: number | null;
}

export interface EventResponse {
  id: number;
  eventCategory: EventCategory;
  responsibleIds: string | null;
  personOngoingIds: string | null;
  title: string | null;
  location: string | null;
  date: string | null;
  time: string | null;
  description: string | null;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HyperionEventResponse {
  id: number;
}

export interface HyperlinkEventResponse {
  id: number;
  theme: string | null;
}

export interface CoachingEventResponse {
  id: number;
  sessionId: number | null;
  isDone: boolean;
  sportsmanComment: string | null;
  sportsmanNote: string | null;
  coachComment: string | null;
  coachNote: string | null;
}

export interface MedicalEventResponse {
  id: number;
}

export interface SportingActivityEventResponse {
  id: number;
  maxParticipants: number | null;
}

export interface EventWithHyperionResponse extends EventResponse {
  eventCategory: EventCategory.HYPERION;
  hyperionDetails: HyperionEventResponse;
}

export interface EventWithHyperlinkResponse extends EventResponse {
  eventCategory: EventCategory.HYPERLINK;
  hyperlinkDetails: HyperlinkEventResponse;
}

export interface EventWithCoachingResponse extends EventResponse {
  eventCategory: EventCategory.COACHING;
  coachingDetails: CoachingEventResponse;
}

export interface EventWithMedicalResponse extends EventResponse {
  eventCategory: EventCategory.MEDICAL;
  medicalDetails: MedicalEventResponse;
}

export interface EventWithSportingActivityResponse extends EventResponse {
  eventCategory: EventCategory.SPORTING_ACTIVITY;
  sportingActivityDetails: SportingActivityEventResponse;
}

export type EventCompleteResponse =
  | EventWithHyperionResponse
  | EventWithHyperlinkResponse
  | EventWithCoachingResponse
  | EventWithMedicalResponse
  | EventWithSportingActivityResponse;

export const mapEventResponse = (response: EventResponse): Event => ({
  id: response.id,
  eventCategory: response.eventCategory,
  responsibleIds: response.responsibleIds,
  personOngoingIds: response.personOngoingIds,
  title: response.title,
  location: response.location,
  date: response.date ? new Date(response.date).toString() : null,
  time: response.time,
  description: response.description,
  link: response.link,
  isActive: response.isActive,
  createdAt: new Date(response.createdAt).toString(),
  updatedAt: new Date(response.updatedAt).toString(),
});

export const mapHyperionEventResponse = (
  response: HyperionEventResponse,
  event: Event
): HyperionEvent => ({
  id: response.id,
  event,
});

export const mapHyperlinkEventResponse = (
  response: HyperlinkEventResponse,
  event: Event
): HyperlinkEvent => ({
  id: response.id,
  event,
  theme: response.theme,
});

export const mapCoachingEventResponse = (
  response: CoachingEventResponse,
  event: Event,
  session?: Session
): CoachingEvent => ({
  id: response.id,
  event,
  session: session || null,
  sessionId: response.sessionId,
  isDone: response.isDone,
  sportsmanComment: response.sportsmanComment,
  sportsmanNote: response.sportsmanNote,
  coachComment: response.coachComment,
  coachNote: response.coachNote,
});

export const mapMedicalEventResponse = (
  response: MedicalEventResponse,
  event: Event
): MedicalEvent => ({
  id: response.id,
  event,
});

export const mapSportingActivityEventResponse = (
  response: SportingActivityEventResponse,
  event: Event
): SportingActivityEvent => ({
  id: response.id,
  event,
  maxParticipants: response.maxParticipants,
});

export const isHyperionEvent = (
  event: EventCompleteResponse
): event is EventWithHyperionResponse => {
  return event.eventCategory === EventCategory.HYPERION;
};

export const isHyperlinkEvent = (
  event: EventCompleteResponse
): event is EventWithHyperlinkResponse => {
  return event.eventCategory === EventCategory.HYPERLINK;
};

export const isCoachingEvent = (
  event: EventCompleteResponse
): event is EventWithCoachingResponse => {
  return event.eventCategory === EventCategory.COACHING;
};

export const isMedicalEvent = (
  event: EventCompleteResponse
): event is EventWithMedicalResponse => {
  return event.eventCategory === EventCategory.MEDICAL;
};

export const isSportingActivityEvent = (
  event: EventCompleteResponse
): event is EventWithSportingActivityResponse => {
  return event.eventCategory === EventCategory.SPORTING_ACTIVITY;
};

export const DEFAULT_EVENT_VALUES = {
  isActive: true,
  isDone: false, // For coaching events
} as const;

export const parseIds = (ids: string | null): number[] => {
  if (!ids) return [];
  try {
    return JSON.parse(ids);
  } catch {
    return ids
      .split(";")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  }
};

export const stringifyIds = (ids: number[]): string => {
  return JSON.stringify(ids);
};
