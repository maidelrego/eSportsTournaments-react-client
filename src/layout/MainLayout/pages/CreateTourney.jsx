import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useForm } from "../../../hooks/useForm";
import { useTourneyStore } from "../../../hooks/useTourneyStore";
import {
  onAddGame,
  onAddPlayer,
  onRemoveGame,
  onRemovePlayer,
  onSetType,
} from "../../../store/tourney/tourneySlice";

const initialForm = [
  {
    playerName: "",
    team: "",
  },
  {
    playerName: "",
    team: "",
  },
];

export const CreateTourney = () => {
  const {
    filteredCountries,
    startSearchTeam,
    typeOptions,
    dispatch,
    type,
    players,
    games,
  } = useTourneyStore();

  const [name, setName] = useState("");
  const { form, setForm, handleChange } = useForm(initialForm);

  const playerCountIncrement = () => {
    dispatch(onAddPlayer());
    setForm([
      ...form,
      {
        playerName: "",
        team: "",
      },
    ]);
  };

  const playerCountDecrement = () => {
    if (players === 2) {
      return;
    }
    dispatch(onRemovePlayer());
    setForm(form.slice(0, form.length - 1));
  };

  const search = async (event) => {
    startSearchTeam(event.query);
  };

  const incrementGamesCount = () => {
    if (games === 3) return;
    dispatch(onAddGame());
  };

  const decrementGamesCount = () => {
    if (games === 0) {
      return;
    }
    dispatch(onRemoveGame());
  };

  const itemTemplate = (item) => {
    return (
      <div className="flex align-items-center">
        <img
          alt={item.name}
          src={item.logo}
          className="mr-2"
          style={{ width: "18px" }}
        />
        <div>{item.name}</div>
      </div>
    );
  };
  

  // const onSaveTourney = () => {

  // }

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
            value={type}
            onChange={(e) => dispatch(onSetType(e.value))}
            options={typeOptions}
            optionLabel="name"
            placeholder="Select a Type"
            className="w-full md:w-20rem"
          />
        </div>
      </div>

      <div className="grid justify-content-center mt-5">
        <div className="col-12 md:col-6 mt-2">
          <span className="font-bold text-2xl text-color">
            Number of players
          </span>
        </div>

        <div className="col-6">
          <div className="p-inputgroup w-9rem">
            <Button icon="pi pi-minus" onClick={playerCountDecrement} />
            <InputText
              readOnly
              value={players}
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
              value={games}
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
      <div className="grid mt-5">
        <Button label="Submit" icon="pi pi-check" />
      </div>
    </>
  );
};
