import React, { useState, useEffect } from "react";

const Dropdown = (props) => {
  const [selectedPosition, setSelectedPosition] = useState("Ordförande");
  const [selectedCount, setSelectedCount] = useState(1);
  const [options, setOptions] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  const positions = [
    "Ordförande",
    "Kassör",
    "Byggchef",
    "Bilchef",
    "Gårdvar",
    "Klädchef",
    "Programchef",
    "Annonschef",
    "Musikchef",
    "Ölchef",
    "PR-chef",
  ];

  function handleEvent(e) {
    setSelectedPosition(e.target.value)
  };

  function handleCountEvent(e) {
    setSelectedCount(parseInt(e.target.value))
  }

  useEffect(() => {
    // if sent from stadstreck dropdown
    if (props.id === "stadstreckDropdown") {
      // -1 stadstreck can be given
      const newOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1]
      setOptions(newOptions)
      // send stadstreck event
      const streckEvent = new CustomEvent('stadstreckPerson', { detail: { stadstreckPerson: selectedPosition, stadstreckCount: selectedCount } });
      document.body.dispatchEvent(streckEvent);

    } else if (props.id === "dumstreckDropdown") {
      // send dumstreck event
      const streckEvent = new CustomEvent('dumstreckPerson', { detail: { dumstreckPerson: selectedPosition, dumstreckCount: selectedCount } });
      document.body.dispatchEvent(streckEvent);
    }

  }, [selectedCount, selectedPosition, props.id])


  // creates two dropdowns, one for positions and one for count
  return (
    <>
      <h5>Post:</h5>
      <select value={selectedPosition} onChange={(e) => handleEvent(e)}>
        {positions.map((position) => (
          <option key={position} value={position}>
            {position}
          </option>
        ))}
      </select>
      <h5>Antal:</h5>
      <select value={selectedCount} onChange={(e) => handleCountEvent(e)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default Dropdown;
