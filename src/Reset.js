import { checkResponse } from "./utils";

// function to handle reset of database
export async function resetDatabase(user) {
  const updateCleanerResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/streck/reset`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  if (!checkResponse(updateCleanerResponse)) return;
}
