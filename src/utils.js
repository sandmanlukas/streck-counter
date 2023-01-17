// helper function to check if a response from database is valid
export function checkResponse(response) {
  if (!response.ok) {
    console.log(response);
    let message = `An error occurred: ${response.statusText}`;
    window.alert(message);
    return false;
  }
  return true;
}

// helper function to check role of the logged in user.
export async function getRoleFromUser(user) {
  if (!user) {
    return;
  }
  const responseBody = { token: user.token };

  const roleResponse = await fetch(`/user/role`, {
    method: "POST",
    body: JSON.stringify(responseBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });

  const role = await roleResponse.json();
  return role.role;

}


