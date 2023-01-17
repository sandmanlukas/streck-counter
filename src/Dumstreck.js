import { useState, useEffect } from "react";
import { useAuthContext } from "./hooks/useAuthContext";
import Dropdown from "./Dropdown";
import { checkResponse } from "./utils";
import { useLogout } from "./hooks/useLogout";

export default function Dumstreck(props) {
  const [dumstreck, setDumstreck] = useState([]);
  const { user } = useAuthContext();
  const { logout } = useLogout();

  // This method fetches the persons from the database.
  async function getDumstreck() {
    const response = await fetch(`/streck/fetchAll`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (!checkResponse(response)) {
      if (response.status === 401) logout();
      return;
    }

    const dumstreck = await response.json();
    setDumstreck(dumstreck);
  }

  useEffect(() => {
    const fetchData = async () => {
      await getDumstreck();
      return;
    };

    if (user) {
      fetchData().catch(console.error);
    }
  }, [dumstreck.length, user]);

  // handles the press of the button `Ge Dumstreck!`
  async function giveDumstreck() {
    if (
      window.confirm(
        `Vill du verkligen ge ${dumstreck[props.positionNumber].position} ${props.count} dumstreck?`
      )
    ) {
      const editedPerson = {
        position_number: props.positionNumber,
        value: props.count, //TODO: not a very nice way, perhaps change
        update_total: true
      };

      // updates database
      await updateDumstreck(editedPerson)
    }
    return;
  }

  // function to handle removal of dumstreck
  async function removeDumstreck() {
    if (
      window.confirm(
        `Vill du verkligen avverka ett dumstreck för ${dumstreck[props.positionNumber].position}?`
      )
    ) {
      const editedPerson = {
        position_number: props.positionNumber,
        value: -1,
        update_total: false
      };
      await updateDumstreck(editedPerson)
    }
    return;
  }

  // updates database with new dumstreck
  async function updateDumstreck(editedPerson) {
    // This will send a post request to update the data in the database.
    const response = await fetch(`/streck/update/dumstreck`, {
      method: "POST",
      body: JSON.stringify(editedPerson),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      console.log(response);
      const message = `An error has occurred: ${response.statusText}`;
      window.alert(message);
      return;
    }

    // fetch all records
    await getDumstreck();
  }



  async function onClickGive(e) {
    e.preventDefault();
    await giveDumstreck();
  }

  async function onClickRemove(e) {
    e.preventDefault();

    if (dumstreck[props.positionNumber].dumstreck === 0) {
      return;
    }

    await removeDumstreck();
  }

  return (
    <>
      <div className="stadstreck-div">
        <h2 >Dumstreck</h2>
      </div>
      <h3 className="h3Stallning">Ställning</h3>
      {dumstreck.map((person) => (
        <div key={person._id}>
          <div className="row" >
            <div className="columnAntal" key={`antal_column_${person._id}`}>
              <p className="p">
                {person.position}:
              </p>
            </div>
            <div className="columnPosition">
              {JSON.stringify(person.dumstreck)}
            </div>
            <div className="columnTotal" key={`total_column_${person._id}`}>
              <p className="p">
                Totalt: {JSON.stringify(person.total_dumstreck)}
              </p>
            </div>
          </div>
        </div>
      ))}
  
      {user.role === "admin" && (<>
        <Dropdown id="dumstreckDropdown"></Dropdown>
        <button onClick={onClickGive}> Ge Dumstreck!</button>
        <button onClick={onClickRemove}> Avverka Dumstreck!</button>
      </>)}
    </>
  );
}
