import { checkResponse } from "./utils";

// function to handle reset of database
export async function resetDatabase(user) {
  const updateCleanerResponse = await fetch(`/streck/reset`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  if (!checkResponse(updateCleanerResponse)) return;
}
