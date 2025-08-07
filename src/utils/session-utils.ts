import { Session } from "../models/session";
import { exerciseService } from "../services/api/exercise-service";

export async function getSessionExercisesAndStats(
  session: Session,
  token: string
) {
  // Parse exercise IDs from the session's listExercises string
  const exerciseIds = session.listExercises
    .split(/[;,]\s*/)
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  // Fetch all exercises in parallel
  const exerciseResults = await Promise.all(
    exerciseIds.map(async (id) => {
      try {
        const { exercice } = await exerciseService.getExerciseById(id, token);
        return exercice;
      } catch {
        return null; // Ignore invalid/missing exercises
      }
    })
  );

  // Filter out nulls (invalid exercises)
  const validExercises = exerciseResults.filter(Boolean);

  // Sum durations (assuming each exercise has a durationTime string "HH:MM:SS")
  const totalDurationSeconds = validExercises.reduce((sum, ex) => {
    if (!ex || !ex.durationTime) return sum;
    const [h, m, s] = ex.durationTime.split(":").map(Number);
    return sum + (h * 3600 + m * 60 + s);
  }, 0);

  // Convert total seconds to minutes (or keep as seconds if you prefer)
  const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

  return {
    validExercises,
    nbExercises: validExercises.length,
    durationTime: totalDurationMinutes,
  };
}
