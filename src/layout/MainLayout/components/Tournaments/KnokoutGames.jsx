import PropTypes from "prop-types";
import { Accordion, AccordionTab } from "primereact/accordion";
import { AppSpinner } from "../../../../ui/components/AppSpinner";
import { useTourneyStore } from "../../../../hooks";
import { useParams } from "react-router-dom";
import { getKnokoutStages } from "../../../../helper/getKnokoutStages";
import { GameCard } from "./GameCard";

const isPlayed = (game) =>
  ![null, undefined].includes(game.score1) &&
  ![null, undefined].includes(game.score2);

export const KnokoutGames = ({ gamesList, sport, canEdit = true }) => {
  const { id = null } = useParams();
  const { startGetTournamentStandings, startGetGamesByTournament } = useTourneyStore();

  const refresh = async () => {
    await startGetTournamentStandings(id);
    await startGetGamesByTournament(id);
  };

  if (gamesList.length === 0) {
    return (
      <div className="grid mt-5">
        <AppSpinner loading={true} />
      </div>
    );
  }

  // first round first, and open the first round that still has a game to play
  const rounds = [...new Set(gamesList.map((game) => game.tournamentRoundText))].sort(
    (a, b) => Number(a) - Number(b)
  );
  const firstOpen = Math.max(
    rounds.findIndex((round) =>
      gamesList.some(
        (game) =>
          game.tournamentRoundText === round &&
          game.team1 &&
          game.team2 &&
          !isPlayed(game)
      )
    ),
    0
  );

  return (
    <div className="grid mt-3">
      <div className="col-12">
        <Accordion multiple activeIndex={[firstOpen]}>
          {rounds.map((round) => {
            const roundGames = gamesList.filter(
              (game) => game.tournamentRoundText === round
            );
            return (
              <AccordionTab
                header={getKnokoutStages(round, rounds.length)}
                key={round}
                className="mt-3"
              >
                <div className="grid mt-2">
                  {roundGames.map((game, index) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      legend={`Fixture ${index + 1}`}
                      sport={sport}
                      canEdit={canEdit}
                      onSaved={refresh}
                    />
                  ))}
                </div>
              </AccordionTab>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

KnokoutGames.propTypes = {
  gamesList: PropTypes.array.isRequired,
  sport: PropTypes.number,
  canEdit: PropTypes.bool,
};
