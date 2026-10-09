import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../../hooks";
import noLogo from "../../../../assets/img/noLogo.png";
import { SPORT } from "../../../../lib/formSelections";
import { PitcherPicker } from "./PitcherPicker";

const isEmpty = (value) => [null, undefined, ""].includes(value);

// One game with its score inputs, Save button and (MLB) starting pitchers. Used by the playoff series.
export const GameCard = ({ game, legend, sport, canEdit = true, onSaved, colClassName = "col-12 md:col-6" }) => {
  const [score1, setScore1] = useState(game.score1 ?? "");
  const [score2, setScore2] = useState(game.score2 ?? "");
  const { startSaveGames } = useTourneyStore();

  useEffect(() => {
    setScore1(game.score1 ?? "");
    setScore2(game.score2 ?? "");
  }, [game.score1, game.score2]);

  const played = !isEmpty(game.score1) && !isEmpty(game.score2);
  const unchanged =
    played && Number(score1) === game.score1 && Number(score2) === game.score2;
  const disabled =
    !canEdit ||
    isEmpty(score1) ||
    isEmpty(score2) ||
    Number(score1) === Number(score2) || // series games always have a winner
    unchanged;

  const save = async () => {
    await startSaveGames(game.id, {
      score1: parseInt(score1),
      score2: parseInt(score2),
    });
    if (onSaved) await onSaved();
  };

  const team = (side) => (
    <div className={`flex flex-column align-items-center justify-content-center ${side === 1 ? "mr-3" : "ml-3"}`}>
      <Avatar
        image={game[`team${side}`]?.logoUrl ? game[`team${side}`].logoUrl : noLogo}
        className="mb-2"
        size="large"
      />
      <span className="text-xs xl:text-xl">{game[`team${side}`]?.teamName}</span>
      <span className="mt-2 text-xs xl:text-lg">
        ({game[`team${side}`]?.userName})
      </span>
      {sport === SPORT.MLB && game[`team${side}`] && (
        <PitcherPicker
          gameId={game.id}
          side={side}
          disabled={!canEdit}
        />
      )}
    </div>
  );

  return (
    <div className={colClassName}>
      <Fieldset legend={legend} className="ma-0 pa-0">
        <div className="flex justify-content-center flex-wrap">
          {team(1)}
          <div>
            <div className="flex flex-wrap flex-row">
              <InputText
                type="number"
                keyfilter={/[0-9]/}
                className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                value={score1}
                disabled={!canEdit}
                onChange={(e) => setScore1(e.target.value)}
              />
              <span className="flex align-items-center justify-content-center mr-2 ml-2 xl:font-bold">
                -
              </span>
              <InputText
                type="number"
                keyfilter={/[0-9]/}
                className="p-inputtext-sm mt-6 mb-6 w-2rem xl:w-4rem text-center xl:text-4xl xl:font-bold"
                value={score2}
                disabled={!canEdit}
                onChange={(e) => setScore2(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap flex-row align-items-center justify-content-center">
              <Button
                label="Save"
                icon="pi pi-check"
                size="small"
                rounded
                disabled={disabled}
                onClick={save}
              />
            </div>
          </div>
          {team(2)}
        </div>
      </Fieldset>
    </div>
  );
};

GameCard.propTypes = {
  game: PropTypes.object.isRequired,
  legend: PropTypes.string.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
  onSaved: PropTypes.func,
  colClassName: PropTypes.string,
};
