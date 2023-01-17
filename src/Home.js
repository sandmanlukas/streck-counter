import React from "react";
import { useState } from "react";
import { useAuthContext } from "./hooks/useAuthContext";
import Dumstreck from "./Dumstreck";
import Stadstreck from "./Stadstreck";


const Home = () => {
  const [dumstreckPositionNumber, setDumstreckPositionNumber] = useState(0);
  const [stadstreckPositionNumber, setStadstreckPositionNumber] = useState(0);

  const [dumstreckCount, setDumstreckCount] = useState(1);
  const [stadstreckCount, setStadstreckCount] = useState(1);

  // get logged in user
  const { user } = useAuthContext();

  const nameToNumber = {
    "Ordförande": 0,
    "Kassör": 1,
    "Byggchef": 2,
    "Bilchef": 3,
    "Gårdvar": 4,
    "Klädchef": 5,
    "Programchef": 6,
    "Annonschef": 7,
    "Musikchef": 8,
    "Ölchef": 9,
    "PR-chef": 10,
  };

  // add event listeners for the dropdowns
  document.body.addEventListener("dumstreckPerson", (event) => {
    setDumstreckPositionNumber(nameToNumber[event.detail.dumstreckPerson])
    setDumstreckCount(event.detail.dumstreckCount)
  });


  document.body.addEventListener("stadstreckPerson", (event) => {
    setStadstreckPositionNumber(nameToNumber[event.detail.stadstreckPerson])
    setStadstreckCount(event.detail.stadstreckCount)

  });


  // only logged in users can access
  if (user) {

    return (
      <div className="App">
        <div className="row">
          <div className="columnHome">
            <Stadstreck positionNumber={stadstreckPositionNumber} count={stadstreckCount}></Stadstreck>
          </div>
          <div className="columnHome">
            <Dumstreck positionNumber={dumstreckPositionNumber} count={dumstreckCount}></Dumstreck>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Du måste vara inloggad för att se denna sida.</h1>
        <img src="/aspa_ccc.png" alt="Aspa Chalmers Cortège Committé"></img>
      </div>
    )
  }
}

export default Home;
