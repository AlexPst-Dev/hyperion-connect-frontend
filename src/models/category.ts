export enum CategoryType {
  SPORT = "sport",
  MEDICAL = "medical",
  MUSCLE_GROUP = "muscle_group",
}

export interface Category {
  id: number;
  label: string;
  backgroundColor: string;
  textColor: string;
  categoryType: CategoryType;
  createdAt: string;
  updatedAt: string;
}
