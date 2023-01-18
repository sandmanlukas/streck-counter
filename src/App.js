import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
//

// Pages and Components
import Home from "./Home";
import BasicNavbar from "./Navbar";
import Login from "./Login";

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <BasicNavbar />
        <Routes>
          <Route
            path="/"
            element={<Home />}
          ></Route>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;