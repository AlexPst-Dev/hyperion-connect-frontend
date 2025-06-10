import { SportsmanProfile } from "../models/user";
import { UserService } from "../services/api/user-service";

export async function addMedicToSportsman(
  sportsmanId: number,
  medicId: number,
  token: string
) {
  try {
    // Fetch current sportsman profile
    const sportsmanProfile = await UserService.getUserById(sportsmanId, token);
    const profile = sportsmanProfile.user.profile as SportsmanProfile;
    const currentList = profile?.listMedicsIds || "";

    console.log("Current list:", currentList);

    // Parse current medic IDs
    const currentIds = currentList
      ? currentList
          .split(";")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    console.log("Current IDs parsed:", currentIds);

    // Add new medic ID if not already present
    if (!currentIds.includes(medicId)) {
      currentIds.push(medicId);
      console.log(`Adding medic ID ${medicId} to sportsman ID ${sportsmanId}`);
    } else {
      console.log(
        `Medic ID ${medicId} already exists for sportsman ${sportsmanId}`
      );
      return true;
    }

    // Build updated list string with "; " separator and trailing semicolon
    const updatedList =
      currentIds.length > 0 ? currentIds.join("; ") + ";" : "";
    console.log("Updated list of medic IDs:", updatedList);

    // With PATCH, send only the field to update
    const updateData = {
      listMedicsIds: updatedList,
    };

    console.log("Updating with PATCH data:", updateData);

    // Update the sportsman profile with only the modified field
    await UserService.updateSportsman(sportsmanId, updateData, token);

    return true;
  } catch (error) {
    console.error("Error adding medic to sportsman:", error);
    return false;
  }
}
