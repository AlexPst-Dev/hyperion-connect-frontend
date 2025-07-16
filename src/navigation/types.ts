import { Category } from "../models/category";
import { ExerciseWithDetails } from "../models/exercise";
import { Session } from "../models/session";
import { User } from "../models/user";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  Main: undefined;
  Profile: undefined;
  Subscription: undefined;
  Legals: undefined;
  Settings: undefined;
  SessionDetail: {
    session: Session;
  };
  ExerciceDetail: {
    exercise: ExerciseWithDetails;
    muscleGroups: Category[];
    isEditable?: boolean;
  };
  PlanningHistory: undefined;
  ContactDetail: {
    contact: User;
  };
  ClientDetail: {
    client: User;
  };
  PartnersList: undefined;
  OffersHistory: {
    companyId: number;
  };
  SessionHistory: undefined;
};
