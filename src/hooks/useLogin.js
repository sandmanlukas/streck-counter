import { useState } from "react";
import { useAuthContext } from "./useAuthContext";



export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  // function to login user
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    // query database
    const loginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const loginJson = await loginResponse.json();
    if (!loginResponse.ok) {
      setIsLoading(false);
      setError(loginJson.error);
    } else {
      // save user to localstorage
      localStorage.setItem("user", JSON.stringify(loginJson));

      // update auth context
      dispatch({ type: "LOGIN", payload: loginJson });

      setIsLoading(false);
    }
  };
  return { login, isLoading, error };
};
