import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { InputText } from "primereact/inputtext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTourneyStore } from "../../../../hooks";
import noLogo from "../../../../assets/img/noLogo.png";
import { SPORT } from "../../../../lib/formSelections";
import { PitcherPicker } from "./PitcherPicker";

const isEmpty = (value) => [null, undefined, ""].includes(value);

// One game: teams, score inputs, Save and (MLB) starting pitchers.
// The layout is a 3 column grid (team | score | team) that works from 320px up.
export const GameCard = ({
  game,
  legend,
  sport,
  canEdit = true,
  allowTie = false,
  onSaved,
  colClassName = "col-12 md:col-6",
}) => {
  const [score1, setScore1] = useState(game.score1 ?? "");
  const [score2, setScore2] = useState(game.score2 ?? "");
  const { startSaveGames } = useTourneyStore();

  useEffect(() => {
    setScore1(game.score1 ?? "");
    setScore2(game.score2 ?? "");
  }, [game.score1, game.score2]);

  const teamsReady = !!game.team1 && !!game.team2;
  const editable = canEdit && teamsReady;
  const played = !isEmpty(game.score1) && !isEmpty(game.score2);
  const unchanged =
    played && Number(score1) === game.score1 && Number(score2) === game.score2;
  const disabled =
    !editable ||
    isEmpty(score1) ||
    isEmpty(score2) ||
    (!allowTie && Number(score1) === Number(score2)) ||
    unchanged;

  const save = async () => {
    await startSaveGames(game.id, {
      score1: parseInt(score1),
      score2: parseInt(score2),
    });
    if (onSaved) await onSaved();
  };

  const team = (side) => {
    const current = game[`team${side}`];
    return (
      <div className="game-card__team">
        <Avatar image={current?.logoUrl ? current.logoUrl : noLogo} size="large" />
        <span className="game-card__name">{current ? current.teamName : "TBD"}</span>
        {current && <span className="game-card__player">({current.userName})</span>}
      </div>
    );
  };

  return (
    <div className={colClassName}>
      <div className="surface-card border-round shadow-1 p-3 h-full">
        <div className="game-card__header">
          <span>{legend}</span>
          {played && (
            <span className="text-green-600">
              <i className="pi pi-check-circle mr-1"></i>Played
            </span>
          )}
        </div>

        <div className="game-card__match">
          {team(1)}
          <div className="game-card__scores">
            <InputText
              type="number"
              inputMode="numeric"
              min={0}
              keyfilter={/[0-9]/}
              aria-label="Score team 1"
              value={score1}
              disabled={!editable}
              onChange={(e) => setScore1(e.target.value)}
            />
            <span className="font-bold">-</span>
            <InputText
              type="number"
              inputMode="numeric"
              min={0}
              keyfilter={/[0-9]/}
              aria-label="Score team 2"
              value={score2}
              disabled={!editable}
              onChange={(e) => setScore2(e.target.value)}
            />
          </div>
          {team(2)}
        </div>

        {sport === SPORT.MLB && teamsReady && (
          <div className="game-card__pitchers">
            <PitcherPicker gameId={game.id} side={1} disabled={!canEdit} />
            <PitcherPicker gameId={game.id} side={2} disabled={!canEdit} />
          </div>
        )}

        <div className="flex justify-content-center mt-3">
          <Button
            label="Save"
            icon="pi pi-check"
            size="small"
            rounded
            className="w-full md:w-auto"
            disabled={disabled}
            onClick={save}
          />
        </div>
      </div>
    </div>
  );
};

GameCard.propTypes = {
  game: PropTypes.object.isRequired,
  legend: PropTypes.string.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
  allowTie: PropTypes.bool,
  onSaved: PropTypes.func,
  colClassName: PropTypes.string,
};
