import PropTypes from "prop-types";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Message } from "primereact/message";
import { useTourneyStore } from "../../../../hooks";
import { SingleElimination } from "./SingleEliminationBracket";
import { GameCard } from "./GameCard";
import { generateSeriesStructure } from "../../../../helper/generateEliminationStructure";
import { getPlayoffRoundName } from "../../../../helper/getPlayoffRoundName";
import { SPORT } from "../../../../lib/formSelections";

const isPlayed = (game) =>
  ![null, undefined].includes(game.score1) &&
  ![null, undefined].includes(game.score2);

const nextPowerOfTwo = (n) => {
  let power = 1;
  while (power < n) power *= 2;
  return power;
};

const teamLabel = (team, seed) =>
  team ? `${seed ? `(${seed}) ` : ""}${team.teamName} (${team.userName})` : "TBD";

export const Playoffs = ({ tournament, games, series, standings, canEdit }) => {
  const { startStartPlayoffs, startGetPlayoffSeries, startGetGamesByTournament } =
    useTourneyStore();

  const playoffTeams = tournament.playoffTeams;
  const regularGames = games.filter((game) => !game.seriesId);
  const regularPlayed = regularGames.filter(isPlayed).length;
  const seasonDone = regularGames.length > 0 && regularPlayed === regularGames.length;
  const byes = nextPowerOfTwo(playoffTeams) - playoffTeams;
  const seeds = standings
    .filter((row) => row.playoffSeed)
    .sort((a, b) => a.playoffSeed - b.playoffSeed);

  const refresh = async () => {
    await Promise.all([
      startGetPlayoffSeries(tournament.id),
      startGetGamesByTournament(tournament.id),
    ]);
  };

  const confirmStart = () => {
    confirmDialog({
      message: `The regular season is over. Start the playoffs with the top ${playoffTeams} teams? Regular season results will be locked.`,
      header: "Start playoffs",
      icon: "pi pi-info-circle",
      accept: () => startStartPlayoffs(tournament.id),
    });
  };

  // ---- before the playoffs ----
  if (series.length === 0) {
    return (
      <div className="mt-5">
        <ConfirmDialog />
        <h1 className="text-color text-center">Playoffs</h1>
        <p className="text-center text-color-secondary mt-0">
          Regular season: {regularPlayed}/{regularGames.length} games played. Top{" "}
          {playoffTeams} teams advance, every round is a best of{" "}
          {tournament.bestOf}.
          {byes > 0 &&
            ` Seed${byes > 1 ? "s 1 to " + byes : " 1"} get${byes > 1 ? "" : "s"} a first-round bye.`}
        </p>

        <h3 className="text-color">
          {seasonDone ? "Playoff seeds" : "Current playoff picture"}
        </h3>
        <ul className="list-none p-0 m-0">
          {seeds.map((row) => (
            <li key={row.teamId} className="py-2 flex align-items-center text-color">
              <span className="font-bold mr-3" style={{ width: "2rem" }}>
                #{row.playoffSeed}
              </span>
              <img
                src={row.team.logoUrl || undefined}
                alt=""
                className="mr-2"
                width="28"
              />
              <span>
                {row.team.teamName} ({row.team.userName})
              </span>
              <span className="ml-auto text-color-secondary">
                {row.wins}-{row.losses}
              </span>
            </li>
          ))}
        </ul>

        {seasonDone ? (
          canEdit ? (
            <Button
              className="mt-4"
              label="Start playoffs"
              icon="pi pi-play"
              onClick={confirmStart}
            />
          ) : (
            <Message
              className="mt-4"
              severity="info"
              text="Waiting for an admin to start the playoffs"
            />
          )
        ) : (
          <Message
            className="mt-4"
            severity="info"
            text="The playoffs can start when every regular season game is played"
          />
        )}
      </div>
    );
  }

  // ---- playoffs started ----
  const totalRounds = Math.max(...series.map((item) => item.round));
  const roundName = (round) => getPlayoffRoundName(round, totalRounds, playoffTeams);
  const rounds = [...new Set(series.map((item) => item.round))].sort((a, b) => a - b);
  const final = series.find((item) => !item.nextSeriesId);
  const champion =
    final?.winnerId &&
    [final.team1, final.team2].find((team) => team?.id === final.winnerId);

  const firstOpen = Math.max(
    rounds.findIndex((round) =>
      series.some(
        (item) =>
          item.round === round &&
          !item.winnerId &&
          games.some((game) => game.seriesId === item.id)
      )
    ),
    0
  );

  const renderSeries = (item) => {
    const seriesGames = games
      .filter((game) => game.seriesId === item.id)
      .sort((a, b) => a.gameNumber - b.gameNumber);
    const winner = item.winnerId && [item.team1, item.team2].find((team) => team?.id === item.winnerId);

    return (
      <div className="col-12" key={item.id}>
        <div className="surface-card shadow-1 border-round p-3">
          <div className="flex flex-wrap align-items-center justify-content-between">
            <span className="font-bold">
              {teamLabel(item.team1, item.seed1)} vs {teamLabel(item.team2, item.seed2)}
            </span>
            <span className="text-color-secondary">
              Best of {item.bestOf} · {item.wins1}-{item.wins2}
              {winner && ` · ${winner.teamName} advances`}
            </span>
          </div>
          {seriesGames.length > 0 ? (
            <div className="grid mt-2">
              {seriesGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  legend={`Game ${game.gameNumber}`}
                  sport={SPORT.MLB}
                  canEdit={canEdit}
                  onSaved={refresh}
                  colClassName="col-12"
                />
              ))}
            </div>
          ) : (
            <p className="text-color-secondary mb-0">
              Waiting for the winners of the previous round
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5">
      {champion && (
        <Message
          className="w-full mb-4"
          severity="success"
          text={`Champion: ${champion.teamName} (${champion.userName})`}
        />
      )}
      <SingleElimination
        simpleSmallBracket={generateSeriesStructure(series)}
        roundTextGenerator={(round) => roundName(round)}
      />
      <div className="mt-5">
        <Accordion multiple activeIndex={[firstOpen]}>
          {rounds.map((round) => {
            const roundSeries = series.filter((item) => item.round === round);
            const done = roundSeries.filter((item) => item.winnerId).length;
            return (
              <AccordionTab
                key={round}
                header={`${roundName(round)} (${done}/${roundSeries.length} series done)`}
                className="mt-3"
              >
                <div className="grid mt-2">{roundSeries.map(renderSeries)}</div>
              </AccordionTab>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

Playoffs.propTypes = {
  tournament: PropTypes.object.isRequired,
  games: PropTypes.array.isRequired,
  series: PropTypes.array.isRequired,
  standings: PropTypes.array.isRequired,
  canEdit: PropTypes.bool,
};
