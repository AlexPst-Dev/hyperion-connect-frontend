import { ObjectivesApiService } from "../services/api/objective-service";
import { Objective as ObjectiveModel } from "../models/objective";

export async function addSportsmanToCoachObjective({
  sportsmanId,
  coachId,
  label,
  startDate,
  endDate,
  token,
}: {
  sportsmanId: number;
  coachId: number;
  label: string;
  startDate: string;
  endDate: string;
  token: string;
}): Promise<ObjectiveModel | null> {
  try {
    const objectivePayload = {
      sportsmanId,
      responsibleId: coachId,
      label,
      startDate,
      endDate,
      isActive: true,
    };
    const res = await ObjectivesApiService.createObjective(
      objectivePayload,
      token
    );
    return res.objective;
  } catch (e) {
    console.error("Erreur lors de la création de l'objectif :", e);
    return null;
  }
}
