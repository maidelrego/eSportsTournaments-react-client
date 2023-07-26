import { useState } from "react";
import validator from "validator";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../hooks/useTourneyStore";
import { Message } from "primereact/message";
import {
  tournamentTypeOptions,
  sportTypeOptions,
} from "../../../lib/formSelections";
import {
  onAddGame,
  onAddPlayer,
  onRemoveGame,
  onRemovePlayer,
  onFormChange,
  onDecrementTeams,
  onIncrementTeams,
} from "../../../store/tourney/tourneySlice";
import { gamesIsValid } from "../../../helper/gamesValidator";
import { setErrorToast } from "../../../store/ui/uiSlice";

const requestValidations = {
  tournamentName: [(value) => !validator.isEmpty(value), "Tournament name is required"],
  type: [(value) => value !== null, "Type is required"],
  sport: [(value) => value !== null, "Sport is required"],
  teams: [(value) => gamesIsValid(value), "Invalid teams"],
};

export const CreateTourney = () => {
  const [checkValidator, setCheckValidator] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);

  const {
    startSearchTeam,
    startSaveTourney,
    dispatch,
    tournamentName,
    type,
    sport,
    players,
    games,
    teams,
  } = useTourneyStore();

  const playerCountIncrement = () => {
    dispatch(onAddPlayer());
    dispatch(
      onIncrementTeams({
        playerName: "",
        teamName: "",
        logoUrl: "",
      })
    );
  };

  const playerCountDecrement = () => {
    if (players === 2) {
      return;
    }
    dispatch(onRemovePlayer());
    dispatch(onDecrementTeams());
  };

  const search = async (event) => {
    startSearchTeam(event.query).then((data) => {
      setFilteredTeams(data);
    });
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

  const onSaveTourney = () => {
    const request = {
      tournamentName,
      type,
      sport,
      games,
      teams,
    };

    const { checkValues, isValid } = validateRequest(
      request,
      requestValidations
    );

    setCheckValidator(checkValues);

    if (!isValid) {
      dispatch(setErrorToast('There are empty fields'));
      return;
    }

    startSaveTourney(request);
  };

  const validateRequest = (request, validations = {}) => {
    const checkValues = [];
    let isValid = true;

    for (const reqField of Object.keys(validations)) {
      const [fn, errorMessage = ""] = validations[reqField];

      if (fn(request[reqField])) {
        checkValues[reqField] = null;
      } else {
        isValid = false;
        checkValues[reqField] = errorMessage;
      }
    }

    return { checkValues, isValid };
  };

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
            placeholder="Tournament Name *"
            className={`w-full md:w-20rem ${
              checkValidator["tournamentName"] && checkValidator["tournamentName"] !== null
                ? "p-invalid"
                : ""
            }`}
            value={tournamentName}
            onChange={(e) => dispatch(onFormChange({ name: 'tournamentName', value: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid mt-1">
        <div className="col-12">
          <Dropdown
            value={sport}
            onChange={(e) => dispatch(onFormChange({ name: 'sport', value: e.target.value }))}
            options={sportTypeOptions}
            optionLabel="value"
            optionValue="key"
            placeholder="Game Type *"
            className={`w-full md:w-20rem ${
              checkValidator["sport"] && checkValidator["sport"] !== null
                ? "p-invalid"
                : ""
            }`}
          />
        </div>

        <div className="col-12">
          <Dropdown
            value={type}
            onChange={(e) => dispatch(onFormChange({ name: 'type', value: e.target.value }))}
            options={tournamentTypeOptions}
            optionLabel="value"
            optionValue="key"
            placeholder="Tournament Type *"
            className={`w-full md:w-20rem ${
              checkValidator["type"] && checkValidator["type"] !== null
                ? "p-invalid"
                : ""
            }`}
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
      
      {
        checkValidator["teams"] && checkValidator["teams"] !== null
          ? <Message className="mt-3 mb-2" severity="error" text="One or more teams is missing information" />
          : null
      }
      <div className="grid">
        {teams.map((item, index) => (
          <div className="col-12 md:col-3" key={index}>
            <Card className="createCard card p-fluid">
              <div className="field">
                <InputText
                  type="text"
                  placeholder="Player Name *"
                  value={teams[index].playerName}
                  onChange={(e) => dispatch(onFormChange({ name: 'playerName', value: e.target.value, index }))}
                />
              </div>
              <AutoComplete
                field="name"
                placeholder="Team Name *"
                value={teams[index].teamName}
                suggestions={filteredTeams}
                completeMethod={search}
                onChange={(e) => dispatch(onFormChange({ name: 'teamName', value: e.target.value, index }))}
                itemTemplate={itemTemplate}
              />
            </Card>
          </div>
        ))}
      </div>
      <div className="grid mt-5">
        <Button label="Submit" icon="pi pi-check" onClick={onSaveTourney} />
      </div>
    </>
  );
};
