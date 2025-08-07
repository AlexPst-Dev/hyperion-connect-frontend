import { User } from "./user";

export interface Contact {
  id: number;
  user: User;
  userId: number;
  listOfContactIds: string;
}
