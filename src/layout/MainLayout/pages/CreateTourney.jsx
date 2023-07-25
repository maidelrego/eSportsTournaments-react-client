import { useState } from "react";
import validator from "validator";
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
  onSetSport,
} from "../../../store/tourney/tourneySlice";
import { gamesIsValid } from "../../../helper/gamesValidator";
import { setErrorToast } from "../../../store/ui/uiSlice";

const initialForm = [
  {
    playerName: "",
    team: "",
    logoUrl: "",
  },
  {
    playerName: "",
    team: "",
    logoUrl: "",
  },
];

const requestValidations ={
  name: [(value) => !validator.isEmpty(value),'Invalid Name' ],
  type: [(value) => value !== null,'Invalid type' ],
  sport:[(value) => value !== null,'Invalid sport' ],
  teams: [ (value) => gamesIsValid(value), 'Invalid teams' ],
}

export const CreateTourney = () => {
  const {
    filteredCountries,
    startSearchTeam,
    startSaveTourney,
    tourneyTypeOptions,
    sportTypeOptions,
    dispatch,
    type,
    sport,
    players,
    games,
  } = useTourneyStore();

  const [name, setName] = useState("");
  const [checkValidator, setCheckValidator] = useState([]);
  const { form, setForm, handleChange, onResetForm } = useForm(initialForm);

  const playerCountIncrement = () => {
    dispatch(onAddPlayer());
    setForm([
      ...form,
      {
        playerName: "",
        team: "",
        logoUrl: "",
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
  

  const onSaveTourney = () => {
    const request = {
      name,
      type,
      sport,
      games,
      teams:form
    }
   
    const {checkValues, isValid} = validateRequest(request, requestValidations)
    setCheckValidator(checkValues);
    
    if(!isValid){
      dispatch(setErrorToast('There are empty fields'));
      return;
    }
   
    startSaveTourney(request);
    onResetForm();
  }

  const validateRequest = ( request,validations = {} ) => {
      
    const checkValues = [];
    let isValid = true;

    for (const reqField of Object.keys(validations)) {
        
      const [fn,errorMessage = '' ] = validations[reqField];

      if(fn(request[reqField])){
        checkValues[reqField] = null; 
      }else{
        isValid = false;
        checkValues[reqField] = errorMessage;
      }
    }

    
    return {checkValues, isValid};
  }
  console.log('form', form);

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
            className={`w-full md:w-20rem ${checkValidator['name'] && checkValidator['name'] !== null ? 'p-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="grid mt-1">
        <div className="col-12">
          <Dropdown
            value={sport}
            onChange={(e) => dispatch(onSetSport(e.value))}
            options={sportTypeOptions}
            optionLabel="value"
            optionValue="key"
            placeholder="Game Type"
            className={`w-full md:w-20rem ${checkValidator['sport'] && checkValidator['sport'] !== null ? 'p-invalid' : ''}`}
          />
        </div>
        
        <div className="col-12">
          <Dropdown
            value={type}
            onChange={(e) => dispatch(onSetType(e.value))}
            options={tourneyTypeOptions}
            optionLabel="value"
            optionValue="key"
            placeholder="Tournament Type"
            className={`w-full md:w-20rem ${checkValidator['type'] && checkValidator['type'] !== null ? 'p-invalid' : ''}`}
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
          <div className="col-12 md:col-3" key={index}>
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
        <Button label="Submit" icon="pi pi-check" onClick={onSaveTourney} />
      </div>
    </>
  );
};
