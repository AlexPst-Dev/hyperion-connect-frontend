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
    session: {
      title: string;
      nbExercises: number;
      durationTime: number;
      isEditable?: boolean;
    };
  };
  ExerciceDetail: {
    exercice: {
      title: string;
      durationTime: number;
      isEditable?: boolean;
    };
  };
};
