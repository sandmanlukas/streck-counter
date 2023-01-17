// import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { useAuthContext } from "./hooks/useAuthContext";
import Dropdown from "./Dropdown";
import { checkResponse } from "./utils";
import { useLogout } from "./hooks/useLogout";
// import useState from 'react-usestateref';


export default function Stadstreck(props) {
  const [stadstreck, setStadstreck] = useState([
    { position: "Ordförande", position_number: 0, _id: "random_id_0" },
    { position: "Kassör", position_number: 1, _id: "random_id_1" },
  ]);
  const [nextCleaners, setNextCleaners] = useState([0, 1]);
  const { user } = useAuthContext();
  const { logout } = useLogout();

  // function that fetches next obligatory cleaners from database
  async function getNextObligatoryCleaners(limit, posNumber) {
    var firstCleanerPosNumber = -1;
    var secondCleanerPosNumber = -1;
    var body = {}

    // there exists two cases, 
    // first case: one obligatory cleaner, and one stadstreck cleaner
    // second case: there are two obligatory cleaners

    if (limit === 1) {
      body = {
        limit: limit,
        position_number: posNumber
      }
    } else {
      body = {
        limit: limit
      }
    }

    const nextObligatoryCleanerResponse = await fetch(
      `/streck/stadstreck/nextObligatoryCleaners/`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    if (!checkResponse(nextObligatoryCleanerResponse)) return;

    const nextObligatoryCleaners = await nextObligatoryCleanerResponse.json();

    firstCleanerPosNumber = nextObligatoryCleaners[0].position_number;

    if (limit === 2) {
      secondCleanerPosNumber = nextObligatoryCleaners[1].position_number;

      // if both PR and Ordf should clean, it should show PR first.
      if (secondCleanerPosNumber === 10 && firstCleanerPosNumber === 0) {
        return [secondCleanerPosNumber, firstCleanerPosNumber]
      }

      return [firstCleanerPosNumber, secondCleanerPosNumber]
    }

    return firstCleanerPosNumber;
  }

  // function that fetches the next stadstreck cleaners from database
  async function getNextStadstreckCleaners() {
    const nextStadstreckCleanersResponse = await fetch(
      `/streck/stadstreck/nextStadstreckCleaners`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    // logout if there is an error
    if (!checkResponse(nextStadstreckCleanersResponse)) {
      if (nextStadstreckCleanersResponse.status === 401) logout();
      return;
    }

    const nextStadstreckCleaners = await nextStadstreckCleanersResponse.json();

    const latestPosNumber = nextStadstreckCleaners[0].nextLatest;
    const mostPosNumber = nextStadstreckCleaners[0].nextMost;

    return [latestPosNumber, mostPosNumber];
  }

  // helper function that gets the next cleaners
  async function getNextCleaners() {
    var firstCleanerPosNumber = -1;
    var secondCleanerPosNumber = -1;

    const nextStadstreckCleaners = await getNextStadstreckCleaners();

    firstCleanerPosNumber = nextStadstreckCleaners[0];
    secondCleanerPosNumber = nextStadstreckCleaners[1];

    // if no stadstreck exists, get next two obligatory cleaners
    if (firstCleanerPosNumber === -1 && secondCleanerPosNumber === -1) {
      let nextCleaners = await getNextObligatoryCleaners(2);

      firstCleanerPosNumber = nextCleaners[0];
      secondCleanerPosNumber = nextCleaners[1];
      // if one obligatory cleaner exists and one stadstreck, get single next obligatory cleaner and stadstreck cleaner
    } else if (firstCleanerPosNumber >= 0 && secondCleanerPosNumber === -1) {
      let nextCleaner = await getNextObligatoryCleaners(1, firstCleanerPosNumber);


      secondCleanerPosNumber = nextCleaner;
    }
    setNextCleaners([firstCleanerPosNumber, secondCleanerPosNumber]);
  }

  // This method fetches the persons from the database.
  async function getStadstreck() {
    const response = await fetch(`/streck/fetchAll`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (!checkResponse(response)) {
      if (response.status === 401) logout();
      return;
    }

    const stadstreck = await response.json();
    setStadstreck(stadstreck);
  }

  useEffect(() => {
    const fetchData = async () => {
      await getStadstreck();
      await getNextCleaners();
      return;
    };
    if (user) {
      fetchData().catch(console.error);
    }
  }, [stadstreck.length, nextCleaners.length, user]);

  // updates database to correct next cleaner
  async function updateNextCleaner() {
    var latestPosNumber = -1;
    var mostPosNumber = -1;

    // Check who got the latest stadstreck
    const latestStadstreckResponse = await fetch(`/streck/stadstreck/latest`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (!checkResponse(latestStadstreckResponse)) return;

    const latestStadstreck = await latestStadstreckResponse.json();

    // If there is someone with latest stadstreck, check if there is someone else with most stadstreck
    if (latestStadstreck.length !== 0) {
      latestPosNumber = latestStadstreck[0].position_number;

      const mostStadstreckResponse = await fetch(
        `/streck/stadstreck/most/${latestPosNumber}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (!checkResponse(mostStadstreckResponse)) return;

      const mostStadstreck = await mostStadstreckResponse.json();

      // If there exists both a latest and a most stadstreck, update position numbers accordingly,
      // else update the next obligatory cleaner.
      if (mostStadstreck.length !== 0) {
        mostPosNumber = mostStadstreck[0].position_number;
      }
    }

    let nextStadstreckCleaners = {
      nextLatest: latestPosNumber,
      nextMost: mostPosNumber,
    };

    const updateNextStadstreckCleanersResponse = await fetch(
      `/streck/update/stadstreck/updateStadstreckCleaners`,
      {
        method: "POST",
        body: JSON.stringify(nextStadstreckCleaners),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (!checkResponse(updateNextStadstreckCleanersResponse)) return;
  }

  // function to remove stadstreck from someone in database
  async function removeClean(cleaner, cleanerStadstreck) {
    if (cleanerStadstreck > 0) {
      let editedPerson = {
        position_number: cleaner,
        value: -1,
      };

      const response = await fetch(`/streck/update/stadstreck`, {
        method: "POST",
        body: JSON.stringify(editedPerson),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!checkResponse(response)) return;
    }
  }

  // remove the current cleaners
  async function removeCurrentCleaners() {
    const firstCleaner = nextCleaners[0];
    const secondCleaner = nextCleaners[1];

    const firstCleanerStadstreck = stadstreck[firstCleaner].stadstreck;
    const secondCleanerStadstreck = stadstreck[secondCleaner].stadstreck;

    await removeClean(firstCleaner, firstCleanerStadstreck);
    await removeClean(secondCleaner, secondCleanerStadstreck);

  }

  // function to give stadstreck to selected persion
  async function giveStadstreck() {
    const currDate = new Date().toISOString();
    let response = {}

    // you can max get -1 stadstreck
    if (props.count === -1 && stadstreck[props.positionNumber].stadstreck < 0) {
      window.alert(`${stadstreck[props.positionNumber].position} har redan -1 städstreck.`);

      return
    }

    // check if negative stadstreck should be given
    if (stadstreck[props.positionNumber].obligatory_clean && props.count === -1) {
      await updateObligatoryCleaners(true)

    } else {


      let editedPerson = {
        position_number: props.positionNumber,
        value: props.count,
        date: currDate,
        update_total: props.count > 0 ? true : false
      };

      response = await fetch(`/streck/update/stadstreck`, {
        method: "POST",
        body: JSON.stringify(editedPerson),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!checkResponse(response)) return;
    }

    // fetch all
    await getStadstreck();
    // update who should clean next
    await updateNextCleaner();
    // get next cleaners
    await getNextCleaners();

  }

  async function onClickGive(e) {
    e.preventDefault();
    if (
      window.confirm(
        `Vill du verkligen ge ${stadstreck[props.positionNumber].position} ${props.count} städstreck?`
      )
    ) {
      await giveStadstreck();
      await getNextCleaners();
    }
    return;
  }

  // helper function to update obligatory cleaners in database
  async function sendUpdateObligatoryCleanersRequest(firstCleanerPosNumber, secondCleanerPosNumber) {
    const updateCleanerResponse = await fetch(
      `/streck/stadstreck/updateObligatoryCleaners/${firstCleanerPosNumber}/${secondCleanerPosNumber}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    if (!checkResponse(updateCleanerResponse)) return;
  }

  // function that updates obligatory cleaners
  async function updateObligatoryCleaners(negativeStreck) {
    const firstCleanerPosNumber = nextCleaners[0];
    const secondCleanerPosNumber = nextCleaners[1];


    const firstCleanerStadstreck =
      stadstreck[firstCleanerPosNumber].stadstreck;
    const secondCleanerStadstreck =
      stadstreck[secondCleanerPosNumber].stadstreck;

    // Negative stadstreck
    if (negativeStreck) {
      await sendUpdateObligatoryCleanersRequest(props.positionNumber, -1)
    }
    // No stadstreck
    else if (firstCleanerStadstreck < 1 && secondCleanerStadstreck < 1) {
      await sendUpdateObligatoryCleanersRequest(firstCleanerPosNumber, secondCleanerPosNumber)
      // One stadstreck and one not
    } else if (firstCleanerStadstreck > 0 && secondCleanerStadstreck < 1) {
      await sendUpdateObligatoryCleanersRequest(secondCleanerPosNumber, -1)
    }
  }

  async function onClickRemove(e) {
    e.preventDefault();

    if (window.confirm(`Vill du verkligen ta bort senaste städet?`)) {

      // update but without giving negative stadstreck
      await updateObligatoryCleaners(false);
      // remove current 
      await removeCurrentCleaners();
      // update database
      await updateNextCleaner();
      // get next cleaners
      await getNextCleaners();
      // fetch all
      await getStadstreck();
    }
    return;
  }

  return (
    <>
      <div className="stadstreck-div">
        <h2>Städstreck - Nästa städ: </h2>
        {nextCleaners.map((cleaner_position_number) => (
          <h4 key={stadstreck[cleaner_position_number]._id}>
            {stadstreck[cleaner_position_number].position}
          </h4>
        ))}
      </div>

      <h3 className="h3Stallning">Ställning</h3>
      {stadstreck.map((person) => (
        <div key={person._id}>
          <div className="row" >
            <div className="columnAntal" key={`antal_column_${person._id}`}>
              <p className="p">
                {person.position}:
              </p>
            </div>
            <div className="columnPosition">
              {JSON.stringify(person.stadstreck)}
            </div>
            <div className="columnTotal" key={`total_column_${person._id}`}>
              <p className="p">
                Totalt: {JSON.stringify(person.total_stadstreck)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {user.role === "admin" && (
        <>
          <Dropdown id="stadstreckDropdown"></Dropdown>
          <button onClick={onClickGive}> Ge Städstreck!</button>
          <button onClick={onClickRemove}> Avverka Städstreck!</button>
        </>
      )}
    </>
  );
}
