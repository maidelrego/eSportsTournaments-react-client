import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { Button } from "primereact/button";
import { useForm } from "../../../hooks/useForm";
import { Card } from "primereact/card";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";

const initialForm = [
  {
    playerName: "",
    team: "",
  },
  {
    playerName: "",
    team: "",
  }
];

export const CreateTourney = () => {
  const [name, setName] = useState("");
  const [selectedType, setselectedType] = useState(null);
  const [gamesCount, setGamesCount] = useState(1);
  const { form, setForm, handleChange } = useForm(initialForm);
  const [playerCount, setPlayerCount] = useState(2);
  const [filteredCountries, setFilteredCountries] = useState(null);

  console.log("FORM", form);

  const playerCountIncrement = () => {
    setPlayerCount((prevCount) => prevCount + 1);
    setForm([
      ...form,
      {
        playerName: "",
        team: "",
      },
    ]);
  };

  const playerCountDecrement = () => {
    if (playerCount === 2) {
      return;
    }
    setPlayerCount((prevCount) => prevCount - 1);
    setForm(form.slice(0, form.length - 1));
  };

  const itemTemplate = (item) => {
    return (
      <div className="flex align-items-center">
        <img
          alt={item.name}
          src={item.logo}
          className='mr-2'
          style={{ width: "18px" }}
        />
        <div>{item.name}</div>
      </div>
    );
  };

  const search = async (event) => {
    const headers = {
      "x-rapidapi-key": "4ada01814adea2bb727b810423982de7",
      "x-rapidapi-host": "v3.football.api-sports.io",
    };

    const teams = await axios.get(
      `https://v3.football.api-sports.io/teams?search=${event.query}`,
      { headers }
    );

    console.log("TEAMS", teams.data.response);

    const teamsArray = teams.data.response.map((team) => {
      return {
        name: team.team.name,
        logo: team.team.logo,
      };
    });

    console.log("TEAMS ARRAY", teamsArray);

    setFilteredCountries(teamsArray);
  };

  const incrementGamesCount = () => {
    if (gamesCount === 3) return;
    setGamesCount((prevCount) => prevCount + 1);
  };

  const decrementGamesCount = () => {
    if (gamesCount === 0) {
      return;
    }
    setGamesCount((prevCount) => prevCount - 1);
  };

  const typeOptions = [
    { name: "League", code: 1 },
    { name: "Cup", code: 2 },
  ];

  return (
    <>
      <div className="grid">
        <div className="col-12 text-center">
          <h1 className="text-color">Create Tourney</h1>
        </div>
      </div>
      <div className="grid">
        <div className="col-12">
          <InputText
            type="text"
            placeholder="Name"
            className="w-full md:w-20rem"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="grid mt-1">
        <div className="col-12">
          <Dropdown
            value={selectedType}
            onChange={(e) => setselectedType(e.value)}
            options={typeOptions}
            optionLabel="name"
            placeholder="Select a Type"
            className="w-full md:w-20rem"
          />
        </div>
      </div>

      <div className="grid justify-content-center mt-5">
        <div className="col-12 md:col-6 mt-2">
          <span className="font-bold text-2xl text-color">Number of players</span>
        </div>

        <div className="col-6">
          <div className="p-inputgroup w-9rem">
            <Button icon="pi pi-minus" onClick={playerCountDecrement} />
            <InputText
              readOnly
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              pt={{
                root: { className: "text-center font-bold" },
              }}
            />
            <Button icon="pi pi-plus" onClick={playerCountIncrement} />
          </div>
        </div>

        <div className="col-12 md:col-6 mt-2">
          <span className="font-bold text-2xl text-color">
            Number of games against each team
          </span>
        </div>

        <div className="col-6">
          <div className="p-inputgroup w-9rem">
            <Button icon="pi pi-minus" onClick={decrementGamesCount} />
            <InputText
              readOnly
              value={gamesCount}
              onChange={(e) => setGamesCount(e.target.value)}
              pt={{
                root: { className: "text-center font-bold" },
              }}
            />
            <Button icon="pi pi-plus" onClick={incrementGamesCount} />
          </div>
        </div>
      </div>

      <div className="grid mt-5">
        {form.map((item, index) => (
          <div className="mr-2 col" key={index}>
            <Card className="createCard card p-fluid">
              <div className="field">
                <InputText
                  type="text"
                  placeholder="Name"
                  value={form[index].playerName}
                  name="playerName"
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
                <AutoComplete
                  field="name"
                  name="team"
                  placeholder="Team"
                  value={form[index].team}
                  suggestions={filteredCountries}
                  completeMethod={search}
                  onChange={(e) => handleChange(e, index)}
                  itemTemplate={itemTemplate}
                />
          
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};
