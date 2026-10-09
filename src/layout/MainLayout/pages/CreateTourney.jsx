import { useEffect, useState } from "react";
import validator from "validator";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../hooks/useTourneyStore";
import { Message } from "primereact/message";
import {
  onAddPlayer,
  onRemovePlayer,
  onFormChange,
  onDecrementTeams,
  onIncrementTeams,
} from "../../../store/tourney/tourneySlice";
import { gamesIsValid } from "../../../helper/gamesValidator";
import { setErrorToast } from "../../../store/ui/uiSlice";
import formSelections, { SPORT, TYPE, defaultPlayoffTeams } from "../../../lib/formSelections";

const tournamentTypeOptions = formSelections.tournamentTypeOptions;
const sportTypeOptions = formSelections.sportTypeOptions;
const numberOfTeamsInKnockout = formSelections.numberOfTeamsInKnockout;
const bestOfOptions = formSelections.bestOfOptions;

const requestValidations = {
  tournamentName: [
    (value) => !validator.isEmpty(value),
    "Tournament name is required",
  ],
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
    setKnokoutTeams,
    dispatch,
    tournamentName,
    type,
    numberOfTeams,
    sport,
    players,
    teams,
    playoffTeams,
    bestOf,
  } = useTourneyStore();

  // League and season share the "number of players" counter (a season needs at least 3).
  const hasPlayerCounter = type === TYPE.LEAGUE || type === TYPE.SEASON;
  const minPlayers = type === TYPE.SEASON ? 3 : 2;
  // null = automatic. Never more playoff teams than players.
  const effectivePlayoffTeams = Math.min(
    playoffTeams ?? defaultPlayoffTeams(players),
    players
  );
  const playoffTeamsOptions = Array.from(
    { length: Math.max(players - 1, 0) },
    (_, index) => ({ value: `${index + 2} teams`, key: index + 2 })
  );
  // Season + Playoffs only exists for MLB The Show
  const typeOptions = tournamentTypeOptions.filter(
    (option) => option.key !== TYPE.SEASON || sport === SPORT.MLB
  );

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

  const setKnockoutTeams = async (e) => {
    await dispatch(
      onFormChange({ name: "numberOfTeams", value: e.target.value })
    );
    setKnokoutTeams(e.target.value);
  };

  const playerCountDecrement = () => {
    if (players <= minPlayers) {
      return;
    }
    dispatch(onRemovePlayer());
    dispatch(onDecrementTeams());
  };

  const search = async (event) => {
    startSearchTeam(event.query, sport).then((data) => {
      setFilteredTeams(data);
    });
  };

  // Teams are sport specific (football clubs vs MLB clubs), so changing the sport clears the picks.
  const onSportChange = (e) => {
    const newSport = e.target.value;
    if (sport !== null && sport !== newSport) {
      teams.forEach((_, index) => {
        dispatch(onFormChange({ name: "teamName", value: "", index }));
      });
    }
    if (type === TYPE.SEASON && newSport !== SPORT.MLB) {
      dispatch(onFormChange({ name: "type", value: null }));
    }
    dispatch(onFormChange({ name: "sport", value: newSport }));
  };

  const onTypeChange = (e) => {
    const newType = e.target.value;
    if (newType === TYPE.SEASON && players < 3) {
      playerCountIncrement();
    }
    dispatch(onFormChange({ name: "type", value: newType }));
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
      teams,
      numberOfTeams,
      ...(type === TYPE.SEASON && {
        playoffTeams: effectivePlayoffTeams,
        bestOf,
      }),
    };

    const { checkValues, isValid } = validateRequest(
      request,
      requestValidations
    );

    setCheckValidator(checkValues);

    if (!isValid) {
      dispatch(setErrorToast("There are empty fields"));
      return;
    }

    delete request.numberOfTeams;

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

    if (request.type === 2) {
      if (!validator.isNumeric(String(request.numberOfTeams))) {
        isValid = false;
        checkValues["numberOfTeams"] = "Number of teams must be a valid number";
      } else {
        checkValues["numberOfTeams"] = null;
      }
    }

    return { checkValues, isValid };
  };

  useEffect(() => {
    if (type === TYPE.LEAGUE || type === TYPE.SEASON) {
      dispatch(onFormChange({ name: "numberOfTeams", value: null }));
    }
  }, [type, dispatch]);

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
              checkValidator["tournamentName"] &&
              checkValidator["tournamentName"] !== null
                ? "p-invalid"
                : ""
            }`}
            value={tournamentName}
            onChange={(e) =>
              dispatch(
                onFormChange({ name: "tournamentName", value: e.target.value })
              )
            }
          />
        </div>
      </div>
      <div className="grid mt-1">
        <div className="col-12">
          <Dropdown
            value={sport}
            onChange={onSportChange}
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
            onChange={onTypeChange}
            options={typeOptions}
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

        {type === 2 && (
          <div className="col-12">
            <Dropdown
              value={numberOfTeams}
              onChange={(e) => setKnockoutTeams(e)}
              options={numberOfTeamsInKnockout}
              optionLabel="value"
              optionValue="key"
              placeholder="Number of Teams *"
              className={`w-full md:w-20rem ${
                checkValidator["numberOfTeams"] &&
                checkValidator["numberOfTeams"] !== null
                  ? "p-invalid"
                  : ""
              }`}
            />
          </div>
        )}
      </div>

      {hasPlayerCounter && (
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
        </div>
      )}

      {type === TYPE.SEASON && (
        <div className="grid justify-content-center mt-2">
          <div className="col-12 md:col-6">
            <p className="text-color-secondary mt-0">
              Everybody plays everybody once, then the top teams go to the
              playoffs. Seeds without an opponent in the first round get a bye.
            </p>
          </div>
          <div className="col-12 md:col-3">
            <label className="block text-color font-medium mb-2">
              Playoff teams
            </label>
            <Dropdown
              value={effectivePlayoffTeams}
              onChange={(e) =>
                dispatch(
                  onFormChange({ name: "playoffTeams", value: e.target.value })
                )
              }
              options={playoffTeamsOptions}
              optionLabel="value"
              optionValue="key"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <label className="block text-color font-medium mb-2">
              Playoff series
            </label>
            <Dropdown
              value={bestOf}
              onChange={(e) =>
                dispatch(onFormChange({ name: "bestOf", value: e.target.value }))
              }
              options={bestOfOptions}
              optionLabel="value"
              optionValue="key"
              className="w-full"
            />
          </div>
        </div>
      )}

      {checkValidator["teams"] && checkValidator["teams"] !== null ? (
        <Message
          className="mt-5"
          severity="error"
          text="One or more teams is missing information"
        />
      ) : null}
      <div className="grid mt-2">
        {teams.map((item, index) => (
          <div className="col-12 md:col-3" key={index}>
            <Card className="createCard card p-fluid">
              <div className="field">
                <InputText
                  type="text"
                  placeholder="Player Name *"
                  value={teams[index].playerName}
                  onChange={(e) =>
                    dispatch(
                      onFormChange({
                        name: "playerName",
                        value: e.target.value,
                        index,
                      })
                    )
                  }
                />
              </div>
              <AutoComplete
                field="name"
                dropdown={sport === SPORT.MLB}
                placeholder="Team Name *"
                value={teams[index].teamName}
                suggestions={filteredTeams}
                completeMethod={search}
                onChange={(e) =>
                  dispatch(
                    onFormChange({
                      name: "teamName",
                      value: e.target.value,
                      index,
                    })
                  )
                }
                itemTemplate={itemTemplate}
              />
            </Card>
          </div>
        ))}
      </div>
      <div className="grid mt-5">
        <Button
          label="Create Tourney"
          className="w-full md:w-auto"
          icon="pi pi-check"
          onClick={onSaveTourney}
        />
      </div>
    </>
  );
};
